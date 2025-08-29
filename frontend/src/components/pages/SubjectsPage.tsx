import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Check } from 'lucide-react';
import type { User } from '../../lib/types';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface SubjectsPageProps {
  user: User;
  onComplete: (subjects: string[]) => void;
}

const allSubjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'History', 'Literature', 'Computer Science', 'Economics'
];

export function SubjectsPage({ user, onComplete }: SubjectsPageProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  const handleContinue = async () => {
    if (selectedSubjects.length === 0) return;
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { subjects: selectedSubjects });
      onComplete(selectedSubjects);
    } catch (error) {
      console.error('Failed to save subjects:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Book className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">What are you studying?</h1>
          <p className="text-gray-600 mt-2">Select your subjects to personalize your learning experience.</p>
        </div>

        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allSubjects.map(subject => (
              <motion.button
                key={subject}
                onClick={() => toggleSubject(subject)}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-lg border-2 text-center font-medium transition-colors ${
                  selectedSubjects.includes(subject)
                    ? 'bg-primary-100 border-primary-500 text-primary-800'
                    : 'bg-white border-gray-300 hover:border-primary-400'
                }`}
              >
                {subject}
                {selectedSubjects.includes(subject) && (
                  <Check className="w-5 h-5 text-primary-600 absolute top-2 right-2" />
                )}
              </motion.button>
            ))}
          </div>

          <div className="mt-8">
            <button 
              onClick={handleContinue}
              className="btn-primary w-full"
              disabled={selectedSubjects.length === 0 || isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
