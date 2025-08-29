import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import type { User, AppState, StudyPlan } from '../../lib/types';
import { generateStudyPlan, getWeakTopics } from '../../lib/utils';

interface StudyPlanPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

export function StudyPlanPage({ user, onStateChange }: StudyPlanPageProps) {
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [timeframeDays, setTimeframeDays] = useState(7);

  const generateNewPlan = useCallback(() => {
    const weakTopics = getWeakTopics(user.topics);
    if (weakTopics.length === 0) return;

    const tasks = generateStudyPlan(weakTopics, timeframeDays);
    const newPlan: StudyPlan = {
      id: Date.now().toString(),
      userId: user.id,
      timeframeDays,
      tasks,
      createdAt: new Date(),
      completedDays: []
    };
    setCurrentPlan(newPlan);
  }, [user, timeframeDays]);

  useEffect(() => {
    generateNewPlan();
  }, [generateNewPlan]);

  const toggleTaskCompletion = (taskId: string) => {
    if (!currentPlan) return;

    const updatedTasks = currentPlan.tasks.map(task => {
      if (task.day === parseInt(taskId)) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const updatedPlan = { ...currentPlan, tasks: updatedTasks };
    setCurrentPlan(updatedPlan);

    // Update user points
    const pointsToAdd = 20; // Points for completing a plan day
    const updatedUser = { ...user, points: user.points + pointsToAdd };
    onStateChange({
      user: updatedUser,
      currentSession: null,
      isLoading: false,
      error: null
    });
    localStorage.setItem('ai-study-buddy-user', JSON.stringify(updatedUser));
  };

  const getProgressPercentage = () => {
    if (!currentPlan) return 0;
    const completed = currentPlan.tasks.filter(task => task.completed).length;
    return Math.round((completed / currentPlan.tasks.length) * 100);
  };

  if (!currentPlan) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Plan Available</h3>
        <p className="text-gray-600">Complete some quizzes first to generate a personalized study plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-600" />
              Your Study Plan
            </h2>
            <p className="text-gray-600">
              Personalized study schedule based on your weak areas
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600 mb-1">
              {getProgressPercentage()}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <motion.div
            className="bg-primary-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Plan Duration:</label>
          <select
            value={timeframeDays}
            onChange={(e) => setTimeframeDays(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          <button
            onClick={generateNewPlan}
            className="btn-secondary"
          >
            Regenerate Plan
          </button>
        </div>
      </div>

      {/* Study Tasks */}
      <div className="space-y-4">
        {currentPlan.tasks.map((task) => (
          <motion.div
            key={task.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card transition-all duration-200 ${
              task.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    task.completed ? 'bg-green-500 text-white' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {task.completed ? <CheckCircle className="w-4 h-4" /> : task.day}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Day {task.day} - {task.topics.join(', ')}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.estimatedTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {task.topics.length} topics
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-11 space-y-2">
                  {task.tasks.map((taskItem, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-gray-700">{taskItem}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => toggleTaskCompletion(task.day.toString())}
                className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  task.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                {task.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div className="card mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Study Tips</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Complete at least one task per day to maintain your streak</li>
          <li>• Focus on your weakest topics first</li>
          <li>• Take breaks between study sessions</li>
          <li>• Review completed topics regularly</li>
        </ul>
      </div>
    </div>
  );
}
