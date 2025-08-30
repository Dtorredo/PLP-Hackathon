import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  BookOpen,
  Target,
  Sparkles,
  History,
  Clock,
} from "lucide-react";
import type { FlashcardHistory } from "../../lib/types";
import { LoadingSpinner } from "../ui/LoadingSpinner";

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
  const [module, setModule] = useState("");
  const [specificArea, setSpecificArea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
    <div className="w-80 bg-secondary-800 border-r border-secondary-700 p-4 overflow-y-auto">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-white">
            Flashcard Generator
          </h2>
        </div>
        <p className="text-sm text-gray-300">
          Create personalized flashcards for any subject
        </p>
      </div>

      {/* Module/Subject Input */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <BookOpen className="w-4 h-4 inline mr-1" />
          Module/Subject
        </label>
        <input
          type="text"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Calculus, Physics, Literature..."
          className="input-field w-full"
        />
      </div>

      {/* Specific Area Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Target className="w-4 h-4 inline mr-1" />
          Specific Area (Optional)
        </label>
        <input
          type="text"
          value={specificArea}
          onChange={(e) => setSpecificArea(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Derivatives, Quantum Mechanics..."
          className="input-field w-full"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!module.trim() || isGenerating}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          module.trim() && !isGenerating
            ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl"
            : "bg-secondary-700 text-gray-400 cursor-not-allowed border border-secondary-600"
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
          className="mt-4 p-3 bg-primary-900 border border-primary-800 rounded-lg"
        >
          <p className="text-sm font-medium text-primary-200 mb-1">
            Current Topic:
          </p>
          <p className="text-sm text-primary-300">{selectedTopic}</p>
        </motion.div>
      )}

      {/* Flashcard History */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-medium text-white">Flashcard History</h3>
        </div>

        {flashcardHistory.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-xs">No flashcards generated yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {flashcardHistory.slice(0, 10).map((history) => (
              <motion.button
                key={history.id}
                onClick={() => onHistorySelect(history)}
                className="w-full text-left p-3 bg-secondary-900 border border-secondary-700 rounded-lg hover:border-primary-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white truncate">
                    {history.module}
                  </span>
                  <span className="text-xs text-gray-400">
                    {history.flashcards.length} cards
                  </span>
                </div>
                {history.specificArea && (
                  <p className="text-xs text-gray-400 truncate mb-1">
                    {history.specificArea}
                  </p>
                )}
                <p className="text-xs text-gray-500 truncate">
                  {history.prompt}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(history.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-secondary-900 border border-secondary-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">
          💡 Tips for better flashcards:
        </h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Be specific about the subject area</li>
          <li>• Include the difficulty level you want</li>
          <li>• Mention any specific concepts to focus on</li>
          <li>• You can leave the specific area blank for general topics</li>
        </ul>
      </div>
    </div>
  );
}
