import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/theme.tsx";

interface FlashcardProps {
  question: string;
  answer: string;
}

// Function to format answer with syntax highlighting for code blocks
function formatAnswer(answer: string, theme: string): string {
  const isLight = theme === "light";
  const codeBlockBg = isLight ? "bg-gray-800" : "bg-secondary-700";
  const codeBlockBorder = isLight ? "border-gray-700" : "border-secondary-600";
  const codeText = isLight ? "text-purple-300" : "text-green-300";
  const languageText = isLight ? "text-gray-300" : "text-gray-400";
  const strongText = isLight ? "text-gray-900" : "text-white";

  return answer
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
      const language = lang || "text";
      return `<div class="${codeBlockBg} rounded-lg p-4 my-3 border ${codeBlockBorder}">
        <div class="text-xs ${languageText} mb-2 font-mono">${language}</div>
        <pre class="text-sm font-mono ${codeText} overflow-x-auto">${code.trim()}</pre>
      </div>`;
    })
    .replace(
      /`([^`]+)`/g,
      `<code class="${codeBlockBg} px-1 py-0.5 rounded text-sm font-mono ${codeText}">$1</code>`
    )
    .replace(
      /\*\*([^*]+)\*\*/g,
      `<strong class="font-bold ${strongText}">$1</strong>`
    )
    .replace(/\n/g, "<br>");
}

export function Flashcard({ question, answer }: FlashcardProps) {
  const { theme } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  // Theme-aware classes
  const getThemeClasses = () => {
    return {
      card:
        theme === "light"
          ? "bg-[#F5E8F6] border-purple-200"
          : "bg-gradient-to-br from-secondary-800 to-secondary-900 border-white/30",
      cardHover:
        theme === "light" ? "hover:border-purple-300" : "hover:border-white/40",
      text: theme === "light" ? "text-gray-900" : "text-white",
      textSecondary: theme === "light" ? "text-gray-600" : "text-gray-400",
      accentLine:
        theme === "light"
          ? "bg-gradient-to-r from-purple-500 to-purple-600"
          : "bg-gradient-to-r from-primary-500 to-primary-600",
      accentLineGreen:
        theme === "light"
          ? "bg-gradient-to-r from-green-500 to-green-600"
          : "bg-gradient-to-r from-green-500 to-green-600",
    };
  };

  const themeClasses = getThemeClasses();

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
          className={`absolute flex h-full w-full items-center justify-center rounded-xl ${themeClasses.card} p-8 shadow-2xl border-2 border-dotted ${themeClasses.cardHover} backdrop-blur-sm transition-all duration-300 group-hover:shadow-3xl`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center max-w-full">
            <div className="mb-4">
              <div
                className={`w-12 h-1 ${themeClasses.accentLine} mx-auto rounded-full`}
              ></div>
            </div>
            <p
              className={`text-xl font-bold ${themeClasses.text} leading-relaxed break-words`}
            >
              {question}
            </p>
            <div
              className={`mt-4 text-xs ${themeClasses.textSecondary} font-medium`}
            >
              Click to reveal answer
            </div>
          </div>
        </div>
        {/* Back of the card */}
        <div
          className={`absolute flex h-full w-full items-center justify-center rounded-xl ${themeClasses.card} p-8 shadow-2xl border-2 border-dotted ${themeClasses.cardHover} backdrop-blur-sm transition-all duration-300 group-hover:shadow-3xl`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className={`text-center max-w-full max-h-full overflow-y-auto ${themeClasses.text}`}
          >
            <div className="mb-4">
              <div
                className={`w-12 h-1 ${themeClasses.accentLineGreen} mx-auto rounded-full`}
              ></div>
            </div>
            <div className="max-w-none text-sm leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: formatAnswer(answer, theme),
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
