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

module.exports = function (app) {
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
