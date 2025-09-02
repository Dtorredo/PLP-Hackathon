import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase web app config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check for missing environment variables
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value && key !== "measurementId") {
    // In a Vite build, `process.env.NODE_ENV` is statically replaced,
    // allowing for dead code elimination.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Missing Firebase env var: VITE_FIREBASE_${key
          .replace(/([A-Z])/g, "_$1")
          .toUpperCase()}`
      );
    } else {
      // In production, throw an error to prevent using an incomplete config.
      throw new Error(
        `Missing Firebase environment variable: VITE_FIREBASE_${key
          .replace(/([A-Z])/g, "_$1")
          .toUpperCase()}`
      );
    }
  }
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Optional: Analytics (browser-only, supported environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
