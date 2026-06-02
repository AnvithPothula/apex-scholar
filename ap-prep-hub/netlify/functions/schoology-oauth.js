/**
 * Netlify serverless function — Schoology OAuth 1.0a proxy.
 *
 * The Schoology consumer SECRET must never reach the browser. This function
 * holds it (process.env.SCHOOLOGY_CONSUMER_SECRET) and signs every request
 * server-side. The frontend POSTs to this function with one of three actions:
 *
 *   POST ?action=request_token   { callback }
 *     -> { oauth_token, oauth_token_secret, authorize_url }
 *
 *   POST ?action=access_token    { oauth_token, oauth_verifier, oauth_token_secret }
 *     -> { access_token, token_secret }
 *
 *   POST ?action=api_call        { method, path, access_token, token_secret, body? }
 *     -> { status, data }   // forwards a signed call to api.schoology.com/v1{path}
 *
 * Notes:
 *   - oauth_token_secret from request_token must round-trip through the
 *     browser (stored client-side keyed by oauth_token) because the access
 *     token exchange needs it as the token half of the signing key. The
 *     consumer secret stays here.
 *   - api_call rejects absolute URLs and methods outside GET/POST/PUT/DELETE
 *     so this can't be used as an open relay.
 */

const crypto = require('crypto');

const SCHOOLOGY_BASE = 'https://api.schoology.com/v1';

// ---- CORS ----------------------------------------------------------------

const parseCsv = (s = '') => s.split(',').map((x) => x.trim()).filter(Boolean);
const ALLOWED_ORIGINS = Array.from(
  new Set(
    [
      ...parseCsv(process.env.ALLOWED_ORIGINS || ''),
      process.env.URL,
      process.env.DEPLOY_PRIME_URL,
      'http://localhost:3000',
      'http://localhost:8888',
    ].filter(Boolean)
  )
);

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  };
}

// ---- OAuth 1.0a signing --------------------------------------------------

// RFC 3986 percent-encode (encodeURIComponent leaves !*'() unescaped).
function pe(s) {
  return encodeURIComponent(String(s)).replace(
    /[!*'()]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

const nonce = () => crypto.randomBytes(16).toString('hex');
const ts = () => Math.floor(Date.now() / 1000).toString();

function baseString(method, url, params) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${pe(k)}=${pe(params[k])}`)
    .join('&');
  return `${method.toUpperCase()}&${pe(url)}&${pe(sorted)}`;
}

function sign(method, url, params, tokenSecret = '') {
  const key = `${pe(process.env.SCHOOLOGY_CONSUMER_SECRET || '')}&${pe(tokenSecret)}`;
  return crypto
    .createHmac('sha1', key)
    .update(baseString(method, url, params))
    .digest('base64');
}

function authHeader(signedParams) {
  return (
    'OAuth ' +
    Object.keys(signedParams)
      .sort()
      .map((k) => `${pe(k)}="${pe(signedParams[k])}"`)
      .join(', ')
  );
}

function oauthBase() {
  return {
    oauth_consumer_key: process.env.SCHOOLOGY_CONSUMER_KEY || '',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: ts(),
    oauth_nonce: nonce(),
    oauth_version: '1.0',
  };
}

async function callSchoology(method, url, params, tokenSecret = '', body = null) {
  const signed = { ...params, oauth_signature: sign(method, url, params, tokenSecret) };
  const opts = {
    method,
    headers: {
      Authorization: authHeader(signed),
      Accept: 'application/json',
    },
  };
  if (body != null) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  return fetch(url, opts);
}

// ---- Firebase auth + admin Firestore -------------------------------------
// Tokens live ONLY server-side now (users/{uid}/private/schoology). Every
// action requires a verified Firebase ID token; the access/request token
// secrets never travel through the browser.

let _adminApp = null;
let _adminTried = false;
// Prefer the 3 split vars (small — keeps total function env under AWS Lambda's
// 4KB limit); fall back to the full FIREBASE_SERVICE_ACCOUNT JSON.
function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
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
    _adminApp.__admin = admin;
    return _adminApp;
  } catch (err) {
    console.error('[schoology-oauth] firebase-admin init failed:', err.message);
    _adminApp = null;
    return null;
  }
}

async function verifyUid(event, app) {
  const h = event.headers || {};
  const authHeaderVal = h.authorization || h.Authorization || '';
  const m = authHeaderVal.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  try {
    const decoded = await app.auth().verifyIdToken(m[1]);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

// Callback must be one of our own origins + the fixed callback path (not an
// arbitrary URL we'd otherwise sign a request token for).
function callbackAllowed(callback) {
  try {
    const u = new URL(callback);
    return ALLOWED_ORIGINS.includes(u.origin) && u.pathname === '/schoology-callback';
  } catch {
    return false;
  }
}

// ---- Handler -------------------------------------------------------------

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = cors(origin);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!process.env.SCHOOLOGY_CONSUMER_KEY || !process.env.SCHOOLOGY_CONSUMER_SECRET) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error:
          'Schoology credentials not configured on server. Set SCHOOLOGY_CONSUMER_KEY and SCHOOLOGY_CONSUMER_SECRET in Netlify env.',
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const action =
    (event.queryStringParameters && event.queryStringParameters.action) || body.action;

  // Require a verified Firebase user for every action. Tokens are stored and
  // signed server-side, keyed by this uid — they never go through the browser.
  const adminApp = getAdminApp();
  if (!adminApp) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'Server auth not configured (FIREBASE_SERVICE_ACCOUNT missing).' }),
    };
  }
  const uid = await verifyUid(event, adminApp);
  if (!uid) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Authentication required' }) };
  }
  const db = adminApp.firestore();
  const FieldValue = adminApp.__admin.firestore.FieldValue;
  const privateTokenRef = db.doc(`users/${uid}/private/schoology`);
  const oauthTempRef = db.doc(`users/${uid}/private/schoologyOAuth`);

  try {
    if (action === 'request_token') {
      const { callback } = body;
      if (!callback || !callbackAllowed(callback)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'invalid callback' }) };
      }
      const url = `${SCHOOLOGY_BASE}/oauth/request_token`;
      const params = { ...oauthBase(), oauth_callback: callback };
      const res = await callSchoology('POST', url, params);
      const text = await res.text();
      if (!res.ok) {
        return {
          statusCode: res.status,
          headers,
          body: JSON.stringify({ error: 'request_token failed', upstream: text.slice(0, 500) }),
        };
      }
      const usp = new URLSearchParams(text);
      const oauth_token = usp.get('oauth_token');
      const oauth_token_secret = usp.get('oauth_token_secret');
      if (!oauth_token || !oauth_token_secret) {
        return { statusCode: 502, headers, body: JSON.stringify({ error: 'malformed upstream response' }) };
      }
      // Stash the request-token secret SERVER-SIDE (not in the browser).
      await oauthTempRef.set({
        requestToken: oauth_token,
        requestTokenSecret: oauth_token_secret,
        createdAt: FieldValue.serverTimestamp(),
      });
      const authorize_url = `${SCHOOLOGY_BASE}/oauth/authorize?oauth_token=${encodeURIComponent(oauth_token)}`;
      // Note: no oauth_token_secret returned to the client.
      return { statusCode: 200, headers, body: JSON.stringify({ oauth_token, authorize_url }) };
    }

    if (action === 'access_token') {
      const { oauth_token, oauth_verifier } = body;
      if (!oauth_token || !oauth_verifier) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'oauth_token, oauth_verifier required' }) };
      }
      // Recover the request-token secret we stored server-side at request_token.
      const tempSnap = await oauthTempRef.get();
      if (!tempSnap.exists || tempSnap.data().requestToken !== oauth_token) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'OAuth session expired or mismatched — please retry sign-in' }) };
      }
      const oauth_token_secret = tempSnap.data().requestTokenSecret;

      const url = `${SCHOOLOGY_BASE}/oauth/access_token`;
      const params = { ...oauthBase(), oauth_token, oauth_verifier };
      const res = await callSchoology('POST', url, params, oauth_token_secret);
      const text = await res.text();
      if (!res.ok) {
        return {
          statusCode: res.status,
          headers,
          body: JSON.stringify({ error: 'access_token failed', upstream: text.slice(0, 500) }),
        };
      }
      const usp = new URLSearchParams(text);
      const access_token = usp.get('oauth_token');
      const token_secret = usp.get('oauth_token_secret');
      if (!access_token || !token_secret) {
        return { statusCode: 502, headers, body: JSON.stringify({ error: 'malformed upstream response' }) };
      }

      // Best-effort: fetch the profile (server-side) for "Connected as <name>".
      let schoologyUid = null;
      let schoologyName = null;
      try {
        const meParams = { ...oauthBase(), oauth_token: access_token };
        const meRes = await callSchoology('GET', `${SCHOOLOGY_BASE}/users/me`, meParams, token_secret);
        if (meRes.ok) {
          const me = JSON.parse(await meRes.text());
          schoologyUid = String(me.uid || me.id || '') || null;
          schoologyName =
            me.name_display || me.name ||
            [me.name_first, me.name_last].filter(Boolean).join(' ') || null;
        }
      } catch (_) { /* non-fatal */ }

      // Tokens -> server-only doc (clients can't read it; see firestore.rules).
      await privateTokenRef.set({
        accessToken: access_token,
        accessTokenSecret: token_secret,
        schoologyUid,
        schoologyName,
        connectedAt: FieldValue.serverTimestamp(),
        isActive: true,
      }, { merge: true });

      // Non-sensitive status -> client-readable doc (NO tokens). merge keeps
      // calendarUrl; explicitly scrub any legacy client-stored tokens.
      await db.doc(`users/${uid}/integrations/schoology`).set({
        isActive: true,
        integrationType: 'oauth',
        schoologyName,
        schoologyUid,
        connectedAt: FieldValue.serverTimestamp(),
        accessToken: FieldValue.delete(),
        accessTokenSecret: FieldValue.delete(),
      }, { merge: true });

      await oauthTempRef.delete().catch(() => {});
      // Return only derived data — never the token.
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, schoologyName, schoologyUid }) };
    }

    if (action === 'api_call') {
      const { method = 'GET', path, body: apiBody = null } = body;
      if (!path || typeof path !== 'string' || !path.startsWith('/')) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'path must start with /' }) };
      }
      const m = String(method).toUpperCase();
      if (!['GET', 'POST', 'PUT', 'DELETE'].includes(m)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'method not allowed' }) };
      }
      // Load the caller's tokens server-side — the client never supplies them.
      const tokSnap = await privateTokenRef.get();
      const tok = tokSnap.exists ? tokSnap.data() : null;
      if (!tok || tok.isActive === false || !tok.accessToken || !tok.accessTokenSecret) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'No Schoology authentication for this user' }) };
      }
      const url = `${SCHOOLOGY_BASE}${path}`;
      const params = { ...oauthBase(), oauth_token: tok.accessToken };
      const res = await callSchoology(m, url, params, tok.accessTokenSecret, apiBody);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (_) { data = text; }
      return { statusCode: 200, headers, body: JSON.stringify({ status: res.status, ok: res.ok, data }) };
    }

    if (action === 'disconnect') {
      // Wipe server-side tokens. (The non-sensitive status doc is updated by the
      // client, which can write it.) Schoology has no remote-revoke for legacy
      // OAuth 1.0a tokens.
      await privateTokenRef.delete().catch(() => {});
      await oauthTempRef.delete().catch(() => {});
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'unknown action (use request_token | access_token | api_call | disconnect)' }),
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || 'unknown error' }) };
  }
};
