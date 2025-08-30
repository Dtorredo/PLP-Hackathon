import { useState } from "react";
import { motion } from "framer-motion";

interface FlashcardProps {
  question: string;
  answer: string;
}

// Function to format answer with syntax highlighting for code blocks
function formatAnswer(answer: string): string {
  return answer
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || "text";
      return `<div class="bg-secondary-700 rounded-lg p-4 my-3 border border-secondary-600">
        <div class="text-xs text-gray-400 mb-2 font-mono">${language}</div>
        <pre class="text-sm font-mono text-green-300 overflow-x-auto">${code.trim()}</pre>
      </div>`;
    })
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-secondary-700 px-1 py-0.5 rounded text-sm font-mono text-green-300">$1</code>'
    )
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-bold text-white">$1</strong>'
    )
    .replace(/\n/g, "<br>");
}

export function Flashcard({ question, answer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="h-full w-full cursor-pointer group"
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
          className="absolute flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-secondary-800 to-secondary-900 p-8 shadow-2xl border-2 border-dotted border-white/30 backdrop-blur-sm transition-all duration-300 group-hover:shadow-3xl group-hover:border-white/40"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center max-w-full">
            <div className="mb-4">
              <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full"></div>
            </div>
            <p className="text-xl font-bold text-white leading-relaxed break-words">
              {question}
            </p>
            <div className="mt-4 text-xs text-gray-400 font-medium">
              Click to reveal answer
            </div>
          </div>
        </div>
        {/* Back of the card */}
        <div
          className="absolute flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-secondary-800 to-secondary-900 p-8 shadow-2xl border-2 border-dotted border-white/30 backdrop-blur-sm transition-all duration-300 group-hover:shadow-3xl group-hover:border-white/40"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center max-w-full max-h-full overflow-y-auto">
            <div className="mb-4">
              <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto rounded-full"></div>
            </div>
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: formatAnswer(answer) }} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
