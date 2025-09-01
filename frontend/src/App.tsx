import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trophy, TrendingUp } from "lucide-react";
import { LandingPage } from "./components/pages/LandingPage";
import { ChatPage } from "./components/pages/ChatPage";
import { StudyPlanPage } from "./components/pages/StudyPlanPage";
import { FlashcardsPage } from "./components/pages/FlashcardsPage";
import { PricingPage } from "./components/pages/PricingPage";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ProfilePage } from "./components/pages/ProfilePage";
import { SignUpPage } from "./components/pages/SignUpPage";
import { SignInPage } from "./components/pages/SignInPage";
import { SubjectsPage } from "./components/pages/SubjectsPage";
import type { AppState, User } from "./lib/types";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

function App() {
  const [appState, setAppState] = useState<AppState>({
    user: null,
    currentSession: null,
    isLoading: true,
    error: null,
  });
  const [currentPage, setCurrentPage] = useState(() => {
    // Persist current page in localStorage
    return localStorage.getItem("ai-study-buddy-current-page") || "chat";
  });
  const [authAction, setAuthAction] = useState<"signIn" | "signUp" | null>(
    null
  );

  // Persist current page when it changes
  useEffect(() => {
    localStorage.setItem("ai-study-buddy-current-page", currentPage);
  }, [currentPage]);

  // Update last active time when user is active
  useEffect(() => {
    if (appState.user) {
      const interval = setInterval(updateLastActive, 5 * 60 * 1000); // Update every 5 minutes
      return () => clearInterval(interval);
    }
  }, [appState.user]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userRef);

        let user: User;
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Convert Firestore Timestamps to JavaScript Date objects
          user = {
            ...userData,
            id: fbUser.uid,
            createdAt: userData.createdAt?.toDate?.() || new Date(),
            lastActive: userData.lastActive?.toDate?.() || new Date(),
            achievements: userData.achievements || [],
            flashcardHistory: userData.flashcardHistory || [],
          } as User;
        } else {
          // Create new user document if it doesn't exist
          user = {
            id: fbUser.uid,
            name: fbUser.displayName || "Anonymous",
            email: fbUser.email || "",
            points: 0,
            streak: 0,
            subjects: [],
            topics: {},
            achievements: [],
            flashcardHistory: [],
            createdAt: new Date(),
            lastActive: new Date(),
          };
          await setDoc(userRef, user);
        }

        setAppState({
          user,
          currentSession: null,
          isLoading: false,
          error: null,
        });
        // The rendering logic will handle redirecting to SubjectsPage if needed

        setAuthAction(null);
      } else {
        setAppState({
          user: null,
          currentSession: null,
          isLoading: false,
          error: null,
        });
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = () => {
    signOut(auth).finally(() => {
      setAuthAction(null);
    });
  };

  const handleSubjectsComplete = (subjects: string[]) => {
    if (appState.user) {
      const updatedUser = { ...appState.user, subjects };
      setAppState((prev) => ({ ...prev, user: updatedUser }));
    }
  };

  // Update user's last active time
  const updateLastActive = async () => {
    if (appState.user) {
      const userRef = doc(db, "users", appState.user.id);
      await setDoc(userRef, { lastActive: new Date() }, { merge: true });

      // Update local state
      setAppState((prev) => ({
        ...prev,
        user: { ...prev.user!, lastActive: new Date() },
      }));
    }
  };

  // Loading state
  if (appState.isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Auth flow
  if (!appState.user) {
    if (authAction === "signIn") {
      return (
        <SignInPage
          onSignInSuccess={() => setAuthAction(null)}
          onSwitchToSignUp={() => setAuthAction("signUp")}
        />
      );
    }
    if (authAction === "signUp") {
      return (
        <SignUpPage
          onSignUpSuccess={() => setAuthAction(null)}
          onSwitchToSignIn={() => setAuthAction("signIn")}
        />
      );
    }
    return (
      <LandingPage
        onSignIn={() => setAuthAction("signIn")}
        onSignUp={() => setAuthAction("signUp")}
      />
    );
  }

  // New user subjects selection
  if (appState.user.subjects.length === 0) {
    return (
      <SubjectsPage user={appState.user} onComplete={handleSubjectsComplete} />
    );
  }

  // Main application
  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 bg-black shadow-sm border-b border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-white">AI Study Buddy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-300">
                  {appState.user.points} pts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-300">
                  {appState.user.streak} day streak
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-16 z-40 px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center space-x-1 bg-secondary-800/75 backdrop-blur-md border border-secondary-700 rounded-xl px-4 py-2 shadow-lg">
            {[
              { id: "chat", label: "Ask & Learn" },
              { id: "study", label: "Study Plan" },
              { id: "flashcards", label: "Flashcards" },
              { id: "profile", label: "Profile" },
              { id: "pricing", label: "Pricing" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  currentPage === item.id
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-secondary-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[600px]" // Ensure minimum height to prevent layout shifts
          >
            {currentPage === "chat" && <ChatPage user={appState.user} />}
            {currentPage === "study" && (
              <StudyPlanPage user={appState.user} onStateChange={setAppState} />
            )}
            {currentPage === "flashcards" && (
              <FlashcardsPage user={appState.user} />
            )}
            {currentPage === "pricing" && <PricingPage user={appState.user} />}
            {currentPage === "profile" && <ProfilePage user={appState.user} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
