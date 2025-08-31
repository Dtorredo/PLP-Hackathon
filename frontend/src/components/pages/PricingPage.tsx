import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Zap } from "lucide-react";
import type { User, AppState } from "../../lib/types";
import { LoadingSpinner } from "../ui/LoadingSpinner";
// M-Pesa payment integration

interface PricingPageProps {
  user: User;
  onStateChange: (state: AppState) => void;
}

export function PricingPage({ user, onStateChange }: PricingPageProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    // TODO: Load plans from your backend
    const mockPlans = [
      {
        id: "basic",
        name: "Basic",
        description: "For individuals getting started",
        price: 0,
        currency: "KES",
        interval: "one-time",
        features: ["5 daily questions", "Basic analytics"],
      },
      {
        id: "premium",
        name: "Premium",
        description: "For serious learners",
        price: 10,
        currency: "KES",
        interval: "monthly",
        features: [
          "Unlimited daily questions",
          "Advanced analytics",
          "Priority support",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        description: "For power users",
        price: 20,
        currency: "KES",
        interval: "monthly",
        features: [
          "All premium features",
          "AI-powered study planner",
          "Personalized feedback",
        ],
      },
    ];
    setPlans(mockPlans);
    // TODO: Check user subscription status
  }, []);

  const handleSubscribe = async (plan: any) => {
    if (plan.price === 0) {
      // Free plan - just activate it
      console.log("Activating free plan");
      return;
    }

    // Prompt for phone number
    const phoneNumber = prompt("Please enter your M-Pesa phone number (e.g., 254700000000):");
    if (!phoneNumber) {
      alert("Phone number is required for M-Pesa payment");
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan);

    try {
      const result = await paymentService.initializePayment(plan, phoneNumber, user?.email || "");
      console.log("Payment result:", result);

      if (result.success) {
        alert(`M-Pesa payment initiated! ${result.customerMessage || 'Check your phone for the payment prompt.'}`);
        // You can redirect to a success page or update UI
      } else {
        alert(`Payment failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "basic":
        return <Star className="w-5 h-5" />;
      case "premium":
        return <Zap className="w-5 h-5" />;
      case "pro":
        return <Crown className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return userSubscription?.planId === planId;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Choose Your Learning Plan
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Unlock your full learning potential with our premium features designed
          to accelerate your academic success.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-secondary-800 rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
              plan.id === "premium"
                ? "border-primary-500 shadow-lg shadow-primary-500/20 bg-gradient-to-br from-secondary-800 to-secondary-700"
                : "border-secondary-700 hover:border-secondary-600"
            }`}
          >
            {/* Popular Badge */}
            {plan.id === "premium" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div
                  className={`p-2 rounded-full ${
                    plan.id === "premium"
                      ? "bg-primary-500"
                      : "bg-secondary-700"
                  }`}
                >
                  {getPlanIcon(plan.id)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-400">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {plan.currency === "KES" ? "KSh" : "$"}
                  {plan.price}
                </span>
                {plan.interval !== "one-time" && (
                  <span className="text-gray-400 ml-2 text-sm">
                    /{plan.interval === "monthly" ? "month" : "year"}
                  </span>
                )}
                {plan.price === 0 && (
                  <span className="text-gray-400 ml-2 text-sm">forever</span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={isLoading || isCurrentPlan(plan.id)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 mb-6 ${
                isCurrentPlan(plan.id)
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : "text-black border border-gray-300 shadow-lg hover:shadow-xl"
              }`}
              style={
                !isCurrentPlan(plan.id)
                  ? { backgroundColor: "white" }
                  : undefined
              }
            >
              {isLoading && selectedPlan?.id === plan.id ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : isCurrentPlan(plan.id) ? (
                "Current Plan"
              ) : plan.price === 0 ? (
                "Get Started"
              ) : (
                "Get Started"
              )}
            </button>

            {/* Features */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">
                What you will get:
              </h4>
              <ul className="space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-secondary-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-secondary-900 rounded-lg p-6 border border-secondary-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              Can I cancel anytime?
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Yes! You can cancel your subscription at any time. Your access
              will continue until the end of your current billing period.
            </p>
          </div>

          <div className="bg-secondary-900 rounded-lg p-6 border border-secondary-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              Is there a free trial?
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              We offer a 7-day free trial for all premium plans. No credit card
              required to start your trial.
            </p>
          </div>

          <div className="bg-secondary-900 rounded-lg p-6 border border-secondary-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              What payment methods do you accept?
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              We accept all major credit cards through our secure payment
              partner Stripe.
            </p>
          </div>

          <div className="bg-secondary-900 rounded-lg p-6 border border-secondary-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              Can I upgrade or downgrade my plan?
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Absolutely! You can upgrade or downgrade your plan at any time.
              Changes take effect immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
