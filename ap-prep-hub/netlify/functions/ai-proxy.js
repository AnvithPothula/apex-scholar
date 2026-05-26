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

const parseCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const ALLOWED_ORIGINS = Array.from(
  new Set([
    ...parseCsv(process.env.ALLOWED_ORIGINS || ''),
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    'http://localhost:3000',
    'http://localhost:8888',
  ].filter(Boolean))
);

const REQUIRED_APP_TOKEN = process.env.AI_PROXY_APP_TOKEN || process.env.APP_PROXY_TOKEN;
const RATE_LIMIT_WINDOW_MS = Number(process.env.AI_PROXY_RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.AI_PROXY_RATE_LIMIT_MAX_REQUESTS || 60);
const requestBuckets = new Map();

// ---------------------------------------------------------------------------
// Optional Firebase auth + tamper-proof server-side quota.
//
// Entirely gated on FIREBASE_SERVICE_ACCOUNT (a service-account JSON string in
// Netlify env). If it's absent, none of this runs and the proxy behaves exactly
// as before — so deploying this code changes nothing until you add the env var.
//
// When configured:
//   - A valid `Authorization: Bearer <Firebase ID token>` is verified; the
//     per-UID call count is enforced in users/{uid}/usage/aiServer (written by
//     the admin SDK; clients can only read it — see firestore.rules). This is
//     the tamper-proof backstop. The client-side limits remain the tighter,
//     user-facing UX caps.
//   - No/invalid token: allowed as anonymous (guests) unless AI_PROXY_REQUIRE_AUTH
//     is "true", in which case it's rejected. IP rate-limiting still applies.
// ---------------------------------------------------------------------------
const REQUIRE_AUTH = (process.env.AI_PROXY_REQUIRE_AUTH || '').toLowerCase() === 'true';
const SRV_5H_LIMIT = Number(process.env.AI_PROXY_5H_LIMIT || 120);
const SRV_WEEK_LIMIT = Number(process.env.AI_PROXY_WEEK_LIMIT || 600);
const SRV_FIVE_H_MS = 5 * 60 * 60 * 1000;
const SRV_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let _adminApp = null;
let _adminTried = false;
function getAdminApp() {
  if (_adminTried) return _adminApp;
  _adminTried = true;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const admin = require('firebase-admin');
    const creds = JSON.parse(raw);
    _adminApp = (admin.apps && admin.apps.length)
      ? admin.app()
      : admin.initializeApp({ credential: admin.credential.cert(creds) });
    _adminApp.__admin = admin; // stash for FieldValue
    return _adminApp;
  } catch (err) {
    console.error('[ai-proxy] firebase-admin init failed:', err.message);
    _adminApp = null;
    return null;
  }
}

async function verifyUid(event, app) {
  const authHeader = getHeader(event, 'authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  try {
    const decoded = await app.auth().verifyIdToken(match[1]);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

function rollServerWindow(bucket, durationMs, now) {
  if (!bucket || !bucket.start || now - bucket.start >= durationMs) return { start: now, count: 0 };
  return { start: bucket.start, count: bucket.count || 0 };
}

// Returns { ok: true } or { ok: false, scope, resetAt }. Throws only on infra error.
async function enforceServerQuota(app, uid) {
  const admin = app.__admin;
  const db = app.firestore();
  const ref = db.doc(`users/${uid}/usage/aiServer`);
  const now = Date.now();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.exists ? snap.data() : {};
    const fh = rollServerWindow(d.fiveHour, SRV_FIVE_H_MS, now);
    const wk = rollServerWindow(d.week, SRV_WEEK_MS, now);
    if (fh.count >= SRV_5H_LIMIT) return { ok: false, scope: '5h', resetAt: fh.start + SRV_FIVE_H_MS };
    if (wk.count >= SRV_WEEK_LIMIT) return { ok: false, scope: 'week', resetAt: wk.start + SRV_WEEK_MS };
    fh.count += 1;
    wk.count += 1;
    tx.set(ref, {
      fiveHour: fh,
      week: wk,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { ok: true };
  });
}

function getHeader(event, name) {
  const headers = event?.headers || {};
  const target = name.toLowerCase();
  const match = Object.keys(headers).find((key) => key.toLowerCase() === target);
  return match ? headers[match] : undefined;
}

function getClientId(event) {
  const forwardedFor = getHeader(event, 'x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return getHeader(event, 'x-nf-client-connection-ip') || 'anonymous';
}

function getAllowedOrigin(event) {
  const origin = getHeader(event, 'origin');
  if (!origin) {
    return ALLOWED_ORIGINS[0] || null;
  }
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

function buildCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function cleanupRequestBuckets(now = Date.now()) {
  if (requestBuckets.size < 1000) return;
  for (const [clientId, bucket] of requestBuckets.entries()) {
    if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
      requestBuckets.delete(clientId);
    }
  }
}

function isRateLimited(clientId) {
  const now = Date.now();
  cleanupRequestBuckets(now);

  const bucket = requestBuckets.get(clientId);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    requestBuckets.set(clientId, { count: 1, windowStart: now });
    return { limited: false, retryAfter: 0 };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.windowStart)) / 1000);
    return { limited: true, retryAfter };
  }

  bucket.count += 1;
  return { limited: false, retryAfter: 0 };
}

function isAuthorized(event) {
  if (!REQUIRED_APP_TOKEN) return true;
  const appToken = getHeader(event, 'x-app-token');
  const authHeader = getHeader(event, 'authorization') || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;
  return appToken === REQUIRED_APP_TOKEN || bearerToken === REQUIRED_APP_TOKEN;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
exports.handler = async (event) => {
  const allowedOrigin = getAllowedOrigin(event);
  if (!allowedOrigin) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Origin is not allowed' }),
    };
  }

  const corsHeaders = buildCorsHeaders(allowedOrigin);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!isAuthorized(event)) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const clientId = getClientId(event);
  const rateLimit = isRateLimited(clientId);
  if (rateLimit.limited) {
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.retryAfter),
      },
      body: JSON.stringify({ error: 'Rate limit exceeded' }),
    };
  }

  // Firebase auth + tamper-proof per-user quota (only if a service account is
  // configured; otherwise this whole block is skipped and behavior is unchanged).
  const adminApp = getAdminApp();
  if (adminApp) {
    const uid = await verifyUid(event, adminApp);
    if (!uid) {
      if (REQUIRE_AUTH) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Authentication required' }),
        };
      }
      // else: anonymous (e.g. guest) — IP rate-limit already applied above.
    } else {
      try {
        const quota = await enforceServerQuota(adminApp, uid);
        if (!quota.ok) {
          const retryAfter = Math.max(1, Math.ceil((quota.resetAt - Date.now()) / 1000));
          return {
            statusCode: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
            body: JSON.stringify({ error: 'AI usage limit reached', scope: quota.scope, resetAt: quota.resetAt }),
          };
        }
      } catch (err) {
        // Don't block users if the quota store has an infra hiccup — fail open.
        console.error('[ai-proxy] server quota check failed (fail-open):', err.message);
      }
    }
  }

  if (API_KEYS.length === 0) {
    return {
      statusCode: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No API keys configured on the server.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { model = 'gemini-2.5-flash', contents, generationConfig, safetySettings } = payload;
  if (!Array.isArray(contents) || contents.length === 0) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '"contents" must be a non-empty array' }),
    };
  }

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
        continue;
      }

      const data = await resp.text();
      return {
        statusCode: resp.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: data,
      };
    } catch (err) {
      markKeyFailed(keyIdx, 60_000);
      if (attempt === Math.min(3, API_KEYS.length) - 1) {
        return {
          statusCode: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'All API attempts failed', detail: err.message }),
        };
      }
    }
  }

  return {
    statusCode: 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Service temporarily unavailable' }),
  };
};
