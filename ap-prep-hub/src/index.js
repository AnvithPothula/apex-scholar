import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';

// Initialize Sentry error monitoring in production.
// Project: apex-scholar (https://sentry.io)
//
// Only initializes when NODE_ENV=production AND a DSN is set in env. That
// means `npm start` (dev) never reports — to test locally, run `npm run build`
// and serve the build folder.
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_SENTRY_ENV || 'production',
    release: process.env.REACT_APP_VERSION || undefined,

    // Auto-collect IP address, browser, user agent, etc. with each event.
    // Useful for debugging — disable if you have stricter PII requirements.
    sendDefaultPii: true,

    integrations: [
      // Performance monitoring — captures page loads, navigations, API calls
      Sentry.browserTracingIntegration(),
      // NOTE: Session Replay is added LAZILY below (see lazyLoadIntegration
      // call after init). The replay package bundles ~75 KB of `rrweb` code
      // that we don't want shipping in the main JS bundle — Lighthouse
      // flagged it as one of the biggest unused-JS contributors on the
      // login page.
    ],

    // Performance: 10% of transactions. Free tier = 10K transactions/month;
    // bump to 1.0 if you want every transaction (will burn quota fast).
    tracesSampleRate: 0.1,

    // Distributed tracing: only attach Sentry trace headers when calling
    // YOUR OWN backends — never third-party APIs (they reject unknown
    // headers in CORS preflight, which broke Firebase Auth before this
    // was scoped down). Same-origin (`/^\//`) covers our Netlify
    // functions like /.netlify/functions/ai-proxy.
    tracePropagationTargets: [
      /^\//, // same-origin requests (relative URLs)
    ],

    // Session Replay: 0% of normal sessions, 100% of sessions where an error
    // occurred. Free tier = 50 replays/month — keep idle replay off.
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,

    // Forward console.log / console.error / etc. as logs in Sentry.
    // (Sentry's "Logs" feature, separate from issues.)
    enableLogs: true,

    // Filter out noisy errors that aren't actionable.
    //
    // NOTE: We deliberately do NOT silence "Network request failed" /
    // "auth/network-request-failed" — those are exactly the signals we
    // want when something like the Sentry-vs-Firebase-CORS bug recurs.
    ignoreErrors: [
      // Browser quirk; not actionable
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Sentry's own internal noise
      'Non-Error promise rejection captured',
      // Browser extensions inject scripts that throw spurious errors
      /extension:\/\//i,
      /chrome-extension:\/\//i,
      /moz-extension:\/\//i,
    ],
  });

  // Lazy-load Session Replay AFTER the page is interactive.
  // `lazyLoadIntegration` fetches the replay/rrweb code from Sentry's CDN
  // at runtime, so it's never part of our main JS bundle. We schedule it
  // via requestIdleCallback (with a setTimeout fallback for Safari) so it
  // doesn't compete with critical rendering on slow devices.
  const loadSentryReplay = () => {
    Sentry.lazyLoadIntegration('replayIntegration')
      .then((replayIntegration) => {
        const client = Sentry.getClient();
        if (client) {
          client.addIntegration(
            replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          );
        }
      })
      .catch((err) => {
        // Non-fatal: replay just won't be available this session
        console.warn('[Sentry] Failed to lazy-load replay integration:', err);
      });
  };
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadSentryReplay, { timeout: 5000 });
  } else {
    setTimeout(loadSentryReplay, 2000);
  }
}

// Suppress verbose logging in production builds
if (process.env.NODE_ENV === 'production') {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  // Keep console.warn and console.error for real issues
}

// Catch unhandled errors and promise rejections
window.addEventListener('error', (event) => {
  console.error('[Unhandled Error]', event.error?.message || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason?.message || event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
