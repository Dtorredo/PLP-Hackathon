import { motion } from 'framer-motion';
import { User, Trophy, TrendingUp, Target, Award } from 'lucide-react';
import type { User as UserType, AppState } from '../../lib/types';
import { formatDate } from '../../lib/utils';

interface ProfilePageProps {
  user: UserType;
  onStateChange: (state: AppState) => void;
}

export function ProfilePage({ user }: ProfilePageProps) {
  const getTopicStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'text-green-600';
    if (strength >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTopicStrengthLabel = (strength: number) => {
    if (strength >= 0.8) return 'Strong';
    if (strength >= 0.6) return 'Good';
    if (strength >= 0.4) return 'Fair';
    return 'Needs Work';
  };

  const getBadges = () => {
    const badges = [];
    
    if (user.points >= 100) badges.push({ name: 'Century Club', icon: '🏆', description: 'Earned 100+ points' });
    if (user.streak >= 5) badges.push({ name: 'Streak Master', icon: '🔥', description: '5+ day streak' });
    if (user.streak >= 10) badges.push({ name: 'Dedicated Learner', icon: '⭐', description: '10+ day streak' });
    if (Object.keys(user.topics).length >= 3) badges.push({ name: 'Multi-Subject', icon: '📚', description: 'Studying 3+ subjects' });
    
    return badges;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-gray-600 mb-3">{user.email}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Member since {formatDate(user.createdAt)}</span>
              <span>Last active {formatDate(user.lastActive)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
            <Trophy className="w-6 h-6 text-primary-600" />
          </div>
          <div className="text-3xl font-bold text-primary-600 mb-1">{user.points}</div>
          <div className="text-gray-600">Total Points</div>
        </div>
        
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">{user.streak}</div>
          <div className="text-gray-600">Day Streak</div>
        </div>
        
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{Object.keys(user.topics).length}</div>
          <div className="text-gray-600">Subjects</div>
        </div>
      </div>

      {/* Topic Progress */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          Topic Progress
        </h2>
        
        {Object.keys(user.topics).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No topics studied yet. Take some quizzes to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(user.topics).map(([topic, data]) => (
              <div key={topic} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 capitalize">{topic}</h3>
                  <span className={`text-sm font-medium ${getTopicStrengthColor(data.strength)}`}>
                    {getTopicStrengthLabel(data.strength)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Attempts: {data.attempts}</span>
                    <span>Correct: {data.correct}</span>
                    <span>Success Rate: {Math.round(data.strength * 100)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-primary-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.strength * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Last studied: {formatDate(new Date(data.lastSeen))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-600" />
          Achievements & Badges
        </h2>
        
        {getBadges().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No badges earned yet. Keep studying to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {getBadges().map((badge) => (
              <div key={badge.name} className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Study Tips</h3>
        <ul className="text-blue-800 text-sm space-y-2">
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
