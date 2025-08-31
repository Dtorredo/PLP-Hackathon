import { useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PaymentCancelPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect back to the main app after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to App
          </button>

          <p className="text-sm text-gray-400">
            You will be redirected automatically in 5 seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
