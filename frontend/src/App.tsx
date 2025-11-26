import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { LogOutIcon } from "./components/ui/LogOutIcon";
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
import { ThemeProvider, useTheme } from "./lib/theme.tsx";
import { PageStateProvider } from "./lib/pageState.tsx";

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
  if (appState.user && appState.user.subjects.length === 0) {
    return (
      <SubjectsPage user={appState.user} onComplete={handleSubjectsComplete} />
    );
  }

  // Main application
  return (
    <ThemeProvider>
      <PageStateProvider>
        <MainApp
          appState={appState}
          setAppState={setAppState}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
        />
      </PageStateProvider>
    </ThemeProvider>
  );
}

export default App;

function MainApp({
  appState,
  setAppState,
  currentPage,
  setCurrentPage,
  handleLogout,
}: {
  appState: AppState;
  setAppState: (state: AppState | ((prev: AppState) => AppState)) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  // Theme-aware classes for the main app layout
  const getAppThemeClasses = () => {
    return {
      background: theme === "light" ? "bg-[#FAF5FA]" : "bg-[#231E28]",
      header:
        theme === "light"
          ? "bg-[#FAF5FA] shadow-sm border-b border-gray-200"
          : "bg-[#231E28] shadow-sm border-b border-secondary-700",
      nav:
        theme === "light"
          ? "bg-[#FAF5FA]/75 backdrop-blur-md border border-gray-200"
          : "bg-secondary-800/75 backdrop-blur-md border border-secondary-700",
      navActive:
        theme === "light"
          ? "bg-pink-600 text-white shadow-sm"
          : "bg-primary-600 text-white shadow-sm",
      navInactive:
        theme === "light"
          ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          : "text-gray-300 hover:text-white hover:bg-secondary-700",
      text: theme === "light" ? "text-gray-900" : "text-white",
      textSecondary: theme === "light" ? "text-gray-600" : "text-gray-300",
      icon: theme === "light" ? "text-pink-600" : "text-primary-600",
    };
  };

  const appThemeClasses = getAppThemeClasses();

  return (
    <div className={`min-h-screen ${appThemeClasses.background}`}>
      {/* Small navbar with theme toggle and logout at top right */}
      <div className="fixed top-16 md:top-4 right-4 z-50">
        <div
          className={`flex items-center gap-1 md:gap-2 ${appThemeClasses.nav} rounded-lg px-2 md:px-3 py-1 md:py-2 shadow-lg`}
        >
          <button
            onClick={toggleTheme}
            className={`p-1 md:p-2 rounded-md transition-colors ${
              theme === "light"
                ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                : "text-gray-300 hover:text-white hover:bg-secondary-700"
            }`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`p-1 md:p-2 rounded-md transition-colors ${
              theme === "light"
                ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                : "text-gray-300 hover:text-white hover:bg-secondary-700"
            }`}
            title="Logout"
          >
            <LogOutIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <nav className="fixed top-4 left-4 md:left-1/2 md:transform md:-translate-x-1/2 z-40 px-2 md:px-4 py-2">
        <div className="max-w-2xl mx-auto">
          <div
            className={`flex justify-start md:justify-center space-x-1 ${appThemeClasses.nav} rounded-xl px-2 md:px-4 py-2 shadow-lg`}
          >
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
                className={`px-2 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-200 ${
                  currentPage === item.id
                    ? appThemeClasses.navActive
                    : appThemeClasses.navInactive
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 sm:px-6 lg:px-8 py-4 pt-24 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {currentPage === "chat" && appState.user && (
              <ChatPage user={appState.user} />
            )}
            {currentPage === "study" && appState.user && (
              <StudyPlanPage
                user={appState.user}
                onStateChange={(state) => {
                  // Update the app state when StudyPlanPage changes it
                  setAppState(state);
                }}
              />
            )}
            {currentPage === "flashcards" && appState.user && (
              <FlashcardsPage user={appState.user} />
            )}
            {currentPage === "pricing" && appState.user && (
              <PricingPage user={appState.user} />
            )}
            {currentPage === "profile" && appState.user && (
              <ProfilePage user={appState.user} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
