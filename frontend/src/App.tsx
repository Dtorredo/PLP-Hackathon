import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, TrendingUp } from 'lucide-react';
import { LandingPage } from './components/pages/LandingPage';
import { ChatPage } from './components/pages/ChatPage';
import { StudyPlanPage } from './components/pages/StudyPlanPage';
import { FlashcardsPage } from './components/pages/FlashcardsPage';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ProfilePage } from './components/pages/ProfilePage';
import { OnboardingPage } from './components/pages/OnboardingPage';
import type { AppState, User } from './lib/types';
import { generateUserId } from './lib/utils';

const defaultUser: User = {
  id: '',
  name: '',
  email: '',
  points: 0,
  streak: 0,
  subjects: [],
  topics: {},
  createdAt: new Date(),
  lastActive: new Date(),
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    user: null,
    currentSession: null,
    isLoading: false,
    error: null,
  });
  const [currentPage, setCurrentPage] = useState('landing');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const newUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || '',
          email: fbUser.email || '',
          points: 0,
          streak: 0,
          subjects: [],
          topics: {},
          createdAt: new Date(),
          lastActive: new Date(),
        };
        setAppState(prev => ({ ...prev, user: newUser }));
        localStorage.setItem('ai-study-buddy-user', JSON.stringify(newUser));
        setCurrentPage('chat');
      } else {
        const savedUser = localStorage.getItem('ai-study-buddy-user');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            user.createdAt = new Date(user.createdAt);
            user.lastActive = new Date(user.lastActive);
            setAppState(prev => ({ ...prev, user }));
            setCurrentPage('chat');
          } catch (error) {
            console.error('Error parsing saved user:', error);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  const handleUserCreate = (userData: Partial<User>) => {
    const newUser: User = {
      ...defaultUser,
      ...userData,
      id: generateUserId(),
      createdAt: new Date(),
      lastActive: new Date(),
    };
    
    setAppState(prev => ({ ...prev, user: newUser }));
    localStorage.setItem('ai-study-buddy-user', JSON.stringify(newUser));
    setCurrentPage('chat');
  };

  const handleLogout = () => {
    signOut(auth).finally(() => {
      setAppState(prev => ({ ...prev, user: null, currentSession: null }));
      localStorage.removeItem('ai-study-buddy-user');
      setCurrentPage('landing');
    });
  };

  if (showOnboarding) {
    return (
      <OnboardingPage 
        onComplete={handleUserCreate}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  if (currentPage === 'landing') {
    return (
      <LandingPage 
        onGetStarted={() => setShowOnboarding(true)}
        onDemo={() => {
          const demoUser: User = {
            ...defaultUser,
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@example.com',
            points: 150,
            streak: 3,
            subjects: ['Calculus', 'Algebra'],
            topics: {
              'calculus': { attempts: 8, correct: 6, lastSeen: Date.now(), strength: 0.75 },
              'algebra': { attempts: 5, correct: 3, lastSeen: Date.now(), strength: 0.6 },
            },
            createdAt: new Date(),
            lastActive: new Date(),
          };
          setAppState(prev => ({ ...prev, user: demoUser }));
          setCurrentPage('chat');
        }}
      />
    );
  }

  if (!appState.user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">AI Study Buddy</h1>
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

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'chat', label: 'Ask & Learn', path: '/chat' },
              { id: 'study', label: 'Study Plan', path: '/study' },
              { id: 'flashcards', label: 'Flashcards', path: '/flashcards' },
              { id: 'profile', label: 'Profile', path: '/profile' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === 'chat' && (
              <ChatPage 
                user={appState.user}
                onStateChange={setAppState}
              />
            )}
            {currentPage === 'study' && (
              <StudyPlanPage 
                user={appState.user}
                onStateChange={setAppState}
              />
            )}
            {currentPage === 'flashcards' && (
              <FlashcardsPage 
                user={appState.user}
                onStateChange={setAppState}
              />
            )}
            {currentPage === 'profile' && (
              <ProfilePage 
                user={appState.user}
                onStateChange={setAppState}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
