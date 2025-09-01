import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center p-8"
      >
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-300 mb-6">
            Thank you for subscribing to AI Study Buddy Premium. Your
            subscription is now active and you have access to all premium
            features.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Your subscription is now active!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
