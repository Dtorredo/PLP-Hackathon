import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus } from 'lucide-react';
import { signUpWithEmail } from '../../lib/auth';

interface SignUpPageProps {
  onSignUpSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUpPage({ onSignUpSuccess, onSwitchToSignIn }: SignUpPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmail(name, email, password);
      onSignUpSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during sign up.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Start your personalized learning journey.</p>
        </div>
        
        <form onSubmit={handleSignUp} className="card space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="input-field"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              disabled={isLoading}
            />
          </div>

          <div>
            <button 
              type="submit" 
              className="btn-primary w-full flex justify-center items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToSignIn} className="font-medium text-primary-600 hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}