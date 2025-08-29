import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  Calendar,
  Trophy,
  TrendingUp,
  Sparkles,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import type { User, AppState } from "../../lib/types";

interface StudyPlanTask {
  id: string;
  day: number;
  timeSlot: string;
  duration: number;
  topic: string;
  activity: string;
  description: string;
  completed: boolean;
  estimatedTime: number;
}

interface StudyPlan {
  id: string;
  userId: string;
  dailyHours: number;
  weakTopics: string[];
  tasks: StudyPlanTask[];
  createdAt: Date;
  completedTasks: string[];
  weeklyProgress: number;
  badges: string[];
}

interface StudyPlanPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

export function StudyPlanPage({ user, onStateChange }: StudyPlanPageProps) {
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [dailyHours, setDailyHours] = useState(2);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);

  // Load existing study plan on component mount
  useEffect(() => {
    loadExistingPlan();
  }, [user.id]);

  const loadExistingPlan = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/plan/current/${user.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        setShowPlanForm(false);
      } else if (response.status === 404) {
        // No existing plan found, show form
        setShowPlanForm(true);
      } else {
        console.error("Failed to load study plan");
        setShowPlanForm(true);
      }
    } catch (error) {
      console.error("Error loading study plan:", error);
      setShowPlanForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const addTopic = () => {
    if (
      newTopic.trim() &&
      weakTopics.length < 5 &&
      !weakTopics.includes(newTopic.trim())
    ) {
      setWeakTopics((prev) => [...prev, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setWeakTopics((prev) => prev.filter((topic) => topic !== topicToRemove));
  };

  const generateNewPlan = useCallback(async () => {
    if (weakTopics.length === 0) {
      alert("Please add at least one weak topic");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/plan/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            dailyHours,
            weakTopics,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        setShowPlanForm(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to generate study plan");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      alert("Failed to generate study plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [user.id, dailyHours, weakTopics]);

  const deleteCurrentPlan = async () => {
    if (!currentPlan) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/plan/current/${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setCurrentPlan(null);
        setShowPlanForm(true);
      } else {
        alert("Failed to delete study plan");
      }
    } catch (error) {
      console.error("Error deleting study plan:", error);
      alert("Failed to delete study plan. Please try again.");
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    if (!currentPlan) return;

    const updatedTasks = currentPlan.tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const completedTasks = updatedTasks
      .filter((task) => task.completed)
      .map((task) => task.id);

    const weeklyProgress = Math.round(
      (completedTasks.length / updatedTasks.length) * 100
    );

    const updatedPlan = {
      ...currentPlan,
      tasks: updatedTasks,
      completedTasks,
      weeklyProgress,
    };

    setCurrentPlan(updatedPlan);

    // Update progress in backend
    try {
      await fetch("http://localhost:3001/api/v1/plan/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          planId: currentPlan.id,
          taskId,
          completed: !currentPlan.tasks.find((t) => t.id === taskId)?.completed,
        }),
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }

    // Update user points
    const pointsToAdd = 5; // Points for completing a task
    const updatedUser = { ...user, points: user.points + pointsToAdd };
    onStateChange({
      user: updatedUser,
      currentSession: null,
      isLoading: false,
      error: null,
    });
    localStorage.setItem("ai-study-buddy-user", JSON.stringify(updatedUser));
  };

  const getProgressPercentage = () => {
    if (!currentPlan) return 0;
    const completed = currentPlan.tasks.filter((task) => task.completed).length;
    return Math.round((completed / currentPlan.tasks.length) * 100);
  };

  const getDayTasks = (day: number) => {
    if (!currentPlan) return [];
    return currentPlan.tasks.filter((task) => task.day === day);
  };

  const getTimeSlotTasks = (day: number, timeSlot: string) => {
    return getDayTasks(day).filter((task) => task.timeSlot === timeSlot);
  };

  const timeSlots = ["Morning", "Afternoon", "Evening"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your study plan...</p>
        </div>
      </div>
    );
  }

  if (showPlanForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              AI Study Plan Generator
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Create a personalized study plan based on your available time and
            weak areas
          </p>

          {/* Daily Hours Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Daily Study Hours (minimum 2)
            </label>
            <input
              type="number"
              min="2"
              max="12"
              value={dailyHours}
              onChange={(e) =>
                setDailyHours(Math.max(2, parseInt(e.target.value) || 2))
              }
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              How many hours can you study each day?
            </p>
          </div>

          {/* Weak Topics Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Add Your Weak Study Areas (maximum 5)
            </label>

            {/* Topic Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTopic()}
                placeholder="Enter a topic (e.g., Calculus, Physics, etc.)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={weakTopics.length >= 5}
              />
              <button
                onClick={addTopic}
                disabled={
                  !newTopic.trim() ||
                  weakTopics.length >= 5 ||
                  weakTopics.includes(newTopic.trim())
                }
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Selected Topics */}
            {weakTopics.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Selected topics ({weakTopics.length}/5):
                </p>
                <div className="flex flex-wrap gap-2">
                  {weakTopics.map((topic) => (
                    <div
                      key={topic}
                      className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full"
                    >
                      <span className="text-sm">{topic}</span>
                      <button
                        onClick={() => removeTopic(topic)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-2">
              Add the topics you want to improve on (maximum 5 topics)
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateNewPlan}
            disabled={isGenerating || weakTopics.length === 0}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              weakTopics.length > 0 && !isGenerating
                ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating AI Study Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Study Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Study Plan Available
          </h3>
          <p className="text-gray-600 mb-4">
            Generate a new AI-powered study plan to get started.
          </p>
          <button
            onClick={() => setShowPlanForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create New Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary-600" />
              Your AI Study Plan
            </h2>
            <p className="text-gray-600">
              {currentPlan.dailyHours} hours daily •{" "}
              {currentPlan.weakTopics.join(", ")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {getProgressPercentage()}%
              </div>
              <div className="text-sm text-gray-600">Weekly Progress</div>
            </div>

            {/* Delete Plan Button */}
            <button
              onClick={deleteCurrentPlan}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Study Plan"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>
              {currentPlan.tasks.filter((t) => t.completed).length} completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{currentPlan.tasks.length} total tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>{currentPlan.badges.length} badges earned</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Notion Style */}
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          {/* Header row */}
          <div className="p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-700">
            Time
          </div>
          {days.map((day, index) => (
            <div
              key={day}
              className="p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-700 text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Time slots rows */}
        {timeSlots.map((timeSlot, timeIndex) => (
          <div
            key={timeSlot}
            className="grid grid-cols-8 border-b border-gray-200"
          >
            {/* Time slot header */}
            <div className="p-4 bg-gray-50 border-r border-gray-200 font-medium text-gray-600 flex items-center">
              {timeSlot}
            </div>

            {/* Day columns */}
            {days.map((day, dayIndex) => {
              const dayNumber = dayIndex + 1;
              const tasks = getTimeSlotTasks(dayNumber, timeSlot);

              return (
                <div
                  key={`${day}-${timeSlot}`}
                  className="p-3 border-r border-gray-200 min-h-[120px] relative"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)
                    `,
                    backgroundSize: "20px 20px",
                  }}
                >
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className={`mb-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                        task.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                      onClick={() => toggleTaskCompletion(task.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                task.completed ? "bg-green-500" : "bg-gray-300"
                              }`}
                            />
                            <span className="text-xs font-medium text-gray-600">
                              {task.duration}min
                            </span>
                          </div>
                          <h5 className="text-xs font-medium text-gray-900 mb-1 truncate">
                            {task.activity}
                          </h5>
                          <p className="text-xs text-gray-600 truncate">
                            {task.topic}
                          </p>
                        </div>
                        {task.completed && (
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Regenerate Button */}
      <div className="mt-6 text-center">
        <button onClick={() => setShowPlanForm(true)} className="btn-secondary">
          Generate New Plan
        </button>
      </div>
    </div>
  );
}
