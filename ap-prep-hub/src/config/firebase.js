import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For signInWithRedirect to work on custom domains, authDomain MUST be the
// current hostname at runtime (where Netlify proxies /__/* to firebaseapp.com).
// This keeps auth cookies same-origin and avoids third-party cookie blocks.
// On localhost, fall back to the default firebaseapp.com domain.
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const authDomain = isLocalhost
  ? 'ai-study-helper-f2f24.firebaseapp.com'
  : window.location.host; // e.g. "www.apex-scholar.com"

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDTEBAW1r2EALeZHltn-xhRloXB4UzokMI",
  authDomain,  // Always use runtime hostname in production — do NOT override via env var
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://ai-study-helper-f2f24-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ai-study-helper-f2f24",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ai-study-helper-f2f24.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "634347733489",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:634347733489:web:d00a26255a993c2e308450",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-Q27DPEG7S5"
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

  db = getFirestore(app);
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Firestore initialized successfully");
  }

    // Add connection monitoring
  const monitorConnection = () => {
    // Simple connection test
    setTimeout(async () => {
      try {
        // Try a simple auth state check - accessing currentUser
        if (auth.currentUser !== undefined) {
          // Connection is working
        }
      } catch (error) {
        console.warn("⚠️ Firebase connection check failed:", error.message);
      }
    }, 2000);
  };

  monitorConnection();

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
