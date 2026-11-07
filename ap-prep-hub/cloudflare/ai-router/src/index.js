/**
 * Apex Scholar AI router (Cloudflare Worker).
 *
 * Same task->model routing as netlify/functions/ai-proxy.js, but with a shared
 * KV exact cache in front (a hit = 0 tokens, 0 provider quota) and 100k req/day
 * of free headroom vs Netlify's 125k/month. The React client already calls this
 * as a drop-in: set REACT_APP_AI_PROXY_URL to the deployed Worker URL.
 *
 * Secrets (wrangler secret put): GEMINI_API_KEY, GEMINI_API_KEY_2 .. _11.
 * Bindings (wrangler.jsonc): KV namespace CACHE, Durable Object GOVERNOR.
 *
 * Per-user limits live in the Governor (below): one global Durable Object that
 * sizes each student's share from how much free capacity is left today and how
 * many people are asking for it. KV holds only the answer cache.
 * No semantic cache yet — exact only; add when hit-rate is low.
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
  bulk:        ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  interactive: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  // FRQ grading is the one place output quality is worth the scarce pool, so
  // the newest -flash models lead and the lites catch the overflow.
  premium:     ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  // No Gemma. Gemma 4 is documented to accept images, but that is unverified
  // here and the solver is not the place to find out.
  vision:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
  verify:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
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
    'Access-Control-Expose-Headers': 'X-Apex-Model, X-Apex-Cache, Retry-After, X-Apex-Tier, X-Apex-Load',
    // Without this the browser re-sends the OPTIONS preflight before nearly
    // every POST (Chrome's default is 5 seconds), so each AI call costs two
    // Worker requests against the daily request allowance. 7200 is Chrome's cap.
    'Access-Control-Max-Age': '7200',
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

// ---------------------------------------------------------------------------
// Load-adaptive admission: the Governor.
//
// The free keys are a fixed pool: about 12,000 good answers a day across the
// eleven projects (two flash-lite models at 500 RPD each, plus a few -flash
// requests), refilled at midnight Pacific, and roughly 330 requests a minute.
// Gemma's deep pool sits underneath, but it is overflow, not capacity (see
// MODEL_CHAINS). No setting makes that pool bigger, so the only lever is how
// it is shared:
//
//   quiet   -> nobody is limited below HOURLY_MAX; one student can use a lot.
//   busy    -> the pool left until midnight is split max-min fairly: light
//              users are never touched, heavy users are trimmed toward an
//              equal share, never below HOURLY_MIN.
//   slammed -> the whole site is held to RPM_CAPACITY per minute, and the
//              overflow gets a few-second "busy" wait instead of a pile of
//              doomed requests into Google.
//
// Replaced a KV counter per uid. KV on the free plan allows 1,000 writes a
// day, and that counter wrote on EVERY call, so the 500th AI call of the day
// made put() throw, the throw escaped fetch(), and every AI request failed
// with no CORS headers until 00:00 UTC. It also wrote the same key more than
// once a second for a classroom behind one IP, which KV rejects outright.
//
// One global Durable Object holds the counts, so every isolate in every colo
// sees the same numbers. If it is unreachable, each isolate falls back to its
// own GovernorState — weaker (it only sees its own traffic) but never a
// reason to refuse a student.
// ---------------------------------------------------------------------------

export const GOVERNOR_DEFAULTS = {
  dailyCapacity: 12000,  // good answers per Pacific day, all keys together
  rpmCapacity: 400,      // site-wide requests per minute (lets some overflow reach Gemma)
  hourlyMax: 60,         // a signed-in student's ceiling when the site is quiet
  hourlyMin: 6,          // ...and the floor when it is busy
  guestHourlyMax: 20,    // guests get a smaller share of the same pool
  guestHourlyMin: 3,
  burstPerMinute: 12,    // one practice test is ~13 calls spread over a few minutes
  // Guests are told apart by a random id their browser keeps, which anyone can
  // rotate, so all guests behind one IP also share this ceiling. It is sized
  // for a classroom on a school network, not for one person.
  groupHourlyMax: 400,
};

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const CAP_REFRESH_MS = 5000;
const MAX_CALLERS = 50000;
const MAX_COOLING = 2048;
const MAX_SESSIONS = 50000;

// Live load for the AI usage meter. Open tabs check in every 5 minutes, so a
// session counts as online for a little longer than that.
const PRESENCE_MS = 6.5 * MINUTE_MS;
const AI_ACTIVE_MS = 15 * MINUTE_MS;
// Rough calls per hour, for sizing up who just arrived before they've spent much.
const AI_USER_CALLS_PER_HOUR = 10;
const VISITOR_CALLS_PER_HOUR = 1;

/**
 * 0 = idle, 1 = today's pool can't keep up. Takes the higher of what the last
 * hour actually used and what the people here now would use, against what the
 * rest of today can sustain. Rounded so it doesn't flicker.
 */
export function loadFrom({ lastHour = 0, budget = 0, aiActive = 0, online = 0 }) {
  const forecast = aiActive * AI_USER_CALLS_PER_HOUR + Math.max(0, online - aiActive) * VISITOR_CALLS_PER_HOUR;
  const demand = Math.max(lastHour, forecast);
  if (!(budget > 0)) return demand > 0 ? 1 : 0;
  return Math.round(clamp(demand / budget, 0, 1) * 20) / 20;
}

export function governorConfig(env = {}) {
  const num = (name, fallback) => {
    const n = Number(env[name]);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const d = GOVERNOR_DEFAULTS;
  return {
    dailyCapacity: num('DAILY_CAPACITY', d.dailyCapacity),
    rpmCapacity: num('RPM_CAPACITY', d.rpmCapacity),
    hourlyMax: num('HOURLY_MAX', d.hourlyMax),
    hourlyMin: num('HOURLY_MIN', d.hourlyMin),
    guestHourlyMax: num('GUEST_HOURLY_MAX', d.guestHourlyMax),
    guestHourlyMin: num('GUEST_HOURLY_MIN', d.guestHourlyMin),
    burstPerMinute: num('BURST_PER_MINUTE', d.burstPerMinute),
    groupHourlyMax: num('GROUP_HOURLY_MAX', d.groupHourlyMax),
  };
}

/** Pacific calendar day, the unit Google's per-day quotas reset on. */
export function pacificDay(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(now));
}

/**
 * Weighted max-min fair cap. Each entry is { used, weight }; a caller's share
 * is weight * cap. Returns the largest cap such that
 *   sum(min(used, weight * cap)) <= budget,
 * or Infinity when everyone's usage already fits — then nobody is limited.
 *
 * This is what makes the limit track load: one student alone on the site is
 * never capped, and a thousand of them split what is left evenly, with the
 * people asking for less unaffected.
 */
export function fairCap(entries, budget) {
  const list = entries
    .filter((e) => e && e.used > 0 && e.weight > 0)
    .map((e) => ({ level: e.used / e.weight, used: e.used, weight: e.weight }))
    .sort((a, b) => a.level - b.level);
  const total = list.reduce((s, e) => s + e.used, 0);
  if (total <= budget) return Infinity;
  let spent = 0;
  let weightLeft = list.reduce((s, e) => s + e.weight, 0);
  for (const e of list) {
    const cap = Math.max(0, budget - spent) / weightLeft;
    if (e.level >= cap) return cap;
    spent += e.used;
    weightLeft -= e.weight;
  }
  return Infinity;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * The Governor's state, with no Cloudflare APIs in it so it can be tested and
 * reused as the per-isolate fallback. Every method takes `now` explicitly.
 */
export class GovernorState {
  constructor(cfg = GOVERNOR_DEFAULTS) {
    this.cfg = { ...GOVERNOR_DEFAULTS, ...cfg };
    this.callers = new Map();   // who -> { guest, hits: [ms, ...] } within the last hour
    this.groups = new Map();    // guest IP -> [ms, ...] within the last hour
    this.sessions = new Map();  // random tab id -> ms it last checked in
    this.minute = [];           // site-wide admissions within the last minute
    this.day = '';
    this.usedToday = 0;
    this.cooling = new Map();   // `${keyIdx}:${model}` -> ms until it may be tried again
    this.capCache = { at: -Infinity, cap: Infinity, budget: Infinity, lastHour: 0 };
    this.sweptAt = 0;
  }

  _roll(now) {
    const day = pacificDay(now);
    if (day !== this.day) {
      this.day = day;
      this.usedToday = 0;
      this.capCache.at = -Infinity;
    }
    while (this.minute.length && this.minute[0] <= now - MINUTE_MS) this.minute.shift();
    if (now - this.sweptAt > 30000) {
      this.sweptAt = now;
      for (const [who, rec] of this.callers) {
        if (!rec.hits.length || rec.hits[rec.hits.length - 1] <= now - HOUR_MS) this.callers.delete(who);
      }
      for (const [group, hits] of this.groups) {
        if (!hits.length || hits[hits.length - 1] <= now - HOUR_MS) this.groups.delete(group);
      }
      for (const [pair, until] of this.cooling) if (until <= now) this.cooling.delete(pair);
      for (const [sid, at] of this.sessions) if (at <= now - PRESENCE_MS) this.sessions.delete(sid);
    }
  }

  /** Good answers per hour the rest of today can sustain. */
  hourBudget(now) {
    const remaining = Math.max(0, this.cfg.dailyCapacity - this.usedToday);
    const hoursLeft = Math.max(1, secondsUntilPacificMidnight(now) / 3600);
    return remaining / hoursLeft;
  }

  _baseCap(now) {
    if (now - this.capCache.at < CAP_REFRESH_MS) return this.capCache.cap;
    const guestWeight = this.cfg.guestHourlyMax / this.cfg.hourlyMax;
    const entries = [];
    let lastHour = 0;
    for (const rec of this.callers.values()) {
      let used = 0;
      for (let i = rec.hits.length - 1; i >= 0 && rec.hits[i] > now - HOUR_MS; i--) used++;
      lastHour += used;
      entries.push({ used, weight: rec.guest ? guestWeight : 1 });
    }
    const budget = this.hourBudget(now);
    this.capCache = { at: now, cap: fairCap(entries, budget), budget, lastHour };
    return this.capCache.cap;
  }

  /** This caller's hourly allowance right now. */
  capFor(guest, now) {
    const base = this._baseCap(now);
    const c = this.cfg;
    if (guest) {
      const scaled = base === Infinity ? Infinity : Math.floor(base * (c.guestHourlyMax / c.hourlyMax));
      return clamp(scaled, c.guestHourlyMin, c.guestHourlyMax);
    }
    return clamp(Math.floor(base), c.hourlyMin, c.hourlyMax);
  }

  /** 0 = idle, 1 = burning today's pool exactly as fast as it can last. */
  pressure(now) {
    this._baseCap(now);
    const { budget, lastHour } = this.capCache;
    if (!(budget > 0)) return lastHour > 0 ? 1 : 0;
    return Math.min(1, lastHour / budget);
  }

  /** A tab checked in. Random id, memory only, gone after PRESENCE_MS. */
  heartbeat(sid, now = Date.now()) {
    this._roll(now);
    if (sid && (this.sessions.has(sid) || this.sessions.size < MAX_SESSIONS)) this.sessions.set(sid, now);
  }

  _counts(now) {
    let aiActive = 0;
    for (const rec of this.callers.values()) {
      if (rec.hits.length && rec.hits[rec.hits.length - 1] > now - AI_ACTIVE_MS) aiActive++;
    }
    let online = 0;
    for (const at of this.sessions.values()) if (at > now - PRESENCE_MS) online++;
    return { aiActive, online: Math.max(online, aiActive) };
  }

  /** The site's load right now. */
  load(now = Date.now()) {
    this._roll(now);
    this._baseCap(now);
    const { budget, lastHour } = this.capCache;
    return loadFrom({ lastHour, budget, ...this._counts(now) });
  }

  /**
   * Admit or refuse one AI call. Refusals carry the seconds until this caller
   * may try again and which limit applied, so the client can say something
   * truer than "busy":
   *   busy  — the whole site is at its per-minute ceiling (seconds)
   *   group — every guest on this IP together hit GROUP_HOURLY_MAX (minutes)
   *   burst — this caller sent too much in the last minute (seconds)
   *   share — this caller used their share of the hour (minutes)
   */
  admit({ who, guest = false, group = null } = {}, now = Date.now()) {
    this._roll(now);
    const c = this.cfg;
    if (this.minute.length >= c.rpmCapacity) {
      // Spread the retries over a few seconds so the next minute does not
      // open with the same stampede.
      const wait = Math.ceil((this.minute[0] + MINUTE_MS - now) / 1000) + Math.floor(Math.random() * 5);
      return { ok: false, scope: 'busy', retryAfter: Math.max(1, wait) };
    }
    let groupHits = null;
    if (group) {
      groupHits = this.groups.get(group) || [];
      while (groupHits.length && groupHits[0] <= now - HOUR_MS) groupHits.shift();
      if (groupHits.length >= c.groupHourlyMax) {
        const gate = groupHits[groupHits.length - c.groupHourlyMax];
        return { ok: false, scope: 'group', retryAfter: Math.max(1, Math.ceil((gate + HOUR_MS - now) / 1000)) };
      }
    }
    const id = String(who || 'unknown');
    let rec = this.callers.get(id);
    if (!rec) {
      if (this.callers.size >= MAX_CALLERS) {
        this.sweptAt = 0; // force the idle-caller sweep before growing further
        this._roll(now);
      }
      rec = { guest: !!guest, hits: [] };
      this.callers.set(id, rec);
    }
    while (rec.hits.length && rec.hits[0] <= now - HOUR_MS) rec.hits.shift();

    let inMinute = 0;
    for (let i = rec.hits.length - 1; i >= 0 && rec.hits[i] > now - MINUTE_MS; i--) inMinute++;
    if (inMinute >= c.burstPerMinute) {
      const oldest = rec.hits[rec.hits.length - inMinute];
      return { ok: false, scope: 'burst', retryAfter: Math.max(1, Math.ceil((oldest + MINUTE_MS - now) / 1000)) };
    }

    const cap = this.capFor(rec.guest, now);
    if (rec.hits.length >= cap) {
      // The hit that has to age out before this caller is back under the cap.
      const gate = rec.hits[rec.hits.length - cap];
      return { ok: false, scope: 'share', cap, retryAfter: Math.max(1, Math.ceil((gate + HOUR_MS - now) / 1000)) };
    }

    rec.hits.push(now);
    if (groupHits) {
      groupHits.push(now);
      this.groups.set(group, groupHits);
    }
    this.minute.push(now);
    this.usedToday++;
    return { ok: true, cap, pressure: Math.round(this.pressure(now) * 100) / 100 };
  }

  /** Pairs another isolate found out of quota, so nobody re-learns them. */
  report(events, now = Date.now()) {
    if (!Array.isArray(events)) return;
    for (const e of events.slice(0, 64)) {
      if (!e || typeof e.pair !== 'string' || !(e.until > now)) continue;
      const until = Math.min(e.until, now + 24 * HOUR_MS);
      if ((this.cooling.get(e.pair) || 0) < until) this.cooling.set(e.pair, until);
    }
    if (this.cooling.size > MAX_COOLING) this.cooling.clear();
  }

  coolingList(now = Date.now()) {
    const out = [];
    for (const [pair, until] of this.cooling) if (until > now) out.push([pair, until]);
    return out;
  }

  stats(now = Date.now()) {
    this._roll(now);
    this.capCache.at = -Infinity; // a dashboard read should not show a 5 s old number
    this._baseCap(now);
    return {
      day: this.day,
      usedToday: this.usedToday,
      dailyCapacity: this.cfg.dailyCapacity,
      lastMinute: this.minute.length,
      lastHour: this.capCache.lastHour,
      hourBudget: Math.round(this.capCache.budget),
      activeCallers: this.callers.size,
      userCap: this.capFor(false, now),
      guestCap: this.capFor(true, now),
      pressure: Math.round(this.pressure(now) * 100) / 100,
      coolingPairs: this.coolingList(now).length,
      ...this._counts(now),
      load: this.load(now),
    };
  }

  /** What survives a Durable Object restart: today's spend and dead pairs. */
  snapshot(now = Date.now()) {
    return { day: this.day, usedToday: this.usedToday, cooling: this.coolingList(now) };
  }

  restore(snap, now = Date.now()) {
    if (!snap || typeof snap !== 'object') return;
    if (snap.day === pacificDay(now)) {
      this.day = snap.day;
      this.usedToday = Number(snap.usedToday) || 0;
    }
    this.report((snap.cooling || []).map(([pair, until]) => ({ pair, until })), now);
  }
}

/**
 * The Durable Object. One instance ("global") serves the whole site; at this
 * app's scale that is a few dozen requests a second against a ceiling in the
 * hundreds. Counts live in memory and today's spend is saved every 30 seconds,
 * so a restart cannot hand out the day's pool a second time.
 */
export class Governor {
  constructor(state, env) {
    this.state = state;
    this.gov = new GovernorState(governorConfig(env));
    this.savedAt = 0;
    state.blockConcurrencyWhile(async () => {
      try {
        const snap = await state.storage.get('snapshot');
        if (snap) this.gov.restore(snap, Date.now());
      } catch { /* a fresh day is a safe default */ }
    });
  }

  async fetch(request) {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400, {}); }
    const now = Date.now();
    let out;
    if (body.op === 'admit') {
      out = { ...this.gov.admit(body, now), cooling: this.gov.coolingList(now) };
    } else if (body.op === 'report') {
      this.gov.report(body.events, now);
      out = { ok: true };
    } else if (body.op === 'stats') {
      out = this.gov.stats(now);
    } else if (body.op === 'load') {
      this.gov.heartbeat(body.sid, now);
      out = { load: this.gov.load(now) };
    } else {
      return json({ error: 'Unknown op' }, 400, {});
    }
    if (now - this.savedAt > 30000) {
      this.savedAt = now;
      try { await this.state.storage.put('snapshot', this.gov.snapshot(now)); } catch { /* next save retries */ }
    }
    return json(out, 200, { 'Content-Type': 'application/json' });
  }
}

// Per-isolate stand-in for when the Durable Object is unbound or unreachable.
let localGovernor = null;

/** Ask the global Governor. null means "decide locally"; it never throws. */
async function askGovernor(env, body, timeoutMs = 1500) {
  if (!env.GOVERNOR) return null;
  try {
    const stub = env.GOVERNOR.get(env.GOVERNOR.idFromName('global'));
    const call = stub.fetch('https://governor/', { method: 'POST', body: JSON.stringify(body) })
      .then((res) => (res.ok ? res.json() : null));
    let timer;
    const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs); });
    try {
      return await Promise.race([call, timeout]);
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

async function admitCall(env, who, guest, group) {
  const verdict = await askGovernor(env, { op: 'admit', who, guest, group });
  if (verdict && typeof verdict.ok === 'boolean') {
    // Share what every other isolate has learned about dead (key, model) pairs.
    for (const [pair, until] of verdict.cooling || []) {
      if ((pairCooldown.get(pair) || 0) < until) pairCooldown.set(pair, until);
    }
    return verdict;
  }
  if (!localGovernor) localGovernor = new GovernorState(governorConfig(env));
  return localGovernor.admit({ who, guest, group }, Date.now());
}

// ---------------------------------------------------------------------------
// Upstream time limits.
//
// Measured 2026-10-24 with a five-token prompt on all eleven keys: nine
// answered in 0.5-2 s, one took 12.7 s, one took 61.6 s, and one returned 503.
// With no timeout the router sat on the 61 s answer while the client's own
// 90 s timer ran out, so the student saw "took too long" although ten other
// keys were idle. Each attempt now gets a ceiling sized to the chain's output,
// and the whole walk stops before the client gives up on it.
// ---------------------------------------------------------------------------
export const ATTEMPT_TIMEOUT_MS = {
  interactive: 25000,
  verify: 45000,
  bulk: 60000,
  vision: 90000,
  premium: 120000,
};
const DEFAULT_BUDGET_MS = 85000;     // the client aborts at 90 s unless it says otherwise
const MAX_BUDGET_MS = 175000;        // FRQ grading asks for 180 s
// Free-plan Workers may make 50 subrequests per request. JWKS, the Governor and
// KV need a few; eleven models times five keys would need 55.
const MAX_UPSTREAM_ATTEMPTS = 12;

/** How long the walk may run, from the client's own deadline (payload.budgetMs). */
export function walkBudgetMs(requested) {
  const n = Number(requested);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_BUDGET_MS;
  return clamp(n, 10000, MAX_BUDGET_MS);
}

// Only tasks whose answers repeat across students are worth a KV write: the
// free plan allows 1,000 a day, and a multi-turn tutor history or a student's
// own FRQ never repeats. A first tutor message often does ("explain
// photosynthesis"), so single-turn tutorChat is cached too.
const CACHE_TASKS = new Set(['explain', 'reviewCard', 'lessonTeach']);
export function isCacheable(task, contents) {
  if (CACHE_TASKS.has(task)) return true;
  return (task === 'tutorChat' || task === '') && Array.isArray(contents) && contents.length === 1;
}

export default {
  async fetch(req, env, ctx) {
    const allowed = String(env.ALLOWED_ORIGINS || '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    const origin = req.headers.get('origin') || '';
    const headers = cors(origin, allowed);
    // Work that must not hold up (or fail) the student's answer.
    const later = (p) => {
      const safe = Promise.resolve(p).catch(() => {});
      if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(safe);
    };

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    // Launch-day dashboard: aggregate load numbers only, no uids or IPs.
    // Off unless STATS_TOKEN is set; then GET /stats?token=<STATS_TOKEN>.
    if (req.method === 'GET' && new URL(req.url).pathname === '/stats') {
      const token = new URL(req.url).searchParams.get('token');
      if (!env.STATS_TOKEN || token !== env.STATS_TOKEN) return json({ error: 'Not found' }, 404, headers);
      const stats = await askGovernor(env, { op: 'stats' });
      return json(stats || { error: 'Governor unreachable' }, stats ? 200 : 503, headers);
    }
    // Open tabs poll this for the usage meter. Only one number comes back, never
    // the head counts, and a tab only counts as online from an allowed origin.
    // ponytail: no token, so a script could inflate the count, but that only
    // moves costs up to each task's maximum; add a per-IP limit if it's abused.
    if (req.method === 'GET' && new URL(req.url).pathname === '/load') {
      const raw = new URL(req.url).searchParams.get('s') || '';
      const sid = allowed.includes(origin) && /^[a-z0-9]{8,32}$/.test(raw) ? raw : null;
      let out = await askGovernor(env, { op: 'load', sid });
      if (!out) {
        if (!localGovernor) localGovernor = new GovernorState(governorConfig(env));
        localGovernor.heartbeat(sid, Date.now());
        out = { load: localGovernor.load(Date.now()) };
      }
      return json({ load: out.load }, 200, { ...headers, 'Cache-Control': 'no-store' });
    }
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
    if (!uid) {
      // An unverified caller is a guest — whether that's a real visitor on the
      // tutor page or someone who lifted the app token out of the bundle. Same
      // deal either way: chat only, no images (an image forces the `vision`
      // chain regardless of task, which is the expensive pool), smaller share.
      if (!GUEST_TASKS.has(task) || hasImage) {
        return json({ error: 'Sign in to use this feature.' }, 403, headers);
      }
    }
    headers['X-Apex-Tier'] = uid ? 'user' : 'guest';

    // ---- Cache (skip images: base64 blows up keys and rarely repeats) ----
    // A hit costs no Gemini quota, so it is served even to a caller who is
    // over their share. Every KV call is best-effort: on the free plan reads
    // stop at 100,000 a day and writes at 1,000, and running out must cost
    // the cache, never the answer.
    let cacheKey = null;
    if (!hasImage && env.CACHE && isCacheable(task, contents)) {
      try {
        cacheKey = await sha256(JSON.stringify({ contents: normalizeForCache(contents), generationConfig, task }));
        const hit = await env.CACHE.get(cacheKey);
        if (hit) return new Response(hit, { status: 200, headers: { ...headers, 'X-Apex-Cache': 'hit' } });
      } catch { /* KV unavailable or over its daily limit — answer uncached */ }
    }

    // ---- Load-adaptive share (see the Governor) ----
    // A guest is their browser's random id within their IP, so thirty students
    // on one school network each get a share instead of splitting one.
    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    const guestId = typeof payload.guestId === 'string' ? payload.guestId.replace(/[^\w-]/g, '').slice(0, 40) : '';
    const who = uid ? `u:${uid}` : `g:${ip}:${guestId}`;
    const verdict = await admitCall(env, who, !uid, uid ? null : `ip:${ip}`);
    if (!verdict.ok) {
      const retryAfter = verdict.retryAfter || 60;
      return json({ error: 'AI usage limit reached', scope: verdict.scope, retryAfter }, 429, {
        ...headers,
        'Retry-After': String(retryAfter),
      });
    }
    if (Number.isFinite(verdict.pressure)) headers['X-Apex-Load'] = String(verdict.pressure);

    // ---- Task -> model chain, with an explicit Google model jumping the queue ----
    // Same rule as imageChainFor() in src/constants/modelChains.js: images use `vision`
    // except FRQ grading, which keeps premium's order minus Gemma.
    const baseChain = TASK_TO_CHAIN[task] || 'interactive';
    const chainName = hasImage && baseChain !== 'premium' ? 'vision' : baseChain;
    // A client-chosen model jumps the queue only if this chain would use it
    // anyway (see orderModels), and the flash-lite head is load-balanced.
    const requested = isGoogleModel(norm(payload.model)) ? norm(payload.model) : null;
    const avoid = isGoogleModel(norm(payload.avoidModel)) ? norm(payload.avoidModel) : null;
    let models = orderModels(MODEL_CHAINS[chainName].filter((m) => !(hasImage && m.startsWith('gemma-'))), { requested, avoid });

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
    const deadline = now + walkBudgetMs(payload.budgetMs);
    const attemptCap = ATTEMPT_TIMEOUT_MS[chainName] || ATTEMPT_TIMEOUT_MS.interactive;
    let attempts = 0;
    let timedOut = false;
    // (key, model) pairs this request found dead, for every other isolate.
    const learned = [];
    const remember = (keyIdx, m, secs) => {
      coolPair(pairCooldown, keyIdx, m, Date.now(), secs);
      learned.push({ pair: `${keyIdx}:${m}`, until: pairCooldown.get(`${keyIdx}:${m}`) });
    };
    const finish = (response) => {
      if (learned.length) later(askGovernor(env, { op: 'report', events: learned }));
      return response;
    };

    walk:
    for (const m of models) {
      const version = versionFor(m);
      // Walk the whole ring, but only SPEND an attempt on a pair that isn't
      // already known to be out of quota. Skipping is free; a doomed request is
      // a round trip plus load on a service that just told us to back off.
      for (let i = 0, spent = 0; i < API_KEYS.length && spent < perModelKeys; i++) {
        const keyIdx = (start + i) % API_KEYS.length;
        if (pairIsCooling(pairCooldown, keyIdx, m, now)) continue;
        spent++;
        const left = deadline - Date.now();
        if (++attempts > MAX_UPSTREAM_ATTEMPTS || left < 2000) break walk;
        const key = API_KEYS[keyIdx];
        const url = `https://generativelanguage.googleapis.com/${version}/models/${m}:generateContent?key=${key}`;
        let resp;
        try {
          resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, generationConfig, safetySettings }),
            signal: AbortSignal.timeout(Math.min(attemptCap, left)),
          });
          if (!resp.ok) {
            if (resp.status === 400) {
              return finish(new Response(await resp.text(), { status: 400, headers: { ...headers, 'X-Apex-Model': m } }));
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
              learned.push({ pair: `${keyIdx}:${m}`, until: pairCooldown.get(`${keyIdx}:${m}`) });
              // Soonest moment ANY attempted pair frees up. This is what the
              // client counts down; without it the UI invents a number.
              const wait = secs > 0 ? secs : 60;
              if (soonestRetry === null || wait < soonestRetry) soonestRetry = wait;
              rateLimited = true;
            }
            continue; // 401/403/404/429 are key-scoped -> next key
          }
          const body = await resp.text();
          // The write happens after the answer is on its way, and its failure is
          // swallowed. It used to sit inside this try: once the free plan's
          // 1,000 daily KV writes were gone, put() threw AFTER a good answer,
          // the catch below took it for an upstream failure, and the walk asked
          // the next key — up to 55 Gemini calls to deliver nothing but a 502.
          if (cacheKey) later(env.CACHE.put(cacheKey, body, { expirationTtl: 60 * 60 * 24 * 30 }));
          return finish(new Response(body, { status: 200, headers: { ...headers, 'X-Apex-Model': m, 'X-Apex-Cache': cacheKey ? 'miss' : 'skip' } }));
        } catch (err) {
          if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
            // Slow is per project, not per model (one key took 61 s while nine
            // others answered in under 2 s), so rest this pair and try the next.
            timedOut = true;
            lastErr = `${m}: no answer in ${Math.round(Math.min(attemptCap, left) / 1000)}s`;
            remember(keyIdx, m, 30);
          } else {
            lastErr = err && err.message ? err.message : String(err);
          }
        }
      }
    }
    // 429, not 502, when every failure was a rate limit: "busy, wait N seconds"
    // and "broken" need different words in front of a student, and only the
    // status code lets the client tell them apart.
    if (rateLimited) {
      const retryAfter = soonestRetry || 60;
      return finish(json(
        { error: 'All models are rate limited right now', detail: lastErr, retryAfter },
        429,
        { ...headers, 'Retry-After': String(retryAfter) }
      ));
    }
    if (timedOut || Date.now() >= deadline - 2000) {
      return finish(json({ error: 'The AI took too long to answer', detail: lastErr }, 504, headers));
    }
    return finish(json({ error: 'All API attempts failed', detail: lastErr }, 502, headers));
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}
