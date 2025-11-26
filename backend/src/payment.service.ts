import { db } from "./lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import axios from "axios";
import crypto from "crypto";

// M-Pesa Daraja API Configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "";
const MPESA_BUSINESS_SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE || "";
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || "sandbox"; // sandbox or live

// API URLs
const MPESA_BASE_URL =
  MPESA_ENVIRONMENT === "live"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  planId: string;
  userId: string;
  reference: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkoutRequestID?: string;
  merchantRequestID?: string;
  customerMessage?: string;
  error?: string;
}

export interface MpesaWebhook {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface Subscription {
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
  private accessToken: string = "";
  private tokenExpiry: Date | null = null;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Get M-Pesa access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
      ).toString("base64");

      const response = await axios.get(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      this.accessToken = response.data.access_token || "";
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error("Error getting access token:", error);
      throw new Error("Failed to get M-Pesa access token");
    }
  }

  // Initiate M-Pesa STK Push
  async initiateMpesaPayment(
    paymentRequest: MpesaPaymentRequest
  ): Promise<MpesaPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, -3);
      const password = Buffer.from(
        `${MPESA_BUSINESS_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
      ).toString("base64");

      const requestBody = {
        BusinessShortCode: MPESA_BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: paymentRequest.amount,
        PartyA: paymentRequest.phoneNumber,
        PartyB: MPESA_BUSINESS_SHORTCODE,
        PhoneNumber: paymentRequest.phoneNumber,
        CallBackURL:
          process.env.NODE_ENV === "production"
            ? "https://yourdomain.com/api/v1/payment/mpesa-callback"
            : "https://webhook.site/your-test-url", // or use ngrok during local testing
        AccountReference: paymentRequest.userId, // Pass userId here for identification
        TransactionDesc: `AI Study Buddy - ${paymentRequest.planId}`,
      };
      

      const response = await axios.post(
        `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (result.ResponseCode === "0") {
        return {
          success: true,
          checkoutRequestID: result.CheckoutRequestID,
          merchantRequestID: result.MerchantRequestID,
          customerMessage: result.CustomerMessage,
        };
      } else {
        return {
          success: false,
          error: result.ResponseDescription || "Payment initiation failed",
        };
      }
    } catch (error) {
      console.error("Error initiating M-Pesa payment:", error);
      return {
        success: false,
        error: "Failed to initiate payment. Please try again.",
      };
    }
  }

  // Handle M-Pesa callback
  async handleMpesaCallback(webhookData: MpesaWebhook): Promise<boolean> {
    try {
      console.log("Processing M-Pesa callback:", webhookData);
      const { stkCallback } = webhookData.Body;

      if (stkCallback.ResultCode === 0) {
        const metadata = stkCallback.CallbackMetadata?.Item || [];
        const amount = metadata.find((item) => item.Name === "Amount")
          ?.Value as number;
        const mpesaReceiptNumber = metadata.find(
          (item) => item.Name === "MpesaReceiptNumber"
        )?.Value as string;
        const phoneNumber = metadata.find((item) => item.Name === "PhoneNumber")
          ?.Value as string;

        const userId = stkCallback.MerchantRequestID || phoneNumber;

        await this.createSubscription({
          id: mpesaReceiptNumber,
          userId,
          planId: "premium", // You may need a better way to track planId
          amount,
          currency: "KES",
        });

        return true;
      } else {
        console.log("Payment failed:", stkCallback.ResultDesc);
        return false;
      }
    } catch (error) {
      console.error("M-Pesa callback processing error:", error);
      return false;
    }
  }

  // Create subscription
  private async createSubscription(paymentData: {
    id: string;
    userId: string;
    planId: string;
    amount: number;
    currency: string;
  }): Promise<void> {
    const subscriptionData: Subscription = {
      id: paymentData.id,
      userId: paymentData.userId,
      planId: paymentData.planId,
      status: "active",
      startDate: new Date(),
      endDate: this.calculateEndDate(paymentData.planId),
      autoRenew: true,
      transactionId: paymentData.id,
      amount: paymentData.amount,
      currency: paymentData.currency,
    };

    const subscriptionRef = doc(db, "subscriptions", paymentData.id);
    await setDoc(subscriptionRef, subscriptionData);

    // Update user's profile with active subscription
    const userRef = doc(db, "users", paymentData.userId);
    await setDoc(userRef, { subscription: subscriptionData }, { merge: true });
  }

  // Calculate subscription end date
  private calculateEndDate(planId: string): Date {
    const now = new Date();
    const duration = 30 * 24 * 60 * 60 * 1000; // 30 days
    return new Date(now.getTime() + duration);
  }

  // Get user subscription from subscriptions collection
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const subsRef = collection(db, "subscriptions");
      const q = query(subsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return docSnap.data() as Subscription;
      }

      return null;
    } catch (error) {
      console.error("Error getting user subscription:", error);
      return null;
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    // Grant free access until the end of next year
    const now = new Date();
    const endDate = new Date("2027-01-01");
    if (now < endDate) {
      return true;
    }

    const subscription = await this.getUserSubscription(userId);
    return (
      subscription?.status === "active" &&
      new Date(subscription.endDate) > new Date()
    );
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          subscription: {
            status: "cancelled",
            cancelledAt: serverTimestamp(),
          },
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return false;
    }
  }
}

export const paymentService = PaymentService.getInstance();
