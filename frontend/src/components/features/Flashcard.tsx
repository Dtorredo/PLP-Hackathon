import { useState } from "react";
import { motion } from "framer-motion";

interface FlashcardProps {
  question: string;
  answer: string;
}

export function Flashcard({ question, answer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="h-full w-full cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Front of the card */}
        <div
          className="absolute flex h-full w-full items-center justify-center rounded-lg bg-white p-6 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-lg font-bold text-center leading-relaxed break-words">
            {question}
          </p>
        </div>
        {/* Back of the card */}
        <div
          className="absolute flex h-full w-full items-center justify-center rounded-lg bg-white p-6 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-base text-center leading-relaxed break-words overflow-y-auto">
            {answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
