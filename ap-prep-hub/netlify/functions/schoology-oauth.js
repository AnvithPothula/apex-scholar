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

  try {
    if (action === 'request_token') {
      const { callback } = body;
      if (!callback || typeof callback !== 'string') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'callback required' }),
        };
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
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'malformed upstream response' }),
        };
      }
      const authorize_url = `${SCHOOLOGY_BASE}/oauth/authorize?oauth_token=${encodeURIComponent(
        oauth_token
      )}`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ oauth_token, oauth_token_secret, authorize_url }),
      };
    }

    if (action === 'access_token') {
      const { oauth_token, oauth_verifier, oauth_token_secret } = body;
      if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'oauth_token, oauth_verifier, oauth_token_secret required',
          }),
        };
      }
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
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({ error: 'malformed upstream response' }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ access_token, token_secret }),
      };
    }

    if (action === 'api_call') {
      const {
        method = 'GET',
        path,
        access_token,
        token_secret,
        body: apiBody = null,
      } = body;
      if (!path || typeof path !== 'string' || !path.startsWith('/')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'path must start with /' }),
        };
      }
      if (!access_token || !token_secret) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'access_token + token_secret required' }),
        };
      }
      const m = String(method).toUpperCase();
      if (!['GET', 'POST', 'PUT', 'DELETE'].includes(m)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'method not allowed' }),
        };
      }
      const url = `${SCHOOLOGY_BASE}${path}`;
      const params = { ...oauthBase(), oauth_token: access_token };
      const res = await callSchoology(m, url, params, token_secret, apiBody);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = text;
      }
      return {
        statusCode: 200, // wrap upstream status in body so client gets a uniform shape
        headers,
        body: JSON.stringify({ status: res.status, ok: res.ok, data }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'unknown action (use request_token | access_token | api_call)' }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message || 'unknown error' }),
    };
  }
};
