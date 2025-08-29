import { useEffect, useState } from "react";
import type { User, AppState } from "../../lib/types";
import { FlashcardStack } from "../features/FlashcardStack";
import { CourseSidebar } from "../features/CourseSidebar";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface FlashcardData {
  id: number;
  question: string;
  answer: string;
  topic?: string;
}

interface FlashcardsPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

export function FlashcardsPage({ user, onStateChange }: FlashcardsPageProps) {
  const [sessionId, setSessionId] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSessionId(`${user.id}-flash-${Date.now()}`);
  }, [user.id]);

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/flashcards/generate",
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

  const handleProgress = async (cardId: number) => {
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
    <div className="flex h-full">
      <CourseSidebar
        onTopicSelect={handleTopicSelect}
        selectedTopic={selectedTopic}
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI-Powered Flashcards
            </h2>
            <p className="text-gray-600">
              {selectedTopic
                ? `Studying: ${selectedTopic}`
                : "Select a topic from the sidebar to generate personalized flashcards"}
            </p>
          </div>

          {/* Centered flashcard stack with floating effect */}
          <div className="flex justify-center items-center min-h-[500px]">
            <FlashcardStack
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
