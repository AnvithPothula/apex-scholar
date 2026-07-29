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

module.exports = function (app) {
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
