import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, ArrowRight } from 'lucide-react';
import type { User } from '../../lib/types';
import { signUpWithEmail, signInWithEmail } from '../../lib/auth';

interface OnboardingPageProps {
  onComplete: (userData: Partial<User>) => void;
  onSkip: () => void;
}

export function OnboardingPage({ onComplete, onSkip }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subjects: [] as string[]
  });
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        setError(null);
        if (isLogin) {
          await signInWithEmail(formData.email, password);
        } else {
          await signUpWithEmail(formData.name, formData.email, password);
        }
        onComplete(formData);
      } catch (e: unknown) {
        const error = e as Error;
        setError(error?.message || 'Authentication failed');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Brain className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AI Study Buddy
          </h1>
          <p className="text-gray-600">Let's personalize your learning experience</p>
        </div>

        <div className="mb-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What's your name?</h2>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field text-lg"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What's your email?</h2>
              <input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-field text-lg"
                autoFocus
              />
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Password</h3>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-lg"
                />
                <div className="text-sm text-gray-500 mt-2">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={isLogin} onChange={(e) => setIsLogin(e.target.checked)} />
                    I already have an account (Log in)
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What subjects are you studying?</h2>
              <div className="grid grid-cols-2 gap-3">
                {['Calculus', 'Algebra', 'Physics', 'Chemistry', 'Biology', 'Computer Science'].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      subjects: prev.subjects.includes(subject)
                        ? prev.subjects.filter(s => s !== subject)
                        : [...prev.subjects, subject]
                    }))}
                    className={`p-3 rounded-lg border-2 text-left transition-colors duration-200 ${
                      formData.subjects.includes(subject)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4">{error}</div>
        )}
        <div className="flex justify-between">
          <button onClick={step === 1 ? onSkip : handleBack} className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? 'Skip' : 'Back'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={step === 1 ? !formData.name.trim() : step === 2 ? !formData.email.trim() : formData.subjects.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? 'Complete Setup' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
