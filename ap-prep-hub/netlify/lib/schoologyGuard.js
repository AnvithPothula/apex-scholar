/**
 * Schoology proxy rules: what the api_call action may forward, and how a
 * signed request is made. Kept pure (fetch and secrets are passed in) so it is
 * testable without network or credentials.
 *
 * OAuth 1.0a tokens have no scopes: a student's token can create and delete
 * their own submissions. The proxy therefore forwards reads only, and only to
 * the endpoints the app reads.
 */
const crypto = require('crypto');

// Read endpoints the app may use. `me` is resolved to the stored uid before
// forwarding (see resolveMe). Extend this list when a feature needs more.
const READ_PATHS = [
  /^\/users\/(me|\d+)$/,
  /^\/users\/(me|\d+)\/(sections|grades|events|updates)$/,
  /^\/sections\/\d+$/,
  /^\/sections\/\d+\/(assignments|events|updates|grading_categories|grading_periods|grading_scales)$/,
  /^\/sections\/\d+\/assignments\/\d+$/,
  /^\/sections\/\d+\/submissions\/\d+\/\d+$/,
  /^\/recent$/,
];

/** { ok: true } or { ok: false, error } for an api_call request. */
function checkApiCall(method, path) {
  if (String(method || 'GET').toUpperCase() !== 'GET') return { ok: false, error: 'read-only proxy: GET only' };
  if (typeof path !== 'string' || !path.startsWith('/') || path.includes('..') || path.includes('//')) {
    return { ok: false, error: 'path must be a relative API path' };
  }
  const pathname = path.split('?')[0];
  if (!READ_PATHS.some((re) => re.test(pathname))) return { ok: false, error: 'path not allowed' };
  return { ok: true };
}

/** /users/me answers with a 303; use the stored uid so no redirect happens. */
function resolveMe(path, schoologyUid) {
  return schoologyUid ? path.replace(/^\/users\/me(?=\/|\?|$)/, `/users/${schoologyUid}`) : path;
}

/**
 * The student's own Schoology host for the authorize step ("school.schoology.com"
 * or a custom domain like "lms.school.org"). Authorizing on the wrong host can
 * attach the token to whoever is signed in there. Returns null if invalid.
 */
function normalizeDomain(input) {
  if (!input || typeof input !== 'string') return null;
  let s = input.trim().toLowerCase();
  if (!/^[a-z]+:\/\//.test(s)) s = `https://${s}`;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.port) return null;
  if (u.pathname !== '/' && u.pathname !== '') return null;
  const host = u.hostname;
  if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) return null; // no IPs, no localhost
  return host;
}

// RFC 3986 percent-encode (encodeURIComponent leaves !*'() unescaped).
const pe = (s) => encodeURIComponent(String(s)).replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

/**
 * OAuth 1.0a HMAC-SHA1 signature. Query-string parameters belong in the
 * signed parameter set, and the base URL excludes them; signing the URL with
 * `?start=…` still attached produced a signature Schoology rejects.
 */
function signature(method, url, oauthParams, consumerSecret, tokenSecret = '') {
  const u = new URL(url);
  const params = { ...oauthParams };
  u.searchParams.forEach((v, k) => { params[k] = v; });
  const sorted = Object.keys(params).sort().map((k) => `${pe(k)}=${pe(params[k])}`).join('&');
  const base = `${method.toUpperCase()}&${pe(`${u.origin}${u.pathname}`)}&${pe(sorted)}`;
  return crypto.createHmac('sha1', `${pe(consumerSecret)}&${pe(tokenSecret)}`).update(base).digest('base64');
}

const authHeader = (p) => 'OAuth realm="Schoology API", ' + Object.keys(p).sort().map((k) => `${pe(k)}="${pe(p[k])}"`).join(', ');

/**
 * Signed request. GET redirects are followed with a FRESH nonce/timestamp:
 * re-sending the same ones gets "401 Duplicate timestamp/nonce combination",
 * which is why the /users/me profile lookup silently failed.
 */
async function signedFetch({ method, url, oauthParams, consumerSecret, tokenSecret = '', body = null, freshParams, fetchImpl = fetch }) {
  let target = url;
  let params = oauthParams;
  for (let hop = 0; hop < 3; hop++) {
    const signed = { ...params, oauth_signature: signature(method, target, params, consumerSecret, tokenSecret) };
    const opts = { method, redirect: 'manual', headers: { Authorization: authHeader(signed), Accept: 'application/json' } };
    if (body != null) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetchImpl(target, opts);
    const loc = res.headers && res.headers.get && res.headers.get('location');
    if (method === 'GET' && [301, 302, 303, 307, 308].includes(res.status) && loc) {
      target = new URL(loc, target).toString();
      params = freshParams ? freshParams() : params;
      continue;
    }
    return res;
  }
  throw new Error('Schoology redirected too many times');
}

module.exports = { READ_PATHS, checkApiCall, resolveMe, normalizeDomain, signature, signedFetch };
