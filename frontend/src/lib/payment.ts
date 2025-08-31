// Payment service for Stripe integration
export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

export interface PaymentResponse {
  success: boolean;
  checkoutRequestID?: string;
  customerMessage?: string;
  error?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  transactionId: string;
  amount: number;
  currency: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private backendUrl = "http://localhost:3001";

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Initialize M-Pesa payment
  async initializePayment(plan: PaymentPlan, phoneNumber: string, userId: string): Promise<PaymentResponse> {
    try {
      console.log("Initializing M-Pesa payment for plan:", plan);
      console.log("Phone number:", phoneNumber);

      const response = await fetch(`${this.backendUrl}/api/v1/payment/initiate-mpesa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: plan,
          phoneNumber: phoneNumber,
          userId: userId,
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (data.success) {
        return {
          success: true,
          checkoutRequestID: data.checkoutRequestID,
          customerMessage: data.customerMessage,
        };
      } else {
        return {
          success: false,
          error: data.error || "Failed to initiate payment",
        };
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      return {
        success: false,
        error: "Failed to initialize payment. Please try again.",
      };
    }
  }

  // Get available plans
  getAvailablePlans(): PaymentPlan[] {
    return [
      {
        id: "basic",
        name: "Basic",
        price: 0,
        currency: "KES",
        description: "Perfect for getting started",
        features: [
          "5 flashcards per day",
          "Basic AI chat",
          "Study plan generation",
          "Progress tracking",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: 10,
        currency: "KES",
        description: "Most popular choice",
        features: [
          "Unlimited flashcards",
          "Advanced AI chat",
          "Custom study plans",
          "Priority support",
          "Export features",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        price: 20,
        currency: "KES",
        description: "For serious learners",
        features: [
          "Everything in Premium",
          "Advanced analytics",
          "Team collaboration",
          "API access",
          "Custom integrations",
        ],
      },
    ];
  }

  // Check subscription status
  async checkSubscriptionStatus(userId: string): Promise<{
    success: boolean;
    subscription?: UserSubscription;
    hasActiveSubscription?: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/v1/payment/subscription/${userId}`
      );
      const data = await response.json();

      return {
        success: data.success,
        subscription: data.subscription,
        hasActiveSubscription: data.hasActiveSubscription,
        error: data.error,
      };
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return {
        success: false,
        error: "Failed to check subscription status",
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/v1/payment/cancel/${userId}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      return {
        success: data.success,
        error: data.error,
      };
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return {
        success: false,
        error: "Failed to cancel subscription",
      };
    }
  }
}

export const paymentService = PaymentService.getInstance();
