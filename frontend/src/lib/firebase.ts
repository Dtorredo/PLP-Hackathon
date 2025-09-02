import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase web app config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check for missing environment variables and log warnings
const missingVars = [];
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value && key !== "measurementId") {
    missingVars.push(key);
  }
}

if (missingVars.length > 0) {
  console.warn("Missing Firebase environment variables:", missingVars);
  console.warn(
    "Using demo configuration. Please set proper Firebase environment variables."
  );
}

const app = initializeApp(firebaseConfig);

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
