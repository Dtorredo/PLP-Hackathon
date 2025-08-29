import { CardStack } from "../core/CardStack";
import type { StackableItem } from "../../lib/types";
import { Flashcard } from "./Flashcard";

interface FlashcardData extends StackableItem {
  question: string;
  answer: string;
  topic?: string;
  [key: string]: unknown;
}

interface FlashcardStackProps {
  flashcards: FlashcardData[];
  onCardSentToBack?: (id: number | string) => void;
  isLoading?: boolean;
}

export function FlashcardStack({
  flashcards,
  onCardSentToBack,
  isLoading,
}: FlashcardStackProps) {
  if (isLoading) {
    // 🎯 LOADING STATE SIZE - Match this with the card size in CardStack.tsx
    return (
      <div className="h-96 w-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Generating flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    // 🎯 EMPTY STATE SIZE - Match this with the card size in CardStack.tsx
    return (
      <div className="h-96 w-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Select a topic to generate flashcards</p>
        </div>
      </div>
    );
  }

  return (
    <CardStack items={flashcards} onCardSentToBack={onCardSentToBack}>
      {(card) => <Flashcard question={card.question} answer={card.answer} />}
    </CardStack>
  );
}
