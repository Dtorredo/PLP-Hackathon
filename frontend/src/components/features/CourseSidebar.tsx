import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, Sparkles, History, Clock } from "lucide-react";
import type { FlashcardHistory } from "../../lib/types";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useTheme } from "../../lib/theme.tsx";
import { PandaIcon } from "../ui/PandaIcon";

interface CourseSidebarProps {
  onTopicSelect: (topic: string) => void;
  selectedTopic?: string;
  flashcardHistory: FlashcardHistory[];
  onHistorySelect: (history: FlashcardHistory) => void;
}

export function CourseSidebar({
  onTopicSelect,
  selectedTopic,
  flashcardHistory,
  onHistorySelect,
}: CourseSidebarProps) {
  const { theme } = useTheme();
  const [module, setModule] = useState("");
  const [specificArea, setSpecificArea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Theme-aware classes
  const getThemeClasses = () => {
    return {
      container:
        theme === "light"
          ? "bg-[#F2DEF6] border-r border-gray-200"
          : "bg-[#140D13] border-r border-secondary-700",
      text: theme === "light" ? "text-gray-900" : "text-white",
      textSecondary: theme === "light" ? "text-gray-600" : "text-gray-300",
      textTertiary: theme === "light" ? "text-gray-500" : "text-gray-400",
      input:
        theme === "light"
          ? "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          : "bg-secondary-800 border border-secondary-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500",
      button:
        theme === "light"
          ? "bg-pink-600 hover:bg-pink-700 text-white"
          : "bg-primary-600 hover:bg-primary-700 text-white",
      buttonDisabled:
        theme === "light"
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "bg-secondary-700 text-gray-400 cursor-not-allowed border border-secondary-600",
      currentTopic:
        theme === "light"
          ? "bg-pink-50 border border-pink-200"
          : "bg-primary-900 border border-primary-800",
      currentTopicText:
        theme === "light" ? "text-pink-800" : "text-primary-200",
      currentTopicTextSecondary:
        theme === "light" ? "text-pink-700" : "text-primary-300",
      historyItem:
        theme === "light"
          ? "bg-[#FBF2FC] border border-gray-800/20 shadow-sm hover:border-pink-300 hover:bg-gray-100"
          : "bg-secondary-900 border border-secondary-700 hover:border-primary-600 hover:bg-secondary-800",
      historyBadge:
        theme === "light"
          ? "bg-gray-100 text-gray-600"
          : "bg-secondary-800 text-gray-400",
      tips:
        theme === "light"
          ? "bg-[#F2DEF6] border border-gray-200"
          : "bg-secondary-900 border border-secondary-700",
      icon: theme === "light" ? "text-pink-600" : "text-primary-500",
    };
  };

  const themeClasses = getThemeClasses();

  const handleGenerate = () => {
    if (!module.trim()) return;

    setIsGenerating(true);

    // Combine module and specific area into a comprehensive topic
    const topic = specificArea.trim() ? `${module} - ${specificArea}` : module;

    onTopicSelect(topic);

    // Reset generating state after a short delay
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  return (
    <div
      className={`w-full lg:w-80 ${themeClasses.container} p-4 overflow-y-auto rounded-xl shadow-lg sidebar-scrollbar`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <PandaIcon className={`w-5 h-5 ${themeClasses.icon}`} />
          <h2 className={`text-lg font-semibold ${themeClasses.text}`}>
            Flashcard Generator
          </h2>
        </div>
        <p className={`text-sm ${themeClasses.textSecondary}`}>
          Create personalized flashcards for any subject
        </p>
      </div>

      {/* Module/Subject Input */}
      <div className="mb-3">
        <label
          className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
        >
          <BookOpen className="w-4 h-4 inline mr-1" />
          Module/Subject
        </label>
        <input
          type="text"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Calculus, Physics, Literature..."
          className={`${themeClasses.input} w-full px-3 py-2 rounded-lg focus:outline-none`}
        />
      </div>

      {/* Specific Area Input */}
      <div className="mb-4">
        <label
          className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}
        >
          <Target className="w-4 h-4 inline mr-1" />
          Specific Area (Optional)
        </label>
        <input
          type="text"
          value={specificArea}
          onChange={(e) => setSpecificArea(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Derivatives, Quantum Mechanics..."
          className={`${themeClasses.input} w-full px-3 py-2 rounded-lg focus:outline-none`}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!module.trim() || isGenerating}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          module.trim() && !isGenerating
            ? themeClasses.button
            : themeClasses.buttonDisabled
        }`}
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Flashcards
          </>
        )}
      </button>

      {/* Current Topic Display */}
      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 ${themeClasses.currentTopic} rounded-lg`}
        >
          <p
            className={`text-sm font-medium ${themeClasses.currentTopicText} mb-1`}
          >
            Current Topic:
          </p>
          <p className={`text-sm ${themeClasses.currentTopicTextSecondary}`}>
            {selectedTopic}
          </p>
        </motion.div>
      )}

      {/* Flashcard History */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <History className={`w-4 h-4 ${themeClasses.icon}`} />
          <h3 className={`text-sm font-medium ${themeClasses.text}`}>
            Flashcard History
          </h3>
        </div>

        {flashcardHistory.length === 0 ? (
          <div className={`text-center py-4 ${themeClasses.textTertiary}`}>
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-xs">No flashcards generated yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {flashcardHistory.slice(0, 10).map((history) => (
              <motion.button
                key={history.id}
                onClick={() => onHistorySelect(history)}
                className={`w-full text-left p-2 ${themeClasses.historyItem} rounded-lg transition-all duration-200`}
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium ${themeClasses.text} truncate`}
                  >
                    {history.module}
                  </span>
                  <span
                    className={`text-xs ${themeClasses.historyBadge} px-1 py-0.5 rounded`}
                  >
                    {history.flashcards.length} cards
                  </span>
                </div>
                {history.specificArea && (
                  <p
                    className={`text-xs ${themeClasses.textSecondary} truncate mb-1`}
                  >
                    {history.specificArea}
                  </p>
                )}
                <p
                  className={`text-xs ${themeClasses.textTertiary} truncate leading-tight`}
                >
                  {history.prompt}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className={`text-xs ${themeClasses.textTertiary}`}>
                    {new Date(history.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className={`mt-4 p-3 ${themeClasses.tips} rounded-lg`}>
        <h4
          className={`text-sm font-medium ${themeClasses.textSecondary} mb-2`}
        >
          💡 Tips for better flashcards:
        </h4>
        <ul className={`text-xs ${themeClasses.textTertiary} space-y-1`}>
          <li>• Be specific about the subject area</li>
          <li>• Include the difficulty level you want</li>
          <li>• Mention any specific concepts to focus on</li>
          <li>• You can leave the specific area blank for general topics</li>
        </ul>
      </div>
    </div>
  );
}
