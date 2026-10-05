/**
 * Apex Scholar AI router (Cloudflare Worker).
 *
 * Same task->model routing as netlify/functions/ai-proxy.js, but with a shared
 * KV exact cache in front (a hit = 0 tokens, 0 provider quota) and 100k req/day
 * of free headroom vs Netlify's 125k/month. The React client already calls this
 * as a drop-in: set REACT_APP_AI_PROXY_URL to the deployed Worker URL.
 *
 * Secrets (wrangler secret put): GEMINI_API_KEY, GEMINI_API_KEY_2 .. _11.
 * Bindings (wrangler.jsonc): KV namespace CACHE.
 *
 * ponytail: no Firebase-token verify / per-user quota here yet (the client
 * limiter still applies, and CORS is origin-locked). Add jose+JWKS verify if
 * abuse shows up. No semantic cache yet — exact only; add when hit-rate is low.
 */

const CORS_METHODS = 'POST, OPTIONS';

// Free-tier requests-per-day PER PROJECT, measured from AI Studio's rate-limit
// page (not guessed). This is the only number that matters for chain order:
//
//   gemma-4-*            14,400 RPD   30 RPM    16K TPM
//   gemini-3.x-flash-lite   500 RPD   15 RPM   250K TPM
//   every *-flash model      20 RPD    5 RPM   250K TPM   <-- 28x scarcer than Gemma
//
// Across ~11 projects that is ~158k/day on Gemma, ~11k/day on flash-lite, and
// ~220/day on any -flash model. `interactive` used to END on gemini-2.5-flash,
// so the busiest task in the app floored on the scarcest pool in the account.
// Every chain now ends on a deep pool.
export const MODEL_CHAINS = {
  // Written out in full, not composed from shared arrays: aiRouterCapacity.test.js
  // compares these three copies by parsing the source text, and a spread hides
  // the model names from it. Verbosity here buys a real drift check.
  //
  // Gemma is the TAIL of every chain, never the lead. Measured twice against
  // this app's own prompts:
  //   mcqGenerate (JSON):  gemma-4-31b-it 2/3 parsed, flash-lite 3/3
  //   explain     (prose): gemma-4-31b-it 0/3 clean,  flash-lite 3/3
  // Given a prompt shaped as an instruction list it restates the task as a plan
  // ("* Subject: AP Biology. * Question: ...") and calls that the answer. Every
  // prompt in this app is an instruction list. It still absorbs overflow at the
  // tail, where a 2-in-3 answer beats none.
  bulk:        ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  interactive: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  // FRQ grading is the one place output quality is worth the scarce pool, so
  // the newest -flash models lead and the lites catch the overflow.
  premium:     ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  // No Gemma. Gemma 4 is documented to accept images, but that is unverified
  // here and the solver is not the place to find out.
  vision:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
  verify:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
};

// Gemma's TPM ceiling is 16K against flash-lite's 250K. A prompt over roughly
// that size is a guaranteed 429 on Gemma, so trying it just burns a round trip.
const GEMMA_MAX_CHARS = 48_000; // ~12k tokens, leaving headroom for the reply
const isGemma = (m) => m.startsWith('gemma-');

/**
 * Cache-key normalization.
 *
 * The key was a hash of the raw request, so "explain photosynthesis",
 * "Explain photosynthesis." and "explain  photosynthesis" were three different
 * cache entries for one answer. Students ask the same thing in slightly
 * different words constantly, so the exact-match hit rate was far below what
 * the traffic could support.
 *
 * Only the CACHE KEY is normalized — the model still receives the student's
 * original wording, so nothing about the answer changes.
 */
export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")     // smart quotes
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/(?<!\d)\.(?!\d)/g, ' ')     // sentence periods go, 3.14 stays
    .replace(/[^\p{L}\p{N}\s'"+\-=/^_.]/gu, ' ')  // keep math-ish chars, drop the rest
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeForCache(contents) {
  if (!Array.isArray(contents)) return contents;
  return contents.map((c) => ({
    role: c?.role,
    parts: Array.isArray(c?.parts)
      ? c.parts.map((p) => (typeof p?.text === 'string' ? { text: normalizeText(p.text) } : p))
      : c?.parts,
  }));
}

/** true when this status means the MODEL is out, not this particular key. */
export const isModelScoped = (status) => status >= 500;

// Quota is per MODEL per PROJECT, so a key that has burned its 500 flash-lite
// requests still has all 14,400 of its Gemma budget. Remembering which (key,
// model) pairs are spent is what lets the router keep draining a key's other
// models instead of re-testing the dead one on every request.
//
// Module scope, so it lives as long as the isolate. Isolates don't share it —
// that is fine, each one converges within a few requests, and it costs no KV
// round trip on the hot path.
// ponytail: per-isolate memory; move to KV if the miss rate ever shows up in
// the logs as repeated 429s on the same pair.
const pairCooldown = new Map(); // `${keyIndex}:${model}` -> epoch ms
const PAIR_COOLDOWN_MAX = 4096;

/**
 * Seconds to wait, from a 429 response.
 *
 * Google does NOT send a `Retry-After` header on these — it puts the number in
 * the body as a RetryInfo detail (`"retryDelay": "26s"`). The header was being
 * read and always came back NaN, so every cooldown fell to the flat 60s default
 * and the client had no real number to show the student. Header first anyway,
 * in case it ever appears.
 */
export function retryDelaySeconds(headerValue, bodyText) {
  const fromHeader = parseInt(headerValue || '', 10);
  if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;
  const m = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(String(bodyText || ''));
  if (m) return Math.ceil(Number(m[1]));
  // A daily-quota 429 names the metric but carries no delay; it clears at
  // midnight Pacific, so a minute is the wrong answer — say an hour and let the
  // pair re-cool if it is still dead.
  if (/PerDay|per day/i.test(String(bodyText || ''))) return 3600;
  return 0;
}

/** A 429 whose body names a per-day quota (RPD), not a per-minute one. */
export function isDailyQuota(bodyText) {
  return /PerDay|per day/i.test(String(bodyText || ''));
}

/**
 * Seconds until midnight Pacific, when Google resets per-day quotas.
 *
 * A pair that has spent its daily requests is dead until then. Re-testing it
 * every hour (the old flat 3600s) cost a doomed round trip per pair per hour on
 * every isolate, and each of those is latency a student sits through.
 */
export function secondsUntilPacificMidnight(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(now));
  const get = (t) => Number((parts.find((p) => p.type === t) || {}).value || 0);
  const elapsed = (get('hour') % 24) * 3600 + get('minute') * 60 + get('second');
  return Math.max(60, 86400 - elapsed);
}

/**
 * The two flash-lite models have IDENTICAL free-tier limits (15 RPM, 500 RPD
 * per project), but every chain listed 3.1 first — so 3.1 took all the
 * traffic and hit its caps (peak 23/15 RPM, 620/500 RPD) while 3.5 idled at
 * 106 RPD. Splitting the head evenly doubles the headroom before the first
 * 429 instead of waiting to fail over.
 */
export const LITE_HEAD = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

export function balanceHead(models, rand = Math.random) {
  if (models[0] === LITE_HEAD[0] && models[1] === LITE_HEAD[1] && rand() < 0.5) {
    return [models[1], models[0], ...models.slice(2)];
  }
  return models;
}

/**
 * Final model order for one request.
 *   requested — honoured only when the task's chain would use it anyway. The
 *               app's picker sends "gemini-2.0-flash", whose free quota is
 *               0/0; putting it first made every request collect a 429 on up
 *               to five keys before real routing even began.
 *   avoid     — a model to push off the head (MCQ verification asks for a
 *               DIFFERENT model than the one that wrote the questions).
 */
export function orderModels(chain, { requested = null, avoid = null, rand = Math.random } = {}) {
  let models = balanceHead(chain.slice(), rand);
  if (requested && models.includes(requested)) {
    models = [requested, ...models.filter((m) => m !== requested)];
  }
  if (avoid && models.length > 1 && models[0] === avoid) {
    models = [models[1], avoid, ...models.slice(2)];
  }
  return models;
}

export function pairIsCooling(map, keyIdx, model, now) {
  return (map.get(`${keyIdx}:${model}`) || 0) > now;
}

export function coolPair(map, keyIdx, model, now, retryAfterSeconds) {
  // An RPM 429 clears in a minute; an RPD one lasts until midnight Pacific.
  // Google only tells us via retry-after, so trust it when present and use a
  // short default otherwise — a still-dead pair simply re-cools on next touch.
  const secs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? Math.min(retryAfterSeconds, 24 * 3600) // a spent daily quota waits for the Pacific-midnight reset
    : 60;
  if (map.size > PAIR_COOLDOWN_MAX) map.clear();
  map.set(`${keyIdx}:${model}`, now + secs * 1000);
}
export const TASK_TO_CHAIN = {
  tutorChat: 'interactive',
  // Review-card explanations, not live chat — see src/constants/modelChains.js.
  explain: 'bulk',
  solver: 'vision',
  // lessonTeach is batch content authoring, not chat: Gemma's unlimited TPM and
  // 15k RPD suit it better than flash-lite's scarcer 500 RPD.
  lessonTeach: 'bulk',
  // JSON out -> structured. Prose out -> bulk (Gemma's deep pool).
  mcqGenerate: 'bulk', practiceTest: 'bulk', flashcardGen: 'bulk',
  reviewCard: 'bulk', diagnostic: 'bulk',
  summarize: 'bulk',
  verifyMcq: 'verify',
  frqGrade: 'premium',
};

const norm = (m) => String(m || '').replace(/^models\//, '').replace(/^google\//, '');
const isGoogleModel = (m) => /^(gemini-|gemma-)/.test(m);
const versionFor = (m) => (/^(gemini-(2\.5|3)|gemma-)/.test(m) ? 'v1beta' : 'v1');

function cors(origin, allowed) {
  // Never fall back to '*'. If ALLOWED_ORIGINS is empty or unset, echoing a
  // wildcard would hand every site on the internet browser-level access to the
  // proxy; denying is the safe default. An unmatched origin gets the first
  // allowed origin, so the browser blocks it.
  const allow = allowed.includes(origin) ? origin : (allowed[0] || 'null');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': CORS_METHODS,
    // X-App-Token is NOT optional here. The worker gates every request on that
    // header (see the APP_TOKEN check below), but it was never listed as an
    // allowed request header — so as soon as APP_TOKEN was set, the browser
    // failed the preflight and blocked EVERY AI call from the deployed site:
    // "Request header field X-App-Token is not allowed by
    // Access-Control-Allow-Headers". The security check made the service
    // unreachable. The Netlify proxy has always allowed it; this copy drifted.
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-Token',
    // The worker names the model that actually answered in X-Apex-Model, and a
    // cross-origin response hides non-safelisted headers unless they are
    // exposed — without this the tutor's model attribution reads null in prod.
    // Retry-After is useless unless it is exposed: without it here the browser
    // hides the header from JS, res.headers.get('retry-after') returns null, and
    // every countdown falls back to a made-up 60 seconds.
    'Access-Control-Expose-Headers': 'X-Apex-Model, X-Apex-Cache, Retry-After, X-Apex-Tier',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  };
}

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function keysFrom(env) {
  const out = [];
  for (const n of ['', '_2', '_3', '_4', '_5', '_6', '_7', '_8', '_9', '_10', '_11']) {
    const k = env[`GEMINI_API_KEY${n}`];
    if (k) out.push(k);
  }
  return out;
}


// ---------------------------------------------------------------------------
// Identity.
//
// CORS only constrains browsers and APP_TOKEN is inlined in the public bundle,
// so until this existed the Worker was a free Gemini proxy for anyone who read
// main.<hash>.js. A Firebase ID token is the one credential a stranger cannot
// copy out of the bundle, and the client has been sending it all along.
//
// Two tiers, because guests legitimately use the AI tutor without an account:
//   verified uid -> every task, per-uid quota
//   no token     -> tutor chat only, text only, tighter per-IP quota
//
// Firebase anonymous auth was the obvious way to give guests a token and is
// worthless here: anyone can mint an anonymous account from the public web API
// key, unlimited times. It would add a step, not a boundary. It would also
// flip `user` truthy in AuthContext and silently unlock every GuestGate.
// ---------------------------------------------------------------------------

// '' is deliberate: several client paths omit `task`, and the router already
// treats a missing task as the `interactive` chain — the same chain tutorChat
// gets. Allowing it concedes nothing an attacker couldn't get by sending
// task:'tutorChat' anyway.
export const GUEST_TASKS = new Set(['tutorChat', '']);

const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let jwksCache = { keys: null, expires: 0 };

async function jwksKeys() {
  if (jwksCache.keys && Date.now() < jwksCache.expires) return jwksCache.keys;
  try {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error(`JWKS ${res.status}`);
    const { keys } = await res.json();
    // Google rotates these on its own schedule and publishes the lifetime in
    // Cache-Control; honour that instead of inventing a TTL.
    const maxAge = Number(
      (/(?:^|,)\s*max-age=(\d+)/.exec(res.headers.get('cache-control') || '') || [])[1] || 3600
    );
    jwksCache = { keys, expires: Date.now() + maxAge * 1000 };
    return keys;
  } catch (err) {
    // A JWKS blip must not demote every signed-in student to the guest tier
    // (that reads as "practice tests are broken"). Stale keys beat no keys:
    // Google keeps retired keys serving for far longer than this cache.
    if (jwksCache.keys) return jwksCache.keys;
    throw err;
  }
}

function b64urlBytes(s) {
  const b64 = String(s).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const b64urlJson = (s) => JSON.parse(new TextDecoder().decode(b64urlBytes(s)));

/**
 * The pure half of token verification, split out so it is testable without a
 * signing key. Every check here is load-bearing — in particular, dropping the
 * `aud`/`iss` checks would accept a genuinely Google-signed token minted for
 * any *other* Firebase project. The signature verifies; it just isn't ours.
 *
 * Returns null when the claims are good, otherwise a short reason string.
 */
export function verifyClaims(header, payload, projectId, nowSec) {
  const SKEW = 60; // clock drift between Google, Cloudflare's edge and us
  if (!projectId) return 'no project id configured';
  if (!header || header.alg !== 'RS256' || !header.kid) return 'bad header';
  if (!payload || typeof payload.sub !== 'string' || !payload.sub) return 'no subject';
  if (payload.aud !== projectId) return 'wrong audience';
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) return 'wrong issuer';
  if (!(Number(payload.exp) > nowSec - SKEW)) return 'expired';
  if (!(Number(payload.iat) <= nowSec + SKEW)) return 'issued in the future';
  return null;
}

/** Verified uid, or null. Never throws — a failure is just "not signed in". */
async function verifyIdToken(token, projectId) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  let header, payload;
  try {
    header = b64urlJson(parts[0]);
    payload = b64urlJson(parts[1]);
  } catch { return null; }
  if (verifyClaims(header, payload, projectId, Math.floor(Date.now() / 1000))) return null;

  let keys;
  try { keys = await jwksKeys(); } catch { return null; }
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  try {
    const key = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
    );
    const ok = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      b64urlBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    return ok ? payload.sub : null;
  } catch { return null; }
}

/**
 * Fixed-window counter in KV. Returns 0 when the call is allowed, otherwise the
 * seconds until the window rolls (which is what the client counts down).
 *
 * ponytail: KV is eventually consistent, so a burst fanned across colos can
 * overshoot the limit. Fine — this is an abuse ceiling, not a billing meter,
 * and aiUsageLimiter is the tighter number users actually feel.
 */
async function overQuota(env, key, limit, windowSec) {
  if (!env.CACHE || !limit) return 0;
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSec / windowSec);
  const k = `q:${key}:${bucket}`;
  const used = Number(await env.CACHE.get(k)) || 0;
  if (used >= limit) return Math.max(1, (bucket + 1) * windowSec - nowSec);
  await env.CACHE.put(k, String(used + 1), { expirationTtl: windowSec * 2 });
  return 0;
}

export default {
  async fetch(req, env) {
    const allowed = String(env.ALLOWED_ORIGINS || '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    const origin = req.headers.get('origin') || '';
    const headers = cors(origin, allowed);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);

    // Optional shared-token gate. CORS only stops browsers, so without this the
    // Worker is an open proxy anyone can curl to drain your free quota. Gated on
    // the APP_TOKEN secret — no-op until you set it (matches the Netlify proxy).
    // ponytail: token is bundle-public (deters casual curl abuse, not a
    // determined attacker); upgrade to Turnstile / per-user auth if abused.
    if (env.APP_TOKEN && req.headers.get('x-app-token') !== env.APP_TOKEN) {
      return json({ error: 'Unauthorized' }, 401, headers);
    }

    let payload;
    try { payload = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400, headers); }
    const { contents, generationConfig, safetySettings, task = '' } = payload;
    if (!Array.isArray(contents) || contents.length === 0) {
      return json({ error: '"contents" must be a non-empty array' }, 400, headers);
    }

    const API_KEYS = keysFrom(env);
    if (!API_KEYS.length) return json({ error: 'No API keys configured on the server.' }, 503, headers);

    const hasImage = contents.some(
      (c) => Array.isArray(c && c.parts) && c.parts.some((p) => p && (p.inline_data || p.inlineData))
    );

    // ---- Who is calling, and may they ----
    // Before the cache on purpose: a refused caller gets nothing at all, not
    // even a free hit off someone else's answer.
    const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.get('authorization') || '');
    const uid = bearer ? await verifyIdToken(bearer[1], env.FIREBASE_PROJECT_ID) : null;
    let quotaWait;
    if (uid) {
      // Mirrors AI_PROXY_5H_LIMIT in netlify/functions/ai-proxy.js, which
      // enforces the same ceiling per uid in Firestore.
      quotaWait = await overQuota(env, `u:${uid}`, Number(env.USER_QUOTA || 120), 5 * 60 * 60);
    } else {
      // An unverified caller is a guest — whether that's a real visitor on the
      // tutor page or someone who lifted the app token out of the bundle. Same
      // deal either way: chat only, no images (an image forces the `vision`
      // chain regardless of task, which is the expensive pool), per-IP ceiling.
      if (!GUEST_TASKS.has(task) || hasImage) {
        return json({ error: 'Sign in to use this feature.' }, 403, headers);
      }
      const ip = req.headers.get('cf-connecting-ip') || 'unknown';
      quotaWait = await overQuota(env, `g:${ip}`, Number(env.GUEST_QUOTA || 40), 60 * 60);
    }
    if (quotaWait) {
      return json({ error: 'AI usage limit reached', retryAfter: quotaWait }, 429, {
        ...headers,
        'Retry-After': String(quotaWait),
      });
    }
    headers['X-Apex-Tier'] = uid ? 'user' : 'guest';

    // ---- Cache (skip images: base64 blows up keys and rarely repeats) ----
    let cacheKey = null;
    if (!hasImage && env.CACHE) {
      cacheKey = await sha256(JSON.stringify({ contents: normalizeForCache(contents), generationConfig, task }));
      const hit = await env.CACHE.get(cacheKey);
      if (hit) return new Response(hit, { status: 200, headers: { ...headers, 'X-Apex-Cache': 'hit' } });
    }

    // ---- Task -> model chain, with an explicit Google model jumping the queue ----
    const chainName = hasImage ? 'vision' : (TASK_TO_CHAIN[task] || 'interactive');
    // A client-chosen model jumps the queue only if this chain would use it
    // anyway (see orderModels), and the flash-lite head is load-balanced.
    const requested = isGoogleModel(norm(payload.model)) ? norm(payload.model) : null;
    const avoid = isGoogleModel(norm(payload.avoidModel)) ? norm(payload.avoidModel) : null;
    let models = orderModels(MODEL_CHAINS[chainName], { requested, avoid });

    let lastErr = 'Service temporarily unavailable';
    // Random start spreads load across the ~10 key/projects (Worker isolates
    // don't share a rotation counter). Every non-2xx (except a genuine 400)
    // just tries the next key — a 403/404/429/5xx can be key-specific (a flaky
    // project), so we never abandon a model on one bad key. flash-lite is the
    // last entry in every chain, so the walk always reaches a working floor.
    const start = Math.floor(Math.random() * API_KEYS.length);
    const perModelKeys = Math.min(5, API_KEYS.length);
    // Drop models that cannot serve this request at all rather than discovering
    // it one failed round trip at a time.
    const payloadChars = JSON.stringify(contents).length;
    const usable = models.filter((m) => !(isGemma(m) && payloadChars > GEMMA_MAX_CHARS));
    if (usable.length) models = usable;

    // Tracked across the whole walk so a total failure can tell the client how
    // long to wait instead of leaving it to guess.
    let soonestRetry = null;
    let rateLimited = false;

    const now = Date.now();
    for (const m of models) {
      const version = versionFor(m);
      // Walk the whole ring, but only SPEND an attempt on a pair that isn't
      // already known to be out of quota. Skipping is free; a doomed request is
      // a round trip plus load on a service that just told us to back off.
      for (let i = 0, spent = 0; i < API_KEYS.length && spent < perModelKeys; i++) {
        const keyIdx = (start + i) % API_KEYS.length;
        if (pairIsCooling(pairCooldown, keyIdx, m, now)) continue;
        spent++;
        const key = API_KEYS[keyIdx];
        const url = `https://generativelanguage.googleapis.com/${version}/models/${m}:generateContent?key=${key}`;
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, generationConfig, safetySettings }),
          });
          if (!resp.ok) {
            if (resp.status === 400) {
              return new Response(await resp.text(), { status: 400, headers: { ...headers, 'X-Apex-Model': m } });
            }
            // A 5xx (503 UNAVAILABLE) means Google's capacity for THIS MODEL is
            // gone — every key sees it simultaneously. Verified directly: on one
            // key in one second, gemini-3.1-flash-lite returned 503 while five
            // other models returned 200. Walking the key ring here would fire
            // `perModelKeys` guaranteed-doomed requests into an already
            // overloaded model, which is exactly the wrong thing to do when
            // every other user is doing it too. Abandon the model instead.
            lastErr = `${m}: HTTP ${resp.status}`;
            if (isModelScoped(resp.status)) break;
            if (resp.status === 429) {
              // This project is out of quota for THIS model only. Remember it so
              // the next request spends its attempts on models this key can
              // still serve, and drop straight to the next key here.
              const errBody = await resp.text();
              const secs = retryDelaySeconds(resp.headers.get('retry-after'), errBody);
              // A spent daily quota stays spent until midnight Pacific. The
              // student-facing wait below still uses the short delay, since
              // another pair usually answers long before then.
              coolPair(pairCooldown, keyIdx, m, Date.now(), isDailyQuota(errBody) ? secondsUntilPacificMidnight() : secs);
              // Soonest moment ANY attempted pair frees up. This is what the
              // client counts down; without it the UI invents a number.
              const wait = secs > 0 ? secs : 60;
              if (soonestRetry === null || wait < soonestRetry) soonestRetry = wait;
              rateLimited = true;
            }
            continue; // 401/403/404/429 are key-scoped -> next key
          }
          const body = await resp.text();
          if (cacheKey) await env.CACHE.put(cacheKey, body, { expirationTtl: 60 * 60 * 24 * 30 });
          return new Response(body, { status: 200, headers: { ...headers, 'X-Apex-Model': m, 'X-Apex-Cache': 'miss' } });
        } catch (err) {
          lastErr = err.message;
        }
      }
    }
    // 429, not 502, when every failure was a rate limit: "busy, wait N seconds"
    // and "broken" need different words in front of a student, and only the
    // status code lets the client tell them apart.
    if (rateLimited) {
      const retryAfter = soonestRetry || 60;
      return json(
        { error: 'All models are rate limited right now', detail: lastErr, retryAfter },
        429,
        { ...headers, 'Retry-After': String(retryAfter) }
      );
    }
    return json({ error: 'All API attempts failed', detail: lastErr }, 502, headers);
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}
