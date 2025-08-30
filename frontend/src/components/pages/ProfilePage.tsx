import { motion } from "framer-motion";
import { User, Trophy, TrendingUp, Target, Award } from "lucide-react";
import type { User as UserType, AppState } from "../../lib/types";
import { formatDate } from "../../lib/utils";

interface ProfilePageProps {
  user: UserType;
  onStateChange: (state: AppState) => void;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const getTopicStrengthColor = (strength: number) => {
    if (strength >= 0.8) return "text-green-600";
    if (strength >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getTopicStrengthLabel = (strength: number) => {
    if (strength >= 0.8) return "Strong";
    if (strength >= 0.6) return "Good";
    if (strength >= 0.4) return "Fair";
    return "Needs Work";
  };

  const getBadges = () => {
    return user.achievements || [];
  };

  // Ensure user has valid dates
  const userCreatedAt =
    user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  const userLastActive =
    user.lastActive instanceof Date
      ? user.lastActive
      : new Date(user.lastActive);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary-900 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
            <p className="text-gray-300 mb-3">{user.email}</p>
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <span>Member since {formatDate(userCreatedAt)}</span>
              <span>Last active {formatDate(userLastActive)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-900 rounded-full mb-4">
            <Trophy className="w-6 h-6 text-primary-400" />
          </div>
          <div className="text-3xl font-bold text-primary-400 mb-1">
            {user.points}
          </div>
          <div className="text-gray-300">Total Points</div>
        </div>

        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-900 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">
            {user.streak}
          </div>
          <div className="text-gray-300">Day Streak</div>
        </div>

        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-650 rounded-full mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {Object.keys(user.topics).length}
          </div>
          <div className="text-gray-300">Subjects</div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-500" />
          Achievements & Badges
        </h2>

        {getBadges().length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No badges earned yet. Keep studying to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {getBadges().map((badge) => (
              <div
                key={badge.id}
                className="border border-secondary-700 rounded-lg p-4 text-center"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold text-white mb-1">{badge.name}</h3>
                <p className="text-sm text-gray-400">{badge.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Earned {formatDate(badge.earnedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className="card bg-secondary-650 border-secondary-700">
        <h3 className="font-semibold text-white mb-3">💡 Study Tips</h3>
        <ul className="text-gray-300 text-sm space-y-2">
          <li>• Study consistently to maintain your streak</li>
          <li>• Focus on topics where your strength is below 70%</li>
          <li>• Take quizzes regularly to track progress</li>
          <li>• Review explanations for incorrect answers</li>
          <li>• Set daily study goals to build momentum</li>
        </ul>
      </div>
    </div>
  );
}
