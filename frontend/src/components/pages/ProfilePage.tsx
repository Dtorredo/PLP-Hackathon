import { User, Trophy, TrendingUp, Target, Award } from "lucide-react";
import type { User as UserType } from "../../lib/types";
import { formatDate } from "../../lib/utils";
import { useTheme } from "../../lib/theme.tsx";

interface ProfilePageProps {
  user: UserType;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const { theme } = useTheme();

  const getBadges = () => {
    return user.achievements || [];
  };

  // Theme-aware classes
  const getThemeClasses = () => {
    return {
      container:
        theme === "light"
          ? "bg-[#FDF2F8] rounded-lg shadow-sm border border-gray-200"
          : "bg-[#140D13] rounded-lg shadow-lg border border-secondary-700",
      text: theme === "light" ? "text-gray-900" : "text-white",
      textSecondary: theme === "light" ? "text-gray-600" : "text-gray-300",
      textTertiary: theme === "light" ? "text-gray-500" : "text-gray-400",
      card:
        theme === "light"
          ? "bg-[#FDF2F8] border border-gray-200"
          : "bg-[#140D13] border border-secondary-700",
      specialCard:
        theme === "light"
          ? "bg-pink-50 border border-pink-200"
          : "bg-secondary-650 border-secondary-700",
      iconBg: theme === "light" ? "bg-pink-100" : "bg-primary-900",
      iconColor: theme === "light" ? "text-pink-600" : "text-primary-400",
      greenIconBg: theme === "light" ? "bg-green-100" : "bg-green-900",
      greenIconColor: theme === "light" ? "text-green-600" : "text-green-400",
      targetIconBg: theme === "light" ? "bg-gray-100" : "bg-secondary-650",
      targetIconColor: theme === "light" ? "text-gray-600" : "text-white",
    };
  };

  const themeClasses = getThemeClasses();

  // Ensure user has valid dates
  const userCreatedAt =
    user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  const userLastActive =
    user.lastActive instanceof Date
      ? user.lastActive
      : new Date(user.lastActive);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-8">
      {/* Profile Header */}
      <div className={`${themeClasses.container} p-6`}>
        <div className="flex items-center gap-6">
          <div
            className={`w-20 h-20 ${themeClasses.iconBg} rounded-full flex items-center justify-center`}
          >
            <User className={`w-10 h-10 ${themeClasses.iconColor}`} />
          </div>
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
              {user.name}
            </h1>
            <p className={`${themeClasses.textSecondary} mb-3`}>{user.email}</p>
            <div
              className={`flex items-center gap-6 text-sm ${themeClasses.textSecondary}`}
            >
              <span>Member since {formatDate(userCreatedAt)}</span>
              <span>Last active {formatDate(userLastActive)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className={`${themeClasses.card} p-6 text-center`}>
          <div
            className={`inline-flex items-center justify-center w-12 h-12 ${themeClasses.iconBg} rounded-full mb-4`}
          >
            <Trophy className={`w-6 h-6 ${themeClasses.iconColor}`} />
          </div>
          <div className={`text-3xl font-bold ${themeClasses.iconColor} mb-1`}>
            {user.points}
          </div>
          <div className={themeClasses.textSecondary}>Total Points</div>
        </div>

        <div className={`${themeClasses.card} p-6 text-center`}>
          <div
            className={`inline-flex items-center justify-center w-12 h-12 ${themeClasses.greenIconBg} rounded-full mb-4`}
          >
            <TrendingUp className={`w-6 h-6 ${themeClasses.greenIconColor}`} />
          </div>
          <div
            className={`text-3xl font-bold ${themeClasses.greenIconColor} mb-1`}
          >
            {user.streak}
          </div>
          <div className={themeClasses.textSecondary}>Day Streak</div>
        </div>

        <div className={`${themeClasses.card} p-6 text-center`}>
          <div
            className={`inline-flex items-center justify-center w-12 h-12 ${themeClasses.targetIconBg} rounded-full mb-4`}
          >
            <Target className={`w-6 h-6 ${themeClasses.targetIconColor}`} />
          </div>
          <div
            className={`text-3xl font-bold ${themeClasses.targetIconColor} mb-1`}
          >
            {Object.keys(user.topics).length}
          </div>
          <div className={themeClasses.textSecondary}>Subjects</div>
        </div>
      </div>

      {/* Badges */}
      <div className={`${themeClasses.container} p-6`}>
        <h2
          className={`text-xl font-bold ${themeClasses.text} mb-6 flex items-center gap-2`}
        >
          <Award className="w-5 h-5 text-pink-600" />
          Achievements & Badges
        </h2>

        {getBadges().length === 0 ? (
          <div className={`text-center py-8 ${themeClasses.textTertiary}`}>
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No badges earned yet. Keep studying to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {getBadges().map((badge) => (
              <div
                key={badge.id}
                className={`${themeClasses.card} rounded-lg p-4 text-center`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className={`font-semibold ${themeClasses.text} mb-1`}>
                  {badge.name}
                </h3>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {badge.description}
                </p>
                <p className={`text-xs ${themeClasses.textTertiary} mt-2`}>
                  Earned {formatDate(badge.earnedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className={`${themeClasses.specialCard} p-6`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-3`}>
          💡 Study Tips
        </h3>
        <ul className={`${themeClasses.textSecondary} text-sm space-y-2`}>
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
