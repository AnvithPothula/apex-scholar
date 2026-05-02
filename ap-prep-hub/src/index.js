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
      // Session Replay — records a video-like reproduction of user sessions.
      //
      // Privacy: maskAllText + blockAllMedia are ON because this app shows
      // user-generated content (tutor chats, FRQ answers, schedules,
      // homework photos) that should never leave the browser. To surface
      // specific UI labels in replays, mark them with `data-sentry-unmask`
      // on a case-by-case basis.
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
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

    // Session Replay sampling — Sentry's recommended defaults:
    //   replaysSessionSampleRate:  10% of all sessions are recorded
    //   replaysOnErrorSampleRate:  100% of sessions where an error occurs
    //
    // Free tier = 50 replays/month. Bump replaysSessionSampleRate to 1.0
    // temporarily while debugging a specific issue, then back to 0.1.
    // While testing a NEW Sentry setup (verifying everything works) bump
    // it to 1.0 so you can find your own session quickly.
    replaysSessionSampleRate: 0.1,
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
      // Puter SDK reads `popup.closed` on a window reference that's null
      // when the popup-blocker bites or the socket.io handshake fails.
      // The throw originates inside the SDK's own setInterval, so we can
      // never catch it locally. PuterAuthPrompt has its own watchdog that
      // recovers the UX — the Sentry event itself isn't actionable.
      // Safari form: "null is not an object (evaluating '<x>.closed')"
      /null is not an object \(evaluating '[^']+\.closed'\)/,
      // Chrome / Firefox form: "Cannot read properties of null (reading 'closed')"
      /Cannot read propert(?:y|ies) of null \(reading 'closed'\)/,
    ],
  });
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
