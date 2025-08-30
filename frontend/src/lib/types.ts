export interface StackableItem {
  id: number | string;
  [key: string]: unknown;
}

// AI Study Buddy Types
export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  streak: number;
  subjects: string[];
  topics: TopicProgress;
  achievements: Achievement[];
  flashcardHistory: FlashcardHistory[];
  createdAt: Date;
  lastActive: Date;
}

export interface TopicProgress {
  [topic: string]: {
    attempts: number;
    correct: number;
    lastSeen: number;
    strength: number; // 0-1, where 1 is strongest
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: 'points' | 'streak' | 'subjects' | 'flashcards' | 'study_plan';
}

export interface FlashcardHistory {
  id: string;
  prompt: string;
  module: string;
  specificArea?: string;
  flashcards: Flashcard[];
  createdAt: Date;
  lastViewed?: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface Question {
  id: string;
  topic: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  userId: string;
  questions: QuizQuestion[];
  score: number | null;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface QuizQuestion {
  id: string;
  questionId: string;
  topic: string;
  question: string;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  explanation: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  timeframeDays: number;
  tasks: StudyTask[];
  createdAt: Date;
  completedDays: number[];
}

export interface StudyTask {
  day: number;
  topics: string[];
  tasks: string[];
  estimatedTime: number; // in minutes
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
  confidence?: number;
}

export interface Source {
  docId: string;
  title: string;
  snippet: string;
  sourceUrl?: string;
}

export interface AIResponse {
  answer: string;
  explanation: string;
  practice: string[];
  sources: Source[];
  confidence: number;
}

export interface Session {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActive: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AskResponse extends ApiResponse<AIResponse> {
  responseId: string;
}

export interface QuizStartResponse extends ApiResponse<Quiz> {
  quizId: string;
}

export type QuizAnswerResponse = ApiResponse<{
  correct: boolean;
  explanation: string;
  newScore: number;
}>;

export type StudyPlanResponse = ApiResponse<StudyPlan>;

export type UserProfileResponse = ApiResponse<User>;

// UI State Types
export interface AppState {
  user: User | null;
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  inputValue: string;
}

export interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  userAnswers: Record<string, string>;
  isComplete: boolean;
}

export interface StudyPlanState {
  currentPlan: StudyPlan | null;
  completedTasks: string[];
}
