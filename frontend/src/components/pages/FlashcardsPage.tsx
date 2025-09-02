import { useEffect, useState } from "react";
import type { User, FlashcardHistory } from "../../lib/types";
import { FlashcardStack } from "../features/FlashcardStack";
import type { FlashcardData } from "../features/FlashcardStack";
import { CourseSidebar } from "../features/CourseSidebar";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useTheme } from "../../lib/theme.tsx";
import { usePersistentState } from "../../lib/pageState.tsx";

interface FlashcardsPageProps {
  user: User;
}

export function FlashcardsPage({ user }: FlashcardsPageProps) {
  const { theme } = useTheme();
  
  // Use persistent state for key variables
  const [selectedTopic, setSelectedTopic] = usePersistentState<string>("flashcards", "selectedTopic", "");
  const [flashcards, setFlashcards] = usePersistentState<FlashcardData[]>("flashcards", "flashcards", []);
  const [flashcardHistory, setFlashcardHistory] = usePersistentState<FlashcardHistory[]>("flashcards", "flashcardHistory", []);
  
  // Keep non-persistent state for session and loading
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Log when flashcards change
  useEffect(() => {
    console.log("Flashcards state updated:", flashcards);
  }, [flashcards]);

  // Theme-aware classes
  const getThemeClasses = () => {
    return {
      text: theme === "light" ? "text-gray-900" : "text-white",
      textSecondary: theme === "light" ? "text-gray-600" : "text-gray-300",
    };
  };

  const themeClasses = getThemeClasses();

  useEffect(() => {
    setSessionId(`${user.id}-flash-${Date.now()}`);
    loadFlashcardHistory();
  }, [user.id]);

  const loadFlashcardHistory = async () => {
    try {
      console.log("Loading flashcard history for user:", user.id);
      const historyRef = collection(db, "users", user.id, "flashcardHistory");
      const q = query(historyRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      console.log("Found", querySnapshot.size, "flashcard history documents");

      const history: FlashcardHistory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("History document data:", data);

        const historyItem: FlashcardHistory = {
          id: doc.id,
          prompt: data.prompt,
          module: data.module,
          specificArea: data.specificArea || undefined,
          flashcards: data.flashcards || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          lastViewed: data.lastViewed?.toDate(),
        };

        history.push(historyItem);
      });

      console.log("Processed history:", history);
      setFlashcardHistory(history);
    } catch (error) {
      console.error("Error loading flashcard history:", error);
    }
  };

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3001"
        }/api/v1/flashcards/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic, count: 8 }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data.flashcards);

        // Save to history
        await saveToHistory(topic, data.flashcards);
      } else {
        console.error("Failed to generate flashcards");
        setFlashcards([]);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setFlashcards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = async (
    topic: string,
    generatedFlashcards: FlashcardData[]
  ) => {
    try {
      const [module, specificArea] = topic.includes(" - ")
        ? topic.split(" - ", 2)
        : [topic, ""];

      const historyRef = collection(db, "users", user.id, "flashcardHistory");
      await addDoc(historyRef, {
        prompt: topic,
        module,
        specificArea: specificArea || null,
        flashcards: generatedFlashcards.map((card) => ({
          id: card.id.toString(),
          question: card.question,
          answer: card.answer,
        })),
        createdAt: serverTimestamp(),
        lastViewed: serverTimestamp(),
      });

      // Reload history
      await loadFlashcardHistory();
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  const handleHistorySelect = (history: FlashcardHistory) => {
    console.log("Loading history:", history);
    console.log("History flashcards:", history.flashcards);

    setSelectedTopic(history.prompt);

    const mappedFlashcards = history.flashcards.map((card) => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
      topic: history.prompt,
    }));

    console.log("Mapped flashcards:", mappedFlashcards);
    setFlashcards(mappedFlashcards);
  };

  const handleProgress = async (cardId: string | number) => {
    if (!sessionId || !selectedTopic) return;

    const sessionRef = doc(
      db,
      "users",
      user.id,
      "flashcardSessions",
      sessionId
    );
    await setDoc(
      sessionRef,
      {
        createdAt: serverTimestamp(),
        userId: user.id,
        topic: selectedTopic,
      },
      { merge: true }
    );

    await addDoc(
      collection(
        db,
        "users",
        user.id,
        "flashcardSessions",
        sessionId,
        "events"
      ),
      {
        type: "card-reviewed",
        cardId,
        topic: selectedTopic,
        ts: serverTimestamp(),
      }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full pt-4">
      {/* Sidebar - Top on mobile, left on desktop */}
      <div className="lg:w-80 lg:flex-shrink-0">
        <CourseSidebar
          onTopicSelect={handleTopicSelect}
          selectedTopic={selectedTopic}
          flashcardHistory={flashcardHistory}
          onHistorySelect={handleHistorySelect}
        />
      </div>

      {/* Main content - Below sidebar on mobile, right side on desktop */}
      <div className="flex-1 p-2 lg:p-6 lg:pl-2">
        <div className="max-w-4xl mx-auto">
          {/* Centered flashcard stack with floating effect */}
          <div className="flex flex-col justify-center items-center min-h-[400px] lg:min-h-[500px]">
            <div className="mb-4 text-center">
              <h2 className={`text-lg font-semibold ${themeClasses.text} mb-1`}>
                AI-Powered Flashcards
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {selectedTopic
                  ? `Studying: ${selectedTopic}`
                  : "Select a topic from the sidebar to generate personalized flashcards"}
              </p>
            </div>
            <FlashcardStack
              key={selectedTopic} // Force re-render when topic changes
              flashcards={flashcards}
              onCardSentToBack={handleProgress}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
