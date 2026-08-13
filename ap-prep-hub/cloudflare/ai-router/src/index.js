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
  bulk:        ['gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
  interactive: ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'],
  premium:     ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
  // Gemma has no image input, so vision cannot borrow the deep pool at all.
  vision:      ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'],
  // Second-opinion chain: deliberately leads with the model `bulk` does NOT, so
  // a generated answer key is checked by a different architecture.
  verify:      ['gemma-4-26b-a4b-it', 'gemma-4-31b-it', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'],
};

// Gemma's TPM ceiling is 16K against flash-lite's 250K. A prompt over roughly
// that size is a guaranteed 429 on Gemma, so trying it just burns a round trip.
const GEMMA_MAX_CHARS = 48_000; // ~12k tokens, leaving headroom for the reply
const isGemma = (m) => m.startsWith('gemma-');

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

export function pairIsCooling(map, keyIdx, model, now) {
  return (map.get(`${keyIdx}:${model}`) || 0) > now;
}

export function coolPair(map, keyIdx, model, now, retryAfterSeconds) {
  // An RPM 429 clears in a minute; an RPD one lasts until midnight Pacific.
  // Google only tells us via retry-after, so trust it when present and use a
  // short default otherwise — a still-dead pair simply re-cools on next touch.
  const secs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
    ? Math.min(retryAfterSeconds, 6 * 3600)
    : 60;
  if (map.size > PAIR_COOLDOWN_MAX) map.clear();
  map.set(`${keyIdx}:${model}`, now + secs * 1000);
}
export const TASK_TO_CHAIN = {
  tutorChat: 'interactive', explain: 'interactive',
  solver: 'vision',
  // lessonTeach is batch content authoring, not chat: Gemma's unlimited TPM and
  // 15k RPD suit it better than flash-lite's scarcer 500 RPD.
  lessonTeach: 'bulk',
  mcqGenerate: 'bulk', practiceTest: 'bulk', flashcardGen: 'bulk',
  summarize: 'bulk', reviewCard: 'bulk', diagnostic: 'bulk',
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
    'Access-Control-Expose-Headers': 'X-Apex-Model, X-Apex-Cache',
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

    // ---- Exact cache (skip images: base64 blows up keys and rarely repeats) ----
    let cacheKey = null;
    if (!hasImage && env.CACHE) {
      cacheKey = await sha256(JSON.stringify({ contents, generationConfig, task }));
      const hit = await env.CACHE.get(cacheKey);
      if (hit) return new Response(hit, { status: 200, headers: { ...headers, 'X-Apex-Cache': 'hit' } });
    }

    // ---- Task -> model chain, with an explicit Google model jumping the queue ----
    const chainName = hasImage ? 'vision' : (TASK_TO_CHAIN[task] || 'interactive');
    let models = MODEL_CHAINS[chainName].slice();
    // Only an *explicit* client-chosen Google model jumps the chain. (An env
    // default must NOT — it would override task routing for every request.)
    const preferred = isGoogleModel(norm(payload.model)) ? norm(payload.model) : null;
    if (preferred) models = [preferred, ...models.filter((m) => m !== preferred)];

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
              coolPair(pairCooldown, keyIdx, m, Date.now(),
                parseInt(resp.headers.get('retry-after') || '', 10));
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
    return json({ error: 'All API attempts failed', detail: lastErr }, 502, headers);
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}
