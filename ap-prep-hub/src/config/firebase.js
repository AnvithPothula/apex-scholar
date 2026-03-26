import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// For signInWithRedirect to work on custom domains, authDomain MUST be the
// current hostname at runtime (where Netlify proxies /__/* to firebaseapp.com).
// This keeps auth cookies same-origin and avoids third-party cookie blocks.
// On localhost, fall back to the default firebaseapp.com domain.
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const authDomain = isLocalhost
  ? 'ai-study-helper-f2f24.firebaseapp.com'
  : window.location.host; // e.g. "www.apex-scholar.com"

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

let app, auth, db;

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

  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,  // Helps Safari / restricted networks
  });
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Firestore initialized successfully");
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

// Export with error handling
export { auth, db };
export default app;
