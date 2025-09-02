import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Zap } from "lucide-react";
import type { User } from "../../lib/types";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { paymentService } from "../../lib/payment";
import { useTheme } from "../../lib/theme.tsx";
// M-Pesa payment integration

interface PricingPageProps {
  user: User;
}

export function PricingPage({ user }: PricingPageProps) {
  const { theme } = useTheme();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Theme-aware classes
  const getThemeClasses = () => {
    return {
      text: theme === "light" ? "text-gray-900" : "text-white",
      textSecondary: theme === "light" ? "text-gray-600" : "text-gray-300",
      textTertiary: theme === "light" ? "text-gray-500" : "text-gray-400",
      card:
        theme === "light"
          ? "bg-[#F2DEF6] border border-gray-200"
          : "bg-[#140D13] border border-secondary-700",
      popularCard:
        theme === "light"
          ? "bg-gradient-to-br from-pink-50 to-white border-pink-300 shadow-lg shadow-pink-500/20"
          : "bg-gradient-to-br from-secondary-800 to-secondary-700 border-primary-500 shadow-lg shadow-primary-500/20",
      popularBadge:
        theme === "light"
          ? "bg-pink-600 text-white"
          : "bg-primary-500 text-white",
      iconBg: theme === "light" ? "bg-pink-600" : "bg-primary-500",
      iconBgSecondary: theme === "light" ? "bg-gray-100" : "bg-secondary-700",
      button:
        theme === "light"
          ? "bg-pink-600 hover:bg-pink-700 text-white"
          : "bg-primary-600 hover:bg-primary-700 text-white",
      buttonDisabled:
        theme === "light"
          ? "bg-green-600 text-white cursor-not-allowed"
          : "bg-green-600 text-white cursor-not-allowed",
      faqContainer:
        theme === "light"
          ? "bg-[#F2DEF6] border border-gray-200"
          : "bg-[#140D13] border border-secondary-700",
      faqItem:
        theme === "light"
          ? "bg-[#F2DEF6] border border-gray-800/20 shadow-sm"
          : "bg-secondary-900 border border-secondary-700",
    };
  };

  const themeClasses = getThemeClasses();

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
    const phoneNumber = prompt(
      "Please enter your M-Pesa phone number (e.g., 254700000000):"
    );
    if (!phoneNumber) {
      alert("Phone number is required for M-Pesa payment");
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan);

    try {
      const result = await paymentService.initializePayment(
        plan,
        phoneNumber,
        user?.email || ""
      );
      console.log("Payment result:", result);

      if (result.success) {
        alert(
          `M-Pesa payment initiated! ${
            result.customerMessage || "Check your phone for the payment prompt."
          }`
        );
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

  const isCurrentPlan = (_planId: string) => {
    return false; // TODO: Implement subscription checking
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-bold ${themeClasses.text} mb-4`}>
          Choose Your Learning Plan
        </h1>
        <p
          className={`text-xl ${themeClasses.textSecondary} max-w-2xl mx-auto`}
        >
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
            className={`relative ${
              plan.id === "premium"
                ? themeClasses.popularCard
                : themeClasses.card
            } rounded-xl p-6 transition-all duration-300 hover:scale-105`}
          >
            {/* Popular Badge */}
            {plan.id === "premium" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span
                  className={`${themeClasses.popularBadge} px-3 py-1 rounded-full text-xs font-medium`}
                >
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
                      ? themeClasses.iconBg
                      : themeClasses.iconBgSecondary
                  }`}
                >
                  {getPlanIcon(plan.id)}
                </div>
              </div>
              <h3 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                {plan.name}
              </h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {plan.description}
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center">
                <span className={`text-3xl font-bold ${themeClasses.text}`}>
                  {plan.currency === "KES" ? "KSh" : "$"}
                  {plan.price}
                </span>
                {plan.interval !== "one-time" && (
                  <span
                    className={`${themeClasses.textSecondary} ml-2 text-sm`}
                  >
                    /{plan.interval === "monthly" ? "month" : "year"}
                  </span>
                )}
                {plan.price === 0 && (
                  <span
                    className={`${themeClasses.textSecondary} ml-2 text-sm`}
                  >
                    forever
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={isLoading || isCurrentPlan(plan.id)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 mb-6 ${
                isCurrentPlan(plan.id)
                  ? themeClasses.buttonDisabled
                  : themeClasses.button
              }`}
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
              <h4 className={`text-sm font-medium ${themeClasses.text} mb-3`}>
                What you will get:
              </h4>
              <ul className="space-y-2">
                {plan.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className={`text-sm ${themeClasses.textSecondary}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className={`${themeClasses.faqContainer} rounded-xl p-8`}>
        <h2
          className={`text-2xl font-bold ${themeClasses.text} mb-8 text-center`}
        >
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`${themeClasses.faqItem} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>
              Can I cancel anytime?
            </h3>
            <p
              className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}
            >
              Yes! You can cancel your subscription at any time. Your access
              will continue until the end of your current billing period.
            </p>
          </div>

          <div className={`${themeClasses.faqItem} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>
              Is there a free trial?
            </h3>
            <p
              className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}
            >
              We offer a 7-day free trial for all premium plans. No credit card
              required to start your trial.
            </p>
          </div>

          <div className={`${themeClasses.faqItem} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>
              What payment methods do you accept?
            </h3>
            <p
              className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}
            >
              We accept M-Pesa mobile payments for secure and convenient
              transactions.
            </p>
          </div>

          <div className={`${themeClasses.faqItem} rounded-lg p-6`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-3`}>
              Can I upgrade or downgrade my plan?
            </h3>
            <p
              className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}
            >
              Absolutely! You can upgrade or downgrade your plan at any time.
              Changes take effect immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
