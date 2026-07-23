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

const MODEL_CHAINS = {
  bulk:        ['gemma-4-26b-a4b-it', 'gemma-4-31b-it', 'gemini-3.1-flash-lite'],
  interactive: ['gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemini-2.5-flash'],
  premium:     ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'],
  vision:      ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'],
};
const TASK_TO_CHAIN = {
  tutorChat: 'interactive', explain: 'interactive', lessonTeach: 'interactive',
  solver: 'vision',
  mcqGenerate: 'bulk', practiceTest: 'bulk', flashcardGen: 'bulk',
  summarize: 'bulk', reviewCard: 'bulk', diagnostic: 'bulk',
  frqGrade: 'premium',
};

const norm = (m) => String(m || '').replace(/^models\//, '').replace(/^google\//, '');
const isGoogleModel = (m) => /^(gemini-|gemma-)/.test(m);
const versionFor = (m) => (/^(gemini-(2\.5|3)|gemma-)/.test(m) ? 'v1beta' : 'v1');

function cors(origin, allowed) {
  const allow = allowed.includes(origin) ? origin : (allowed[0] || '*');
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
    const preferred = isGoogleModel(norm(payload.model)) ? norm(payload.model)
      : (isGoogleModel(norm(env.GEMINI_DEFAULT_MODEL)) ? norm(env.GEMINI_DEFAULT_MODEL) : null);
    if (preferred) models = [preferred, ...models.filter((m) => m !== preferred)];

    let attempts = 0;
    let lastErr = 'Service temporarily unavailable';
    for (const m of models) {
      const version = versionFor(m);
      for (let k = 0; k < API_KEYS.length && attempts < 6; k++) {
        attempts++;
        const url = `https://generativelanguage.googleapis.com/${version}/models/${m}:generateContent?key=${API_KEYS[k]}`;
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, generationConfig, safetySettings }),
          });
          if (resp.status === 429) continue;      // next key, same model
          if (resp.status === 404) break;         // wrong id for this version -> next model
          const body = await resp.text();
          if (resp.ok && cacheKey) {
            await env.CACHE.put(cacheKey, body, { expirationTtl: 60 * 60 * 24 * 30 });
          }
          return new Response(body, {
            status: resp.status,
            headers: { ...headers, 'X-Apex-Model': m, 'X-Apex-Cache': 'miss' },
          });
        } catch (err) {
          lastErr = err.message;
        }
      }
      if (attempts >= 6) break;
    }
    return json({ error: 'All API attempts failed', detail: lastErr }, 502, headers);
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}
