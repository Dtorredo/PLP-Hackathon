import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

export function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9);
}

export function calculateTopicStrength(attempts: number, correct: number): number {
  if (attempts === 0) return 0;
  return Math.min(correct / attempts, 1);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getRandomQuestions<T>(questions: T[], count: number): T[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function calculateQuizScore(questions: Array<{ isCorrect: boolean }>): number {
  const correct = questions.filter(q => q.isCorrect).length;
  return Math.round((correct / questions.length) * 100);
}

export function getWeakTopics(userTopics: Record<string, { strength: number }>): string[] {
  return Object.entries(userTopics)
    .filter(([, data]) => data.strength < 0.7)
    .sort(([, a], [, b]) => a.strength - b.strength)
    .map(([topic]) => topic);
}

export function generateStudyPlan(weakTopics: string[], timeframeDays: number) {
  const tasks = [];
  const topicsPerDay = Math.ceil(weakTopics.length / timeframeDays);
  
  for (let day = 1; day <= timeframeDays; day++) {
    const startIndex = (day - 1) * topicsPerDay;
    const dayTopics = weakTopics.slice(startIndex, startIndex + topicsPerDay);
    
    if (dayTopics.length > 0) {
      tasks.push({
        day,
        topics: dayTopics,
        tasks: [
          `Review ${dayTopics.join(', ')} concepts`,
          `Complete practice problems on ${dayTopics.join(', ')}`,
          `Take a mini-quiz on ${dayTopics.join(', ')}`
        ],
        estimatedTime: dayTopics.length * 30, // 30 minutes per topic
        completed: false
      });
    }
  }
  
  return tasks;
}
