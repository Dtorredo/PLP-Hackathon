import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

export function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center p-8"
      >
        <div className="mb-8">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Cancelled
          </h1>
          <p className="text-gray-300 mb-6">
            Your payment was cancelled. You can still use the free features of
            AI Study Buddy, or try subscribing again anytime.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            You can still use the free features of AI Study Buddy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
