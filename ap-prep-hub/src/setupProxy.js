/**
 * Dev-server mirror of the `/__/*` rule in public/_redirects.
 *
 * Google sign-in uses signInWithRedirect, which needs Firebase's auth handler
 * to be SAME-ORIGIN with the app. Production already gets this via Netlify
 * (public/_redirects proxies /__/* to firebaseapp.com), but `npm start` had no
 * equivalent — so on localhost the authDomain fell back to
 * ai-study-helper-f2f24.firebaseapp.com, which is cross-origin. Safari's ITP
 * then blocks the storage the redirect flow depends on, getRedirectResult()
 * resolves to null, and the user is bounced straight back to the login page
 * after authenticating.
 *
 * Proxying /__/* here lets firebase.js use window.location.host on localhost
 * too, so dev matches prod and sign-in works in Safari.
 *
 * CRA loads this file automatically; it is dev-only and never bundled.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

const AUTH_HOST = 'https://ai-study-helper-f2f24.firebaseapp.com';

// `netlify dev` serves the functions on 8888 and proxies the CRA server on 3000.
// Nothing served /.netlify/functions/* on 3000 itself, so opening the app there
// 404'd every function call — which is what the unexplained
// "404 (Not Found) (ai-proxy)" / "(email-broadcast)" console lines were. The
// System Health panel then reported the functions as down when they were fine.
const FUNCTIONS_HOST = process.env.NETLIFY_DEV_URL || 'http://localhost:8888';

// Functions the dev server runs itself, so plain `npm start` works without
// `netlify dev`. CRA loads every .env variable (not just REACT_APP_*) into this
// Node process, so each function reads its server-side secrets (e.g.
// GEMINI_API_KEYS) here exactly as on Netlify, and none reach the browser
// bundle. The email functions are left out on purpose: running them
// in-process would let a dev click send real mail. Value: the env vars holding
// that function's app token, if it has one.
const IN_PROCESS = {
  'ai-proxy': ['AI_PROXY_APP_TOKEN', 'APP_PROXY_TOKEN'],
  'cors-proxy': ['CORS_PROXY_APP_TOKEN', 'APP_PROXY_TOKEN'],
  'class-record-test': [],
  'schoology-oauth': [],
  'admin-stats': [],
  feedback: [],
};

function runInProcess(name) {
  return (req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const { handler } = require(`../netlify/functions/${name}`);
        // The app-token gate exists to keep other sites off the production
        // proxy. A request reaching this dev server already came from the
        // local app, so attach the server's own token rather than requiring a
        // REACT_APP_ copy of it in .env.
        const headers = { ...req.headers };
        const serverToken = IN_PROCESS[name].map((k) => process.env[k]).find(Boolean);
        if (serverToken && !headers['x-app-token']) headers['x-app-token'] = serverToken;
        // Any loopback origin is this same dev server (127.0.0.1 is handy for
        // testing as a signed-out guest); the functions only list localhost.
        if (/^http:\/\/(127\.0\.0\.1|\[::1\]):3000$/.test(headers.origin || '')) headers.origin = 'http://localhost:3000';
        const out = await handler({
          httpMethod: req.method,
          path: req.originalUrl,
          headers,
          queryStringParameters: Object.fromEntries(new URL(req.originalUrl, 'http://x').searchParams),
          body,
          isBase64Encoded: false,
        });
        res.writeHead(out.statusCode || 200, out.headers || {});
        res.end(out.body || '');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `${name} failed in the dev server: ${err.message}` }));
      }
    });
  };
}

module.exports = function (app) {
  Object.keys(IN_PROCESS).forEach((name) => app.use(`/.netlify/functions/${name}`, runInProcess(name)));

  app.use(
    '/.netlify/functions',
    createProxyMiddleware({
      target: FUNCTIONS_HOST,
      changeOrigin: true,
      logLevel: 'warn',
      // With `netlify dev` not running there is nothing to proxy to. Answer with
      // JSON naming the cause: interpretProbe treats a non-JSON body as "not
      // running", and an HTML error page would read as a mystery failure.
      onError: (err, req, res) => {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: `Netlify functions are not running. Start them with \`netlify dev\` (expected at ${FUNCTIONS_HOST}), or open the app on port 8888.`,
        }));
      },
    })
  );

  app.use(
    '/__',
    createProxyMiddleware({
      target: AUTH_HOST,
      changeOrigin: true,
      // Firebase issues 302s between /__/auth/* endpoints; let them through
      // untouched rather than rewriting Location back to localhost.
      followRedirects: false,
      logLevel: 'warn',
    })
  );
};
