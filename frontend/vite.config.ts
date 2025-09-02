import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  base: "./",
  define: {
    // Provide fallback values for environment variables
    "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(
      process.env.VITE_FIREBASE_API_KEY || "demo-key"
    ),
    "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
      process.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com"
    ),
    "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_FIREBASE_PROJECT_ID || "demo-project"
    ),
    "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
      process.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com"
    ),
    "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789"
    ),
    "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(
      process.env.VITE_FIREBASE_APP_ID || "demo-app-id"
    ),
    "import.meta.env.VITE_FIREBASE_MEASUREMENT_ID": JSON.stringify(
      process.env.VITE_FIREBASE_MEASUREMENT_ID || ""
    ),
  },
});
