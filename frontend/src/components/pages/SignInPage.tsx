import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";
import { signInWithEmail } from "../../lib/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { signInWithPopup, signInWithRedirect } from "firebase/auth";

interface SignInPageProps {
  onSignInSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export function SignInPage({
  onSignInSuccess,
  onSwitchToSignUp,
}: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      onSignInSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during sign in.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Starting Google sign-in...");
      console.log("Firebase config:", {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + "...",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      });

      // Force account selection by setting custom parameters
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });

      // Try popup first
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Google sign-in successful (popup):", result.user.email);
        onSignInSuccess();
        return;
      } catch (popupError) {
        console.log("Popup failed, trying redirect:", popupError);
        // If popup fails, try redirect
        await signInWithRedirect(auth, googleProvider);
        // Note: page will redirect, so we don't call onSignInSuccess here
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (err instanceof Error) {
        setError(`Google sign-in failed: ${err.message}`);
      } else {
        setError("An unknown error occurred during Google sign in.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <LogIn className="mx-auto h-12 w-12 text-primary-500" />
          <h1 className="text-3xl font-bold text-white mt-4">Sign In</h1>
          <p className="text-gray-300 mt-2">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <div className="card space-y-6">
          {error && (
            <div
              className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-secondary-900 px-2 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-secondary-800 border border-secondary-700 text-white font-medium py-2 px-4 rounded-lg hover:bg-secondary-700 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 92.6 280.2 80 248 80c-82.8 0-150.5 63.5-150.5 141.5S165.2 393 248 393c52.5 0 95.5-22.2 123.3-49.3l63.8 63.8C414.5 453.4 338.5 504 248 504z"
              ></path>
            </svg>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Signing In...
              </>
            ) : (
              "Sign in with Google"
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignUp}
              className="font-medium text-primary-500 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
