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
//
// Prefer unprefixed GEMINI_API_KEY* (the correct server-side names). Fall back
// to the REACT_APP_GEMINI_API_KEY* vars, which are already set in Netlify and
// scoped to Functions — this keeps prod AI working today without a manual env
// migration. Once the unprefixed vars are populated, the fallback is dead code
// and can be removed.
// ---------------------------------------------------------------------------
const key = (n) =>
  process.env[`GEMINI_API_KEY${n}`] || process.env[`REACT_APP_GEMINI_API_KEY${n}`];
const API_KEYS = [key(''), key('_2'), key('_3'), key('_4'), key('_5'), key('_6'),
  key('_7'), key('_8'), key('_9'), key('_10'), key('_11')].filter(Boolean);

if (API_KEYS.length && !process.env.GEMINI_API_KEY) {
  console.warn('[ai-proxy] Using REACT_APP_GEMINI_API_KEY* fallback — set unprefixed GEMINI_API_KEY* and remove the REACT_APP_ copies.');
}

let currentKeyIndex = 0;
// Per-(key,model) 429 cooldowns and per-model "not found" sidelining. Each key
// is a separate GCP project, and Gemini free limits are per project per model —
// so a 429 on (key3, gemma-4-31b-it) must not sideline key3 for other models.
// In-memory per Lambda instance (best-effort until the Cloudflare router lands).
const modelKeyCooldown = new Map(); // `${keyIdx}:${model}` -> retry timestamp

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
// Build service-account creds. Prefer the 3 split vars (small — keeps the
// function's total env payload under AWS Lambda's 4KB limit); fall back to the
// full FIREBASE_SERVICE_ACCOUNT JSON if that's what's set.
function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') };
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) return JSON.parse(raw);
  return null;
}

function getAdminApp() {
  if (_adminTried) return _adminApp;
  _adminTried = true;
  try {
    const creds = loadServiceAccount();
    if (!creds) return null;
    const admin = require('firebase-admin');
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

  const { contents, generationConfig, safetySettings } = payload;
  if (!Array.isArray(contents) || contents.length === 0) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '"contents" must be a non-empty array' }),
    };
  }

  // ---- Task → model routing (free-tier RPD-aware; ids confirmed by user) ----
  // Per project: gemma-4-* = 1500 RPD each (bulk); gemini-3.1-flash-lite = 500
  // RPD (interactive workhorse); gemini-3.5/3-preview/2.5 flash = 20 RPD each
  // (scarce "premium" reserve — FRQ grading only). Pro models are 0 RPD: never.
  const MODEL_CHAINS = {
    bulk:        ['gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-3.1-flash-lite'],
    interactive: ['gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemini-2.5-flash'],
    premium:     ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'],
    // Gemma is text-only — anything carrying an image must stay on Gemini.
    vision:      ['gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash'],
  };
  const TASK_TO_CHAIN = {
    tutorChat: 'interactive', explain: 'interactive', lessonTeach: 'interactive',
    solver: 'vision',
    mcqGenerate: 'bulk', practiceTest: 'bulk', flashcardGen: 'bulk',
    summarize: 'bulk', reviewCard: 'bulk', diagnostic: 'bulk',
    frqGrade: 'premium',
  };
  const normModel = (m) => String(m || '').replace(/^models\//, '').replace(/^google\//, '');
  const isGoogleModel = (m) => /^(gemini-|gemma-)/.test(m);
  const versionFor = (m) => (/^(gemini-(2\.5|3)|gemma-)/.test(m) ? 'v1beta' : 'v1');

  const task = typeof payload.task === 'string' ? payload.task : '';
  const hasImage = contents.some(
    (c) => Array.isArray(c && c.parts) && c.parts.some((p) => p && (p.inline_data || p.inlineData))
  );
  const chainName = hasImage ? 'vision' : (TASK_TO_CHAIN[task] || 'interactive');
  let models = MODEL_CHAINS[chainName].slice();
  // Only an *explicit* client-chosen Google model jumps the chain — never an
  // env default, which would override task routing for every request.
  const requested = normModel(payload.model);
  const preferred = isGoogleModel(requested) ? requested : null;
  if (preferred) models = [preferred, ...models.filter((m) => m !== preferred)];

  // Walk the chain: per (key, model) cooldown on 429, per-model dead-mark on
  // "model not found", bounded total attempts to keep latency sane.
  let lastErr = 'Service temporarily unavailable';
  // Up to 3 keys per model. Every non-2xx (except a genuine 400) tries the next
  // key — a 403/404/429/5xx can be key-specific (a flaky project), so we never
  // abandon a model on one bad key. flash-lite is the floor of every chain.
  for (const m of models) {
    for (let tried = 0, k = 0; tried < 5 && k < API_KEYS.length; k++) {
      const keyIdx = (currentKeyIndex + k) % API_KEYS.length;
      if ((modelKeyCooldown.get(`${keyIdx}:${m}`) || 0) > Date.now()) continue;
      tried++;
      const url = `https://generativelanguage.googleapis.com/${versionFor(m)}/models/${m}:generateContent?key=${API_KEYS[keyIdx]}`;
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig, safetySettings }),
        });
        if (!resp.ok) {
          if (resp.status === 400) {
            return { statusCode: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Apex-Model': m }, body: await resp.text() };
          }
          const retryAfter = resp.status === 429 ? parseInt(resp.headers.get('retry-after') || '3600', 10) : 60;
          modelKeyCooldown.set(`${keyIdx}:${m}`, Date.now() + retryAfter * 1000);
          continue; // next key
        }
        currentKeyIndex = (keyIdx + 1) % API_KEYS.length; // spread load
        console.log(`[ai-proxy] task=${task || 'default'} chain=${chainName} model=${m} key=${keyIdx + 1} ok`);
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Apex-Model': m },
          body: await resp.text(),
        };
      } catch (err) {
        lastErr = err.message;
        modelKeyCooldown.set(`${keyIdx}:${m}`, Date.now() + 60_000);
      }
    }
  }
  console.error(`[ai-proxy] exhausted task=${task} chain=${chainName} attempts=${attempts}: ${lastErr}`);

  return {
    statusCode: 503,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Service temporarily unavailable' }),
  };
};
