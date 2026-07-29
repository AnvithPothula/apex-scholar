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

export const MODEL_CHAINS = {
  bulk:        ['gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-3.1-flash-lite'],
  interactive: ['gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemini-2.5-flash'],
  premium:     ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'],
  vision:      ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'],
  // Second-opinion chain: deliberately leads with the model `bulk` does NOT, so
  // a generated answer key is checked by a different architecture.
  verify:      ['gemma-4-26b-a4b-it', 'gemini-3.1-flash-lite', 'gemma-4-31b-it'],
};
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    for (const m of models) {
      const version = versionFor(m);
      for (let i = 0; i < perModelKeys; i++) {
        const key = API_KEYS[(start + i) % API_KEYS.length];
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
            continue; // 401/403/404/429/5xx -> next key
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
