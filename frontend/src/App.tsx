import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trophy, TrendingUp } from "lucide-react";
import { LandingPage } from "./components/pages/LandingPage";
import { ChatPage } from "./components/pages/ChatPage";
import { StudyPlanPage } from "./components/pages/StudyPlanPage";
import { FlashcardsPage } from "./components/pages/FlashcardsPage";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ProfilePage } from "./components/pages/ProfilePage";
import { SignUpPage } from "./components/pages/SignUpPage";
import { SignInPage } from "./components/pages/SignInPage";
import { SubjectsPage } from "./components/pages/SubjectsPage";
import type { AppState, User } from "./lib/types";

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userRef);

        let user: User;
        if (userSnap.exists()) {
          user = userSnap.data() as User;
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

  // Loading state
  if (appState.isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">
                AI Study Buddy
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {appState.user.points} pts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  {appState.user.streak} day streak
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "chat", label: "Ask & Learn" },
              { id: "study", label: "Study Plan" },
              { id: "flashcards", label: "Flashcards" },
              { id: "profile", label: "Profile" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  currentPage === item.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[600px]" // Ensure minimum height to prevent layout shifts
          >
            {currentPage === "chat" && (
              <ChatPage user={appState.user} onStateChange={setAppState} />
            )}
            {currentPage === "study" && (
              <StudyPlanPage user={appState.user} onStateChange={setAppState} />
            )}
            {currentPage === "flashcards" && (
              <FlashcardsPage
                user={appState.user}
                onStateChange={setAppState}
              />
            )}
            {currentPage === "profile" && (
              <ProfilePage user={appState.user} onStateChange={setAppState} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
