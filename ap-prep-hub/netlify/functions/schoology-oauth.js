/**
 * Netlify serverless function — Schoology OAuth 1.0a proxy.
 *
 * Holds the consumer SECRET (process.env.SCHOOLOGY_CONSUMER_SECRET) and every
 * user's access token server-side (users/{uid}/private/schoology, which
 * clients can't read). Every action needs a verified Firebase ID token.
 *
 *   POST ?action=request_token   { callback, domain }
 *     -> { oauth_token, authorize_url }   // authorize on the student's own Schoology host
 *   POST ?action=access_token    { oauth_token, oauth_verifier }
 *     -> { success, schoologyName, schoologyUid }
 *   POST ?action=api_call        { method: 'GET', path }
 *     -> { status, ok, data }   // signed GET to api.schoology.com/v1{path}
 *   POST ?action=disconnect
 *
 * api_call is READ-ONLY and allow-listed (netlify/lib/schoologyGuard.js):
 * OAuth 1.0a tokens have no scopes, so a forwarded POST/PUT/DELETE could change
 * or delete the student's own Schoology work. A 401 from Schoology (tokens now
 * expire after 90 days) marks the integration needsReconnect.
 */

const crypto = require('crypto');
const { checkApiCall, resolveMe, normalizeDomain, signedFetch } = require('../lib/schoologyGuard');

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

// ---- OAuth 1.0a signing (see ../lib/schoologyGuard) ----------------------

const nonce = () => crypto.randomBytes(16).toString('hex');
const ts = () => Math.floor(Date.now() / 1000).toString();

function oauthBase() {
  return {
    oauth_consumer_key: process.env.SCHOOLOGY_CONSUMER_KEY || '',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: ts(),
    oauth_nonce: nonce(),
    oauth_version: '1.0',
  };
}

function callSchoology(method, url, params, tokenSecret = '', body = null) {
  const token = params.oauth_token;
  return signedFetch({
    method,
    url,
    oauthParams: params,
    consumerSecret: process.env.SCHOOLOGY_CONSUMER_SECRET || '',
    tokenSecret,
    body,
    // A followed redirect needs a fresh nonce/timestamp, same token.
    freshParams: () => ({ ...oauthBase(), ...(token ? { oauth_token: token } : {}) }),
  });
}

// ---- Firebase auth + admin Firestore -------------------------------------
// Tokens live ONLY server-side now (users/{uid}/private/schoology). Every
// action requires a verified Firebase ID token; the access/request token
// secrets never travel through the browser.

// Admin bootstrap comes from ../lib/firebaseAdmin, shared with admin-stats and
// the email functions.
//
// This file used to carry its own copy, and that copy had the A37 bug the
// shared one was written to kill: it only replaced escaped \n, so a key with
// surrounding quotes, CRLF line endings, or a missing trailing newline made
// admin.credential.cert() throw, the catch swallowed it, and the caller
// reported "FIREBASE_SERVICE_ACCOUNT missing" — which is simply untrue when the
// variable is present but mangled. The shared helper repairs those cases and
// names the real defect when it cannot.
const { getAdminApp } = require('../lib/firebaseAdmin');

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
  const { app: adminApp, error: adminError } = getAdminApp();
  if (!adminApp) {
    // Surface the actual reason (missing vars vs. unparseable key vs. missing
    // bundle) instead of one catch-all message that sends people hunting for
    // an environment variable that is already set.
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: adminError || 'Server auth not configured.' }),
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
      // Students authorize on their own school's host; www.schoology.com can
      // attach the token to whoever happens to be signed in there.
      const domain = normalizeDomain(body.domain);
      if (!domain) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Enter your school\'s Schoology address, e.g. yourschool.schoology.com' }) };
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
        domain,
        createdAt: FieldValue.serverTimestamp(),
      });
      const authorize_url = `https://${domain}/oauth/authorize?oauth_token=${encodeURIComponent(oauth_token)}`;
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
      const domain = tempSnap.data().domain || null;

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
        domain,
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
        domain,
        needsReconnect: false,
        connectedAt: FieldValue.serverTimestamp(),
        accessToken: FieldValue.delete(),
        accessTokenSecret: FieldValue.delete(),
      }, { merge: true });

      await oauthTempRef.delete().catch(() => {});
      // Return only derived data — never the token.
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, schoologyName, schoologyUid }) };
    }

    if (action === 'api_call') {
      const { method = 'GET', path } = body;
      const check = checkApiCall(method, path);
      if (!check.ok) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: check.error }) };
      }
      // Load the caller's tokens server-side — the client never supplies them.
      const tokSnap = await privateTokenRef.get();
      const tok = tokSnap.exists ? tokSnap.data() : null;
      if (!tok || tok.isActive === false || !tok.accessToken || !tok.accessTokenSecret) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'No Schoology authentication for this user' }) };
      }
      const url = `${SCHOOLOGY_BASE}${resolveMe(path, tok.schoologyUid)}`;
      const params = { ...oauthBase(), oauth_token: tok.accessToken };
      const res = await callSchoology('GET', url, params, tok.accessTokenSecret);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (_) { data = text; }
      // Expired (90-day TTL) or revoked token: tell the UI to ask for a reconnect.
      const reconnect = res.status === 401;
      if (reconnect) {
        await db.doc(`users/${uid}/integrations/schoology`).set({ needsReconnect: true }, { merge: true }).catch(() => {});
      }
      return { statusCode: 200, headers, body: JSON.stringify({ status: res.status, ok: res.ok, reconnect, data }) };
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
