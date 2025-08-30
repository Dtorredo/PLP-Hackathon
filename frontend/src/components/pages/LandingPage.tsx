import { motion } from 'framer-motion';
import { Brain, BookOpen, Target, Users, Sparkles, ArrowRight, LogIn } from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onSignUp, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-primary-900 rounded-full mb-8"
          >
            <Brain className="w-10 h-10 text-primary-400" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Meet Your
            <span className="text-primary-500 block">AI Study Buddy</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Your personal AI-powered study assistant that helps you learn smarter, 
            track progress, and ace your exams with personalized study plans and instant answers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignUp}
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignIn}
              className="bg-secondary-800 text-white border border-secondary-700 rounded-lg px-6 py-4 flex items-center justify-center gap-2 shadow-sm hover:shadow transition"
            >
              <LogIn className="w-5 h-5 text-primary-500" />
              Sign In
            </motion.button>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {[
            {
              icon: BookOpen,
              title: "Smart Learning",
              description: "Get instant, accurate answers with source citations and explanations tailored to your level."
            },
            {
              icon: Target,
              title: "Personalized Quizzes",
              description: "Adaptive quizzes that focus on your weak areas and track your progress over time."
            },
            {
              icon: Users,
              title: "Study Planning",
              description: "AI-generated study plans that adapt to your schedule and learning pace."
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="card text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-900 rounded-full mb-6">
                <feature.icon className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Start your personalized learning journey today. No credit card required, 
              just pure AI-powered education at your fingertips.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignUp}
              className="bg-primary-100 text-primary-800 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-primary-200 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
            >
              Start Learning Now
              <Sparkles className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}