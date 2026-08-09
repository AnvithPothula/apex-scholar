import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For signInWithRedirect to work, authDomain MUST be the current host, with
// /__/* proxied to firebaseapp.com, so the auth handler is same-origin — that
// is what Safari ITP / third-party-cookie blocking requires.
//   - production: Netlify proxies /__/* (public/_redirects)
//   - localhost:  the CRA dev server proxies /__/* (src/setupProxy.js)
//
// CRITICAL: only use the runtime host when the page is served over HTTPS.
// Firebase always builds the handler URL as `https://{authDomain}/__/auth/...`,
// so pointing it at a plain-http dev server produces
// https://localhost:3000/__/auth/handler -> "Safari can't establish a secure
// connection". Over http we fall back to the firebaseapp.com domain, which
// loads but is cross-origin (so Safari ITP can still null out
// getRedirectResult on localhost — run `HTTPS=true npm start` to test the real
// flow locally, or use a Netlify deploy preview).
const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
const authDomain = isSecure
  ? window.location.host // e.g. "www.apex-scholar.com", or "localhost:3000" under HTTPS=true
  : 'ai-study-helper-f2f24.firebaseapp.com';

/**
 * True when the Firebase auth handler is served from our own origin.
 *
 * This decides which sign-in flow is even usable:
 *   same-origin  -> signInWithRedirect works (no third-party storage involved)
 *   cross-origin -> Safari ITP blocks the storage redirect depends on, so
 *                   getRedirectResult() resolves to null and the user is
 *                   silently bounced back to the login page. Popup is the only
 *                   flow that works there.
 * Production is always same-origin; plain-http localhost never is.
 */
export const authIsSameOrigin = isSecure;

// Validate required env vars at startup — no hardcoded fallbacks
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_APP_ID',
];
const missing = requiredEnvVars.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`Missing required Firebase environment variables: ${missing.join(', ')}. Check your .env file.`);
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain,  // Always use runtime hostname in production — do NOT override via env var
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

if (process.env.NODE_ENV === 'development') {
  console.log("🔥 Firebase config loaded:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
} else {
  // Log authDomain in production to help diagnose redirect auth issues
  console.log("🔥 Firebase authDomain:", firebaseConfig.authDomain);
}

let app, auth;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Firebase app initialized successfully");
  }

  // Initialize Firebase services with error handling
  auth = getAuth(app);
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Firebase Auth initialized successfully");
  }

} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error.message);

  // Only log full error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error("Error details:", {
      code: error.code,
      message: error.message
    });
  }

  // You might want to show a user-friendly error message here
  // or implement a fallback mechanism
}

// Firestore is intentionally NOT initialized here. Importing it at module
// scope pulled the whole @firebase/firestore SDK into the eager bundle, even
// though nothing needs a database read to paint the first screen. It now lives
// in ./firestore, which is loaded on demand.
export { app, auth };
export default app;
