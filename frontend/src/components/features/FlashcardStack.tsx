import { CardStack } from "../core/CardStack";
import type { StackableItem } from "../../lib/types";
import { Flashcard } from "./Flashcard";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useTheme } from "../../lib/theme.tsx";

export interface FlashcardData extends StackableItem {
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
  const { theme } = useTheme();

  const getThemeClasses = () => {
    return {
      text: theme === "light" ? "text-gray-600" : "text-gray-400",
    };
  };

  const themeClasses = getThemeClasses();

  if (isLoading) {
    // 🎯 LOADING STATE SIZE - Match this with the card size in CardStack.tsx
    return (
      <div className="h-[420px] w-[420px] flex items-center justify-center">
        <LoadingSpinner size="md" text="Generating flashcards..." />
      </div>
    );
  }

  if (flashcards.length === 0) {
    // 🎯 EMPTY STATE SIZE - Match this with the card size in CardStack.tsx
    return (
      <div className="h-[420px] w-[420px] flex items-center justify-center">
        <div className="text-center">
          <p className={themeClasses.text}>
            Select a topic to generate flashcards
          </p>
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
