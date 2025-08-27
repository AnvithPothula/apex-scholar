import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDTEBAW1r2EALeZHltn-xhRloXB4UzokMI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ai-study-helper-f2f24.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://ai-study-helper-f2f24-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ai-study-helper-f2f24",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ai-study-helper-f2f24.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "634347733489",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:634347733489:web:d00a26255a993c2e308450",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-Q27DPEG7S5"
};

console.log("🔥 Firebase config loaded:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

let app, auth, db;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase app initialized successfully");

  // Initialize Firebase services with error handling
  auth = getAuth(app);
  console.log("✅ Firebase Auth initialized successfully");

  db = getFirestore(app);
  console.log("✅ Firestore initialized successfully");

  // Add connection monitoring
  const monitorConnection = () => {
    // Simple connection test
    setTimeout(async () => {
      try {
        // Try a simple auth state check
        const currentUser = auth.currentUser;
        console.log("🔍 Firebase connection check - Current user:", currentUser ? "authenticated" : "not authenticated");
      } catch (error) {
        console.warn("⚠️ Firebase connection check failed:", error.message);
      }
    }, 2000);
  };

  monitorConnection();

} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error);
  console.error("Error details:", {
    code: error.code,
    message: error.message,
    stack: error.stack
  });
  
  // You might want to show a user-friendly error message here
  // or implement a fallback mechanism
}

// Export with error handling
export { auth, db };
export default app;
