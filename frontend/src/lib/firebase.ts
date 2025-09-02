import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase web app config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Only throw error in development
if (import.meta.env.DEV) {
  for (const [key, value] of Object.entries(firebaseConfig)) {
    if (!value && key !== "measurementId") {
      console.warn(
        `Missing Firebase env var: VITE_FIREBASE_${key
          .replace(/([A-Z])/g, "_$1")
          .toUpperCase()
          .replace(/^_/, "")}`
      );
    }
  }
}

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Use a minimal config for fallback
  app = initializeApp({
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id",
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Optional: Analytics (browser-only, supported environments)
export const analytics: null = null;
// Temporarily disable analytics to avoid API key issues
// if (typeof window !== "undefined") {
//   isAnalyticsSupported().then((supported: boolean) => {
//     if (supported) {
//       analytics = getAnalytics(app);
//     }
//   });
// }
