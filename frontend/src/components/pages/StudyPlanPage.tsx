import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Target,
  Calendar,
  Trophy,
  Sparkles,
  Plus,
  X,
  Trash2,
  Copy,
} from "lucide-react";
import type { User, AppState } from "../../lib/types";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { useTheme } from "../../lib/theme.tsx";
import { PandaIcon } from "../ui/PandaIcon";
import { usePersistentState } from "../../lib/pageState.tsx";
import { API_CONFIG } from "../../lib/api.ts";

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
  isFlashcardTask?: boolean;
}

interface TimeSlot {
  time: string;
  duration: number;
}

interface StudyPlan {
  id: string;
  userId: string;
  dailyHours: number;
  weakTopics: string[];
  preferredTimeSlots: TimeSlot[];
  tasks: StudyPlanTask[];
  createdAt: Date;
  completedTasks: string[];
  weeklyProgress: number;
  badges: string[];
}

interface StudyPlanHistoryItem {
  id: string;
  userId: string;
  dailyHours: number;
  weakTopics: string[];
  preferredTimeSlots: TimeSlot[];
  tasks: StudyPlanTask[];
  createdAt: string;
  completedTasks: string[];
  weeklyProgress: number;
  badges: string[];
}

interface StudyPlanPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

export function StudyPlanPage({ user, onStateChange }: StudyPlanPageProps) {
  console.log("StudyPlanPage mounted with user:", user);
  const { theme } = useTheme();

  // Use persistent state for key variables
  const [currentPlan, setCurrentPlan] = usePersistentState<StudyPlan | null>(
    "study",
    "currentPlan",
    null
  );
  const [weakTopics, setWeakTopics] = usePersistentState<string[]>(
    "study",
    "weakTopics",
    []
  );
  const [newTopic, setNewTopic] = usePersistentState<string>(
    "study",
    "newTopic",
    ""
  );
  const [dailyHours, setDailyHours] = usePersistentState<number>(
    "study",
    "dailyHours",
    4
  );
  const [preferredTimeSlots, setPreferredTimeSlots] = usePersistentState<
    TimeSlot[]
  >("study", "preferredTimeSlots", []);
  const [newTimeSlot, setNewTimeSlot] = usePersistentState<string>(
    "study",
    "newTimeSlot",
    ""
  );
  const [newTimeSlotDuration, setNewTimeSlotDuration] =
    usePersistentState<number>("study", "newTimeSlotDuration", 30);
  const [showPlanForm, setShowPlanForm] = usePersistentState<boolean>(
    "study",
    "showPlanForm",
    false
  );
  const [selectedPlanId, setSelectedPlanId] = usePersistentState<string | null>(
    "study",
    "selectedPlanId",
    null
  );

  // Keep non-persistent state for UI-only variables
  const [timeSlotError, setTimeSlotError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [studyPlanHistory, setStudyPlanHistory] = useState<
    StudyPlanHistoryItem[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Theme-aware class helpers
  const getThemeClasses = () => {
    return {
      container:
        theme === "light"
          ? "bg-[#F2DEF6] rounded-lg shadow-sm border border-gray-200"
          : "bg-[#140D13] rounded-lg shadow-lg border border-secondary-700",
      text: theme === "light" ? "text-gray-900" : "text-white",
      textSecondary: theme === "light" ? "text-gray-600" : "text-gray-300",
      input:
        theme === "light"
          ? "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 px-3 py-2 rounded-lg focus:outline-none"
          : "bg-secondary-800 border border-secondary-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 px-3 py-2 rounded-lg focus:outline-none",
      button:
        theme === "light"
          ? "bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          : "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors",
      buttonSecondary:
        theme === "light"
          ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
          : "bg-secondary-700 hover:bg-secondary-600 text-gray-300 border border-secondary-600 px-4 py-2 rounded-lg font-medium transition-colors",
      buttonDisabled:
        theme === "light"
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "bg-secondary-700 text-gray-400 cursor-not-allowed border border-secondary-600",
      card:
        theme === "light"
          ? "bg-[#FAF5FA] border border-gray-200"
          : "bg-secondary-800 border border-secondary-700",
    };
  };

  const themeClasses = getThemeClasses();

  const loadExistingPlan = useCallback(async () => {
    try {
      console.log("Loading existing plan for user:", user.id);
      const response = await fetch(
        API_CONFIG.getUrl(`/api/v1/plan/current/${user.id}`)
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Plan found:", data.plan);
        if (data.plan && data.plan.id) {
          console.log("Plan details:", {
            id: data.plan?.id,
            userId: data.plan?.userId,
            dailyHours: data.plan?.dailyHours,
            weakTopics: data.plan?.weakTopics,
            tasks: data.plan?.tasks?.length,
            preferredTimeSlots: data.plan?.preferredTimeSlots?.length,
            createdAt: data.plan?.createdAt,
          });
          setCurrentPlan(data.plan);
          // Show the current plan if it exists and is valid
          setShowPlanForm(false);
        } else {
          console.log("No valid plan found, showing form");
          setShowPlanForm(true);
          setCurrentPlan(null);
        }
      } else if (response.status === 404) {
        console.log("No plan found, showing form");
        // No existing plan found, show form
        setShowPlanForm(true);
        setCurrentPlan(null); // Ensure currentPlan is null
      } else {
        console.error("Failed to load study plan");
        setShowPlanForm(true);
        setCurrentPlan(null); // Ensure currentPlan is null
      }
    } catch (error) {
      console.error("Error loading study plan:", error);
      setShowPlanForm(true);
      setCurrentPlan(null); // Ensure currentPlan is null
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  const loadStudyPlanHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(
        API_CONFIG.getUrl(`/api/v1/plan/history/${user.id}`)
      );

      if (response.ok) {
        const data = await response.json();
        setStudyPlanHistory(data.history || []);
      } else {
        console.error("Failed to load study plan history");
      }
    } catch (error) {
      console.error("Error loading study plan history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user.id]);

  const loadPlanFromHistory = async (planId: string) => {
    setSelectedPlanId(planId);
    try {
      const response = await fetch(
        API_CONFIG.getUrl(`/api/v1/plan/history/${user.id}/${planId}`)
      );

      if (response.ok) {
        const data = await response.json();
        const plan = data.plan;
        // Convert createdAt string back to Date
        const planWithDate = {
          ...plan,
          createdAt: new Date(plan.createdAt),
        };
        setCurrentPlan(planWithDate);
        setShowPlanForm(false);
      } else {
        alert("Failed to load study plan from history");
      }
    } catch (error) {
      console.error("Error loading plan from history:", error);
      alert("Failed to load study plan from history");
    }
  };

  const loadMostRecentPlan = async () => {
    try {
      // First load the history to get the most recent plan
      const response = await fetch(
        API_CONFIG.getUrl(`/api/v1/plan/history/${user.id}`)
      );

      if (response.ok) {
        const data = await response.json();
        const history = data.history || [];

        if (history.length > 0) {
          // Load the most recent plan (first in the list)
          const mostRecentPlan = history[0];
          const planWithDate = {
            ...mostRecentPlan,
            createdAt: new Date(mostRecentPlan.createdAt),
          };
          setCurrentPlan(planWithDate);
          setShowPlanForm(false);
        } else {
          alert("No study plans found in history");
        }
      } else {
        alert("Failed to load study plan history");
      }
    } catch (error) {
      console.error("Error loading most recent plan:", error);
      alert("Failed to load most recent study plan");
    }
  };

  // Load existing study plan on component mount
  useEffect(() => {
    console.log("useEffect triggered, user.id:", user.id);
    loadExistingPlan();
    loadStudyPlanHistory();
  }, [user.id, loadExistingPlan, loadStudyPlanHistory]);

  const addTopic = () => {
    if (
      newTopic.trim() &&
      weakTopics.length < 5 &&
      !weakTopics.includes(newTopic.trim())
    ) {
      setWeakTopics([...weakTopics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setWeakTopics(weakTopics.filter((topic) => topic !== topicToRemove));
  };

  const addTimeSlot = () => {
    const timeSlot = newTimeSlot.trim();
    setTimeSlotError("");

    if (!timeSlot) {
      setTimeSlotError("Please enter a time slot");
      return;
    }

    if (preferredTimeSlots.length >= 5) {
      setTimeSlotError("Maximum 5 time slots allowed");
      return;
    }

    if (preferredTimeSlots.some((slot) => slot.time === timeSlot)) {
      setTimeSlotError("This time slot already exists");
      return;
    }

    // Validate time format (basic validation)
    const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeSlot)) {
      setTimeSlotError("Please enter time in HH:MM format (e.g., 09:30)");
      return;
    }

    // Validate duration
    if (newTimeSlotDuration < 1 || newTimeSlotDuration > 40) {
      setTimeSlotError("Duration must be between 1 and 40 minutes");
      return;
    }

    setPreferredTimeSlots([
      ...preferredTimeSlots,
      { time: timeSlot, duration: newTimeSlotDuration },
    ]);
    setNewTimeSlot("");
    setNewTimeSlotDuration(30);
  };

  const removeTimeSlot = (timeSlotToRemove: string) => {
    setPreferredTimeSlots(
      preferredTimeSlots.filter((slot) => slot.time !== timeSlotToRemove)
    );
  };

  const handleTimeSlotKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTimeSlot();
    }
  };

  const generateNewPlan = useCallback(async () => {
    if (weakTopics.length === 0) {
      alert("Please add at least one weak topic");
      return;
    }

    if (preferredTimeSlots.length === 0) {
      alert("Please add at least one study time slot");
      return;
    }

    setIsGenerating(true);

    try {
      // Calculate total daily study minutes from time slots
      const totalDailyMinutes = preferredTimeSlots.reduce(
        (total, slot) => total + slot.duration,
        0
      );
      const dailyHours = Math.round((totalDailyMinutes / 60) * 10) / 10; // Round to 1 decimal place

      const response = await fetch(
        API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GENERATE_PLAN),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            dailyHours,
            weakTopics,
            preferredTimeSlots,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        setShowPlanForm(false);
        loadStudyPlanHistory();
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
  }, [user.id, weakTopics, preferredTimeSlots, loadStudyPlanHistory]);

  const deleteCurrentPlan = async () => {
    if (!currentPlan) return;

    try {
      const response = await fetch(
        API_CONFIG.getUrl(`/api/v1/plan/current/${user.id}`),
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

  const copyToClipboard = async (text: string, taskId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (taskId) {
        setCopiedTaskId(taskId);
        setTimeout(() => setCopiedTaskId(null), 2000);
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      console.log("Copied to clipboard:", text);
    } catch (err) {
      console.error("Failed to copy:", err);
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
      await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.UPDATE_PLAN_PROGRESS), {
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
    if (!currentPlan || !currentPlan.tasks) return 0;
    const completed = currentPlan.tasks.filter((task) => task.completed).length;
    return Math.round((completed / currentPlan.tasks.length) * 100);
  };

  const getDayTasks = (day: number) => {
    if (!currentPlan || !currentPlan.tasks) return [];
    return currentPlan.tasks.filter((task) => task.day === day);
  };

  const getTimeSlotTasks = (day: number, timeSlot: string) => {
    return getDayTasks(day).filter((task) => task.timeSlot === timeSlot);
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Get unique time slots from the current plan or use defaults
  const timeSlots = currentPlan?.preferredTimeSlots || preferredTimeSlots || [];

  const formatHistoryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <LoadingSpinner size="md" text="Loading your study plan..." />
        </div>
      </div>
    );
  }

  if (showPlanForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`${themeClasses.container} p-6`}>
          <div className="text-center mb-6">
            <PandaIcon className="w-12 h-12 text-pink-600 mx-auto mb-3" />
            <h2 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
              Study Plan Generator
            </h2>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Create your personalized study plan with AI assistance
            </p>
          </div>

          {/* Weak Topics Input */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium ${themeClasses.text} mb-2`}
            >
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
                className={`${themeClasses.input} flex-1`}
                disabled={weakTopics.length >= 5}
              />
              <button
                onClick={addTopic}
                disabled={
                  !newTopic.trim() ||
                  weakTopics.length >= 5 ||
                  weakTopics.includes(newTopic.trim())
                }
                className={`${themeClasses.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Selected Topics */}
            {weakTopics.length > 0 && (
              <div className="space-y-2">
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Selected topics ({weakTopics.length}/5):
                </p>
                <div className="flex flex-wrap gap-2">
                  {weakTopics.map((topic) => (
                    <div
                      key={topic}
                      className={`flex items-center gap-2 px-3 py-1 ${themeClasses.card} rounded-full`}
                    >
                      <span className="text-sm">{topic}</span>
                      <button
                        onClick={() => removeTopic(topic)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className={`text-sm ${themeClasses.textSecondary} mt-2`}>
              Add the topics you want to improve on (maximum 5 topics)
            </p>
          </div>

          {/* Preferred Time Slots */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium ${themeClasses.text} mb-2`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Preferred Study Times (add up to 5)
            </label>

            {/* Time Slot Input */}
            <div className="flex gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  From:
                </span>
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  onKeyPress={handleTimeSlotKeyPress}
                  placeholder="09:30"
                  className={`w-24 ${themeClasses.input}`}
                  disabled={preferredTimeSlots.length >= 5}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${themeClasses.textSecondary}`}>
                  Duration:
                </span>
                <input
                  type="number"
                  value={newTimeSlotDuration}
                  onChange={(e) =>
                    setNewTimeSlotDuration(Number(e.target.value))
                  }
                  min="1"
                  max="40"
                  className={`w-20 ${themeClasses.input}`}
                  disabled={preferredTimeSlots.length >= 5}
                  placeholder="min"
                />
              </div>
              <button
                onClick={addTimeSlot}
                disabled={preferredTimeSlots.length >= 5 || !newTimeSlot.trim()}
                className={`${themeClasses.button} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Add
              </button>
            </div>

            {/* Error Message */}
            {timeSlotError && (
              <p className="text-red-400 text-sm mb-3">{timeSlotError}</p>
            )}

            {/* Time Slots List */}
            {preferredTimeSlots.length > 0 && (
              <div className="space-y-2">
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Your study times:
                </p>
                <div className="flex flex-wrap gap-2">
                  {preferredTimeSlots.map((timeSlot) => (
                    <div
                      key={timeSlot.time}
                      className={`flex items-center gap-2 px-3 py-2 ${themeClasses.card} rounded-lg`}
                    >
                      <span className={`text-sm ${themeClasses.text}`}>
                        {timeSlot.time} ({timeSlot.duration} min)
                      </span>
                      <button
                        onClick={() => removeTimeSlot(timeSlot.time)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className={`text-sm ${themeClasses.textSecondary} mt-2`}>
              Enter your preferred study times in HH:MM format and duration
              (maximum 5 slots, 40 min each). Total daily study time will be
              calculated automatically.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={generateNewPlan}
              disabled={
                isGenerating ||
                weakTopics.length === 0 ||
                preferredTimeSlots.length === 0
              }
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                weakTopics.length > 0 &&
                preferredTimeSlots.length > 0 &&
                !isGenerating
                  ? themeClasses.button
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 px-6 py-3 rounded-lg font-medium"
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

            <button
              onClick={loadMostRecentPlan}
              className={`${themeClasses.buttonSecondary} flex items-center gap-2`}
            >
              <Calendar className="w-4 h-4" />
              Show History
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlan) {
    // Show the form directly when there's no current plan
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`${themeClasses.container} p-8`}>
          {/* Form content */}
          <div className="space-y-6">
            {/* Weak Topics Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What topics do you struggle with? (Max 5)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTopic()}
                  placeholder="e.g., Calculus, Physics, Chemistry..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={addTopic}
                  disabled={weakTopics.length >= 5}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full border border-purple-200"
                  >
                    {topic}
                    <button
                      onClick={() => removeTopic(topic)}
                      className="hover:text-purple-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Daily Hours Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How many hours can you study daily?
              </label>
              <input
                type="number"
                min="2"
                max="12"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Preferred Time Slots Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                When are you available to study? (Max 5 time slots)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  onKeyPress={handleTimeSlotKeyPress}
                  placeholder="e.g., 09:00"
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={newTimeSlotDuration}
                  onChange={(e) =>
                    setNewTimeSlotDuration(Number(e.target.value))
                  }
                  className="w-20 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <span className="flex items-center text-gray-600">min</span>
                <button
                  onClick={addTimeSlot}
                  disabled={preferredTimeSlots.length >= 5}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {timeSlotError && (
                <p className="text-red-600 text-sm mb-3">{timeSlotError}</p>
              )}
              <div className="space-y-2">
                {preferredTimeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <span className="text-gray-900">
                      {slot.time} ({slot.duration} min)
                    </span>
                    <button
                      onClick={() => removeTimeSlot(slot.time)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-4">
              <button
                onClick={generateNewPlan}
                disabled={
                  isGenerating ||
                  weakTopics.length === 0 ||
                  preferredTimeSlots.length === 0
                }
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  weakTopics.length > 0 &&
                  preferredTimeSlots.length > 0 &&
                  !isGenerating
                    ? themeClasses.button
                    : themeClasses.buttonDisabled
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

              <button
                onClick={loadMostRecentPlan}
                className={`px-6 py-3 ${themeClasses.buttonSecondary} flex items-center gap-2`}
              >
                <Calendar className="w-4 h-4" />
                Show History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Progress */}
      <div className={`${themeClasses.container} p-6 mb-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2
              className={`text-xl md:text-2xl font-bold ${themeClasses.text} mb-2 flex items-center gap-2`}
            >
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              Your AI Study Plan
            </h2>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              {currentPlan.dailyHours} hours daily •{" "}
              {currentPlan.weakTopics?.join(", ") || "No topics specified"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`text-right`}>
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
                {getProgressPercentage()}%
              </div>
              <div
                className={`text-xs md:text-sm ${themeClasses.textSecondary}`}
              >
                Weekly Progress
              </div>
            </div>

            {/* Delete Plan Button */}
            <button
              onClick={deleteCurrentPlan}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Study Plan"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`w-full ${
            theme === "light" ? "bg-gray-200" : "bg-secondary-700"
          } rounded-full h-3 mb-4`}
        >
          <div
            className="bg-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className={themeClasses.textSecondary}>
              {currentPlan.tasks?.filter((t) => t.completed).length || 0}{" "}
              completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className={themeClasses.textSecondary}>
              {currentPlan.tasks?.length || 0} total tasks
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className={themeClasses.textSecondary}>
              {currentPlan.badges?.length || 0} badges earned
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Study Plan Area - Full width on mobile, 3/4 on desktop */}
        <div className="lg:col-span-3">
          {/* Calendar Grid - Notion Style */}
          <div
            className={`${themeClasses.card} rounded-lg shadow-sm p-0 overflow-visible`}
          >
            <div
              className={`grid grid-cols-6 border-b ${
                theme === "light" ? "border-gray-200" : "border-secondary-700"
              }`}
            >
              {/* Header row */}
              <div
                className={`p-4 ${
                  theme === "light"
                    ? "bg-gray-50 border-r border-gray-200"
                    : "bg-[#140D13] border-r border-secondary-700"
                } font-medium ${themeClasses.text}`}
              >
                Time
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className={`p-4 ${
                    theme === "light"
                      ? "bg-gray-50 border-r border-gray-200"
                      : "bg-[#140D13] border-r border-secondary-700"
                  } font-medium ${themeClasses.text} text-center`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots rows */}
            {timeSlots.map((timeSlot) => (
              <div
                key={timeSlot.time}
                className={`grid grid-cols-6 border-b ${
                  theme === "light" ? "border-gray-200" : "border-secondary-700"
                }`}
              >
                {/* Time slot header */}
                <div
                  className={`p-4 ${
                    theme === "light"
                      ? "bg-gray-50 border-r border-gray-200"
                      : "bg-[#140D13] border-r border-secondary-700"
                  } font-medium ${themeClasses.text} flex items-center`}
                >
                  {timeSlot.time} ({timeSlot.duration} min)
                </div>

                {/* Day columns */}
                {days.map((day, dayIndex) => {
                  const dayNumber = dayIndex + 1;
                  const tasks = getTimeSlotTasks(dayNumber, timeSlot.time);

                  return (
                    <div
                      key={`${day}-${timeSlot}`}
                      className={`p-3 border-r ${
                        theme === "light"
                          ? "border-gray-200 bg-white"
                          : "border-secondary-700 bg-[#140D13]"
                      } min-h-[120px] relative`}
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at 1px 1px, ${
                            theme === "light" ? "#e5e7eb" : "#374151"
                          } 1px, transparent 0)
                        `,
                        backgroundSize: "20px 20px",
                      }}
                    >
                      {tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          className={`mb-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer group relative ${
                            task.isFlashcardTask
                              ? task.completed
                                ? "bg-purple-100 border-purple-300"
                                : "bg-purple-50 border-purple-200 hover:border-purple-300 shadow-sm"
                              : task.completed
                              ? "bg-green-100 border-green-300"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm"
                          }`}
                          onClick={() => toggleTaskCompletion(task.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Hover Tooltip */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] max-w-sm min-w-[200px] shadow-2xl border border-gray-600">
                            <div className="font-medium mb-1 break-words">
                              {task.activity}
                            </div>
                            <div className="text-gray-300 mb-1 break-words">
                              Topic: {task.topic}
                            </div>
                            <div className="text-gray-300 mb-1">
                              Duration: {task.duration} minutes
                            </div>
                            <div className="text-gray-300 break-words leading-relaxed">
                              {task.description}
                            </div>
                            {task.isFlashcardTask && (
                              <div className="text-purple-300 mt-2 flex items-center justify-between">
                                <span className="text-xs">
                                  📚 Flashcard Review Task
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(task.description, task.id);
                                  }}
                                  className={`ml-2 p-1 transition-colors bg-gray-800 rounded flex-shrink-0 ${
                                    copiedTaskId === task.id
                                      ? "text-green-400"
                                      : "text-purple-400 hover:text-purple-300"
                                  }`}
                                  title="Copy prompt"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>

                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1">
                                <div
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    task.isFlashcardTask
                                      ? task.completed
                                        ? "bg-purple-500"
                                        : "bg-purple-400"
                                      : task.completed
                                      ? "bg-green-500"
                                      : "bg-gray-400"
                                  }`}
                                />
                                <span className="text-xs font-medium text-gray-600">
                                  {task.duration}min
                                </span>
                                {task.isFlashcardTask && (
                                  <span className="text-xs font-medium text-purple-600">
                                    📚
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs font-medium text-gray-900 mb-1 truncate">
                                {task.activity}
                              </h5>
                              <p className="text-xs text-gray-600 truncate">
                                {task.topic}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {task.isFlashcardTask && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(task.description, task.id);
                                  }}
                                  className={`p-1 transition-colors ${
                                    copiedTaskId === task.id
                                      ? "text-green-600"
                                      : "text-purple-600 hover:text-purple-700"
                                  }`}
                                  title="Copy flashcard prompt"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                              {task.completed && (
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              )}
                            </div>
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
            <button
              onClick={() => setShowPlanForm(true)}
              className={`px-6 py-3 ${themeClasses.buttonSecondary}`}
            >
              Generate New Plan
            </button>
          </div>
        </div>

        {/* Study Plan History - Full width on mobile, 1/4 on desktop */}
        <div className="lg:col-span-1">
          <div className={`${themeClasses.card} rounded-lg shadow-sm p-4`}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className={`text-lg font-bold ${themeClasses.text}`}>
                Study Plan History
              </h3>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-8">
                <LoadingSpinner size="sm" text="Loading history..." />
              </div>
            ) : studyPlanHistory.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No previous plans</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studyPlanHistory.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-3 bg-gray-50 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                      plan.id === selectedPlanId
                        ? "border-purple-500 shadow-lg shadow-purple-500/10"
                        : "border-gray-200"
                    }`}
                    onClick={() => loadPlanFromHistory(plan.id)}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      TT for {formatHistoryDate(plan.createdAt)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {plan.dailyHours}h daily •{" "}
                      {plan.weakTopics?.slice(0, 2).join(", ") || "No topics"}
                      {plan.weakTopics && plan.weakTopics.length > 2 && "..."}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {plan.tasks?.filter((t) => t.completed).length || 0}/
                      {plan.tasks?.length || 0} completed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Copied to clipboard! 📋
        </motion.div>
      )}
    </div>
  );
}
