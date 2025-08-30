import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import type { User, AppState } from "../../lib/types";

interface QuizPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

const sampleQuestions = [
  {
    id: "q1",
    question: "What is the derivative of x²?",
    answer: "2x",
    explanation: "The derivative of x² is 2x using the power rule",
  },
  {
    id: "q2",
    question: "What is the integral of 2x?",
    answer: "x² + C",
    explanation:
      "The integral of 2x is x² + C, where C is the constant of integration",
  },
  {
    id: "q3",
    question: "Solve for x: 2x + 5 = 13",
    answer: "4",
    explanation: "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
  },
];

export function QuizPage({ user, onStateChange }: QuizPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSubmit = (answer: string) => {
    const question = sampleQuestions[currentQuestionIndex];
    const isCorrect = answer.toLowerCase() === question.answer.toLowerCase();

    setUserAnswers((prev) => ({ ...prev, [question.id]: answer }));

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setIsComplete(true);
    const finalScore = Math.round((score / sampleQuestions.length) * 100);
    const pointsToAdd = finalScore;

    const updatedUser = { ...user, points: user.points + pointsToAdd };
    onStateChange({
      user: updatedUser,
      currentSession: null,
      isLoading: false,
      error: null,
    });

    localStorage.setItem("ai-study-buddy-user", JSON.stringify(updatedUser));
  };

  const startQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsComplete(false);
    setScore(0);
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
          <div className="text-4xl font-bold text-primary-600 mb-2">
            {Math.round((score / sampleQuestions.length) * 100)}%
          </div>
          <p className="text-gray-600 mb-6">
            You got {score} out of {sampleQuestions.length} questions correct!
          </p>
          <button onClick={startQuiz} className="btn-primary">
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {sampleQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(
                ((currentQuestionIndex + 1) / sampleQuestions.length) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  ((currentQuestionIndex + 1) / sampleQuestions.length) * 100
                }%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-4">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Type your answer..."
              value={userAnswers[currentQuestion.id] || ""}
              onChange={(e) =>
                setUserAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.id]: e.target.value,
                }))
              }
              className="input-field"
              onKeyPress={(e) =>
                e.key === "Enter" &&
                handleAnswerSubmit(userAnswers[currentQuestion.id] || "")
              }
            />

            <button
              onClick={() =>
                handleAnswerSubmit(userAnswers[currentQuestion.id] || "")
              }
              disabled={!userAnswers[currentQuestion.id]?.trim()}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
