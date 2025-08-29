import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronDown, Brain } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface Module {
  id: string;
  name: string;
  topics: Topic[];
}

interface CourseSidebarProps {
  onTopicSelect: (topic: string) => void;
  selectedTopic?: string;
}

const courseModules: Module[] = [
  {
    id: 'calculus',
    name: 'Calculus',
    topics: [
      { id: 'derivatives', name: 'Derivatives', description: 'Learn about rates of change and slopes' },
      { id: 'integrals', name: 'Integrals', description: 'Understand accumulation and area under curves' },
      { id: 'limits', name: 'Limits', description: 'Explore behavior as values approach specific points' },
      { id: 'chain-rule', name: 'Chain Rule', description: 'Master composite function differentiation' }
    ]
  },
  {
    id: 'algebra',
    name: 'Algebra',
    topics: [
      { id: 'quadratic-equations', name: 'Quadratic Equations', description: 'Solve second-degree polynomial equations' },
      { id: 'factoring', name: 'Factoring', description: 'Break down polynomials into simpler factors' },
      { id: 'linear-equations', name: 'Linear Equations', description: 'Work with first-degree equations' },
      { id: 'functions', name: 'Functions', description: 'Understand input-output relationships' }
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    topics: [
      { id: 'mechanics', name: 'Mechanics', description: 'Study motion, forces, and energy' },
      { id: 'thermodynamics', name: 'Thermodynamics', description: 'Explore heat, work, and energy transfer' },
      { id: 'waves', name: 'Waves', description: 'Understand wave phenomena and properties' },
      { id: 'electricity', name: 'Electricity', description: 'Learn about electric charges and circuits' }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    topics: [
      { id: 'atomic-structure', name: 'Atomic Structure', description: 'Explore atoms, electrons, and nuclei' },
      { id: 'chemical-bonding', name: 'Chemical Bonding', description: 'Understand how atoms combine' },
      { id: 'reactions', name: 'Chemical Reactions', description: 'Study substance transformations' },
      { id: 'stoichiometry', name: 'Stoichiometry', description: 'Calculate quantities in reactions' }
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    topics: [
      { id: 'cell-biology', name: 'Cell Biology', description: 'Study the basic units of life' },
      { id: 'genetics', name: 'Genetics', description: 'Understand heredity and variation' },
      { id: 'evolution', name: 'Evolution', description: 'Explore how species change over time' },
      { id: 'ecology', name: 'Ecology', description: 'Study organisms and their environment' }
    ]
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    topics: [
      { id: 'algorithms', name: 'Algorithms', description: 'Learn problem-solving procedures' },
      { id: 'data-structures', name: 'Data Structures', description: 'Understand data organization' },
      { id: 'programming', name: 'Programming', description: 'Master coding fundamentals' },
      { id: 'web-development', name: 'Web Development', description: 'Build websites and applications' }
    ]
  }
];

export function CourseSidebar({ onTopicSelect, selectedTopic }: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(['calculus']);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleTopicClick = (topicName: string) => {
    onTopicSelect(topicName);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Study Modules</h2>
        </div>
        <p className="text-sm text-gray-600">Select a topic to generate AI-powered flashcards</p>
      </div>

      <div className="space-y-2">
        {courseModules.map((module) => (
          <div key={module.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-600" />
                <span className="font-medium text-gray-900">{module.name}</span>
              </div>
              {expandedModules.includes(module.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {expandedModules.includes(module.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-200"
              >
                {module.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.name)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedTopic === topic.name ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{topic.description}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
