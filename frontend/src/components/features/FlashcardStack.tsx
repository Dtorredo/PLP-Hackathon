import { CardStack } from "../core/CardStack";
import type { StackableItem } from "../../lib/types";
import { Flashcard } from "./Flashcard";

interface FlashcardData extends StackableItem {
  question: string;
  answer: string;
}

export function FlashcardStack() {
  const items: FlashcardData[] = [
    { id: 1, question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
    { id: 2, question: "What is the capital of France?", answer: "Paris" },
    { id: 3, question: "What is 2 + 2?", answer: "4" },
    { id: 4, question: "What is the chemical symbol for water?", answer: "H2O" },
  ];

  return (
    <CardStack items={items}>
      {(card) => (
        <Flashcard question={card.question} answer={card.answer} />
      )}
    </CardStack>
  );
}
