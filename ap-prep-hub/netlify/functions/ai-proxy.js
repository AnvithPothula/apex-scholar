/**
 * Netlify Function: AI Proxy
 *
 * Proxies Gemini API requests so that API keys are never exposed in the
 * client-side JavaScript bundle.  Keys are read from Netlify environment
 * variables (GEMINI_API_KEY, GEMINI_API_KEY_2, … GEMINI_API_KEY_11).
 *
 * The client sends a POST with JSON body:
 *   { model, contents, generationConfig, safetySettings }
 *
 * The function forwards the request to the Google Generative Language API
 * using a rotating key strategy with exponential backoff on 429s.
 */

// ---------------------------------------------------------------------------
// Key management (server-side only — never sent to the client)
// ---------------------------------------------------------------------------
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
  process.env.GEMINI_API_KEY_9,
  process.env.GEMINI_API_KEY_10,
  process.env.GEMINI_API_KEY_11,
].filter(Boolean);

let currentKeyIndex = 0;
const failedUntil = new Map(); // keyIndex -> timestamp

function getNextAvailableKey() {
  const now = Date.now();
  for (let i = 0; i < API_KEYS.length; i++) {
    const idx = (currentKeyIndex + i) % API_KEYS.length;
    const until = failedUntil.get(idx);
    if (!until || now >= until) {
      currentKeyIndex = idx;
      return API_KEYS[idx];
    }
  }
  // All keys exhausted — try the least-recently-failed one
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[currentKeyIndex];
}

function markKeyFailed(idx, retryAfterMs = 300_000) {
  failedUntil.set(idx, Date.now() + retryAfterMs);
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (API_KEYS.length === 0) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'No API keys configured on the server.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { model = 'gemini-2.5-flash', contents, generationConfig, safetySettings } = payload;
  const apiVersion = model.startsWith('gemini-2.5') ? 'v1beta' : 'v1';
  const cleanModel = model.replace(/^models\//, '');

  // Try up to 3 different keys on 429
  for (let attempt = 0; attempt < Math.min(3, API_KEYS.length); attempt++) {
    const key = getNextAvailableKey();
    const keyIdx = currentKeyIndex;
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${cleanModel}:generateContent?key=${key}`;

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig, safetySettings }),
      });

      if (resp.status === 429) {
        const retryAfter = parseInt(resp.headers.get('retry-after') || '300', 10);
        markKeyFailed(keyIdx, retryAfter * 1000);
        continue; // try next key
      }

      const data = await resp.text();
      return {
        statusCode: resp.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: data,
      };
    } catch (err) {
      markKeyFailed(keyIdx, 60_000);
      if (attempt === Math.min(3, API_KEYS.length) - 1) {
        return {
          statusCode: 502,
          body: JSON.stringify({ error: 'All API attempts failed', detail: err.message }),
        };
      }
    }
  }

  return { statusCode: 503, body: JSON.stringify({ error: 'Service temporarily unavailable' }) };
};
