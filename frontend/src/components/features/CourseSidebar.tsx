import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Target, Sparkles } from 'lucide-react';

interface CourseSidebarProps {
  onTopicSelect: (topic: string) => void;
  selectedTopic?: string;
}

export function CourseSidebar({ onTopicSelect, selectedTopic }: CourseSidebarProps) {
  const [module, setModule] = useState('');
  const [specificArea, setSpecificArea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!module.trim()) return;
    
    setIsGenerating(true);
    
    // Combine module and specific area into a comprehensive topic
    const topic = specificArea.trim() 
      ? `${module} - ${specificArea}`
      : module;
    
    onTopicSelect(topic);
    
    // Reset generating state after a short delay
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const suggestedModules = [
    'Calculus', 'Algebra', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'History', 'Literature', 'Economics',
    'Psychology', 'Philosophy', 'Art History', 'Geography',
    'Statistics', 'Trigonometry', 'Linear Algebra', 'Organic Chemistry',
    'Molecular Biology', 'Data Science', 'Machine Learning'
  ];

  const suggestedAreas = [
    'Fundamentals', 'Advanced Concepts', 'Problem Solving', 'Applications',
    'Theory', 'Practice Problems', 'Real-world Examples', 'Historical Context',
    'Modern Applications', 'Critical Thinking', 'Analysis', 'Synthesis'
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Flashcard Generator</h2>
        </div>
        <p className="text-sm text-gray-600">Create personalized flashcards for any subject</p>
      </div>

      {/* Module/Subject Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <BookOpen className="w-4 h-4 inline mr-1" />
          Module/Subject
        </label>
        <input
          type="text"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Calculus, Physics, Literature..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        
        {/* Suggested modules */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Popular subjects:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedModules.slice(0, 8).map((suggestedModule) => (
              <button
                key={suggestedModule}
                onClick={() => setModule(suggestedModule)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-md transition-colors"
              >
                {suggestedModule}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Specific Area Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Target className="w-4 h-4 inline mr-1" />
          Specific Area (Optional)
        </label>
        <input
          type="text"
          value={specificArea}
          onChange={(e) => setSpecificArea(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Derivatives, Quantum Mechanics, Shakespeare..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        
        {/* Suggested areas */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Focus areas:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedAreas.slice(0, 6).map((area) => (
              <button
                key={area}
                onClick={() => setSpecificArea(area)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-md transition-colors"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!module.trim() || isGenerating}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
          module.trim() && !isGenerating
            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
          className="mt-6 p-3 bg-primary-50 border border-primary-200 rounded-lg"
        >
          <p className="text-sm font-medium text-primary-800 mb-1">Current Topic:</p>
          <p className="text-sm text-primary-700">{selectedTopic}</p>
        </motion.div>
      )}

      {/* Tips */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for better flashcards:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Be specific about the subject area</li>
          <li>• Include the difficulty level you want</li>
          <li>• Mention any specific concepts to focus on</li>
          <li>• You can leave the specific area blank for general topics</li>
        </ul>
      </div>
    </div>
  );
}
