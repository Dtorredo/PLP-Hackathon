import express, { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { AIService } from "./ai.service";
import { RedisService } from "./redis.service";
import { paymentService } from "./payment.service";
// M-Pesa Configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "";
const MPESA_BUSINESS_SHORTCODE = process.env.MPESA_BUSINESS_SHORTCODE || "";

const app = express();
const port = process.env.PORT || 3001;

// Helper function to check if services are available
const requireService = (service: any, serviceName: string) => {
  if (!service) {
    throw new Error(`${serviceName} not available`);
  }
};

// Wrapper functions for endpoints to handle null services
const withAIService = (handler: (aiService: AIService) => Promise<any>) => {
  return async (req: Request, res: Response) => {
    if (!aiService) {
      return res.status(503).json({ error: "AI Service not available" });
    }
    try {
      await handler(aiService);
    } catch (error) {
      console.error("Error in AI service handler:", error);
      res.status(500).json({ error: "Service unavailable" });
    }
  };
};

const withRedisService = (
  handler: (redisService: RedisService) => Promise<any>
) => {
  return async (req: Request, res: Response) => {
    if (!redisService) {
      return res.status(503).json({ error: "Redis Service not available" });
    }
    try {
      await handler(redisService);
    } catch (error) {
      console.error("Error in Redis service handler:", error);
      res.status(500).json({ error: "Service unavailable" });
    }
  };
};

// Initialize services with error handling
let aiService: AIService | null = null;
let redisService: RedisService | null = null;

try {
  aiService = new AIService();
  console.log("AI Service initialized successfully");
} catch (error) {
  console.error("Failed to initialize AI Service:", error);
  console.log("AI Service will be disabled - some features may not work");
}

try {
  redisService = new RedisService();
  console.log("Redis Service initialized successfully");
} catch (error) {
  console.error("Failed to initialize Redis Service:", error);
  console.log("Redis Service will be disabled - some features may not work");
}

console.log(
  `Services status - AI: ${aiService ? "OK" : "FAILED"}, Redis: ${
    redisService ? "OK" : "FAILED"
  }`
);

// Middleware for parsing webhook requests
app.use("/api/v1/payment/webhook", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json());

// Serve static files from the frontend dist directory
app.use(express.static(path.join(__dirname, "frontend")));

// Serve favicon.ico specifically
app.get("/favicon.ico", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "frontend/public/favicon.ico"));
});

// Health check
app.get("/api/v1/status", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint to check static file serving
app.get("/api/v1/debug/static", (req: Request, res: Response) => {
  const frontendPath = path.join(__dirname, "frontend");
  const indexPath = path.join(frontendPath, "index.html");

  res.json({
    frontendPath,
    indexPath,
    frontendExists: fs.existsSync(frontendPath),
    indexExists: fs.existsSync(indexPath),
    currentDir: __dirname,
    files: fs.readdirSync(__dirname),
  });
});

// Ask question endpoint - now with AI
app.post("/api/v1/ask", async (req: Request, res: Response) => {
  try {
    if (!aiService || !redisService) {
      return res.status(503).json({ error: "Services not available" });
    }

    const { sessionId, userId, text, mode = "explain" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Question is required." });
    }

    // Generate AI response
    const response = await aiService.generateResponse(text, mode);

    // Store conversation in Redis
    if (sessionId && userId) {
      await redisService.storeMessage(sessionId, userId, "user", text);
      await redisService.storeMessage(
        sessionId,
        userId,
        "assistant",
        response.answer
      );
    }

    res.json({
      success: true,
      responseId: uuidv4(),
      ...response,
    });
  } catch (error) {
    console.error("Error in /api/v1/ask:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate response. Please try again.",
    });
  }
});

// Quiz endpoints
app.post("/api/v1/quiz/start", async (req: Request, res: Response) => {
  try {
    if (!aiService) {
      return res.status(503).json({ error: "AI Service not available" });
    }

    const { userId, topics = [], count = 5 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const quiz = await aiService.generateQuiz(topics, count);

    res.json({
      success: true,
      quizId: uuidv4(),
      quiz,
    });
  } catch (error) {
    console.error("Error in /api/v1/quiz/start:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate quiz. Please try again.",
    });
  }
});

app.post("/api/v1/quiz/answer", async (req: Request, res: Response) => {
  try {
    const { quizId, questionId, userAnswer } = req.body;

    if (!userAnswer) {
      return res.status(400).json({ error: "Answer is required." });
    }

    if (!aiService) {
      return res.status(503).json({ error: "AI Service not available" });
    }

    const result = await aiService.gradeAnswer(questionId, userAnswer);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in /api/v1/quiz/answer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to grade answer. Please try again.",
    });
  }
});

// Enhanced Study plan generation with AI
app.post("/api/v1/plan/generate", async (req: Request, res: Response) => {
  try {
    if (!aiService || !redisService) {
      return res.status(503).json({ error: "Services not available" });
    }
    const {
      userId,
      dailyHours,
      weakTopics = [],
      preferredTimeSlots = [],
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    if (preferredTimeSlots.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one preferred time slot is required." });
    }

    if (!dailyHours || dailyHours < 2) {
      return res
        .status(400)
        .json({ error: "Daily study hours must be at least 2." });
    }

    if (weakTopics.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one weak topic is required." });
    }

    const plan = await aiService.generateStudyPlan(
      userId,
      dailyHours,
      weakTopics,
      preferredTimeSlots
    );

    console.log("Generated plan:", {
      id: plan.id,
      userId: plan.userId,
      tasksCount: plan.tasks.length,
      createdAt: plan.createdAt,
    });

    // Save the plan to Redis
    const planKey = `study_plan:${userId}:current`;
    await redisService.storeStudyPlan(planKey, plan);

    // Also store in history
    await redisService.storeStudyPlanHistory(userId, plan);

    console.log("Plan saved to Redis with key:", planKey);

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error in /api/v1/plan/generate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate study plan. Please try again.",
    });
  }
});

// Get current study plan
app.get("/api/v1/plan/current/:userId", async (req: Request, res: Response) => {
  try {
    if (!redisService) {
      return res.status(503).json({ error: "Redis Service not available" });
    }
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const planKey = `study_plan:${userId}:current`;
    const plan = await redisService.getStudyPlan(planKey);

    console.log("Retrieving plan for user:", userId);
    console.log("Plan key:", planKey);
    console.log("Plan found:", !!plan);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "No active study plan found.",
      });
    }

    // Check if plan is still valid (within 7 days)
    const planDate = new Date(plan.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor(
      (currentDate.getTime() - planDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference > 7) {
      // Plan is older than 7 days, delete it
      await redisService.deleteStudyPlan(planKey);
      return res.status(404).json({
        success: false,
        error: "Study plan has expired. Please generate a new one.",
      });
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error in /api/v1/plan/current:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve study plan. Please try again.",
    });
  }
});

// Delete current study plan
app.delete(
  "/api/v1/plan/current/:userId",
  async (req: Request, res: Response) => {
    try {
      if (!redisService) {
        return res.status(503).json({ error: "Redis Service not available" });
      }
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const planKey = `study_plan:${userId}:current`;
      await redisService.deleteStudyPlan(planKey);

      res.json({
        success: true,
        message: "Study plan deleted successfully.",
      });
    } catch (error) {
      console.error("Error in /api/v1/plan/delete:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete study plan. Please try again.",
      });
    }
  }
);

// Update study plan progress
app.post("/api/v1/plan/progress", async (req: Request, res: Response) => {
  try {
    if (!redisService) {
      return res.status(503).json({ error: "Redis Service not available" });
    }
    const { userId, planId, taskId, completed } = req.body;

    if (!userId || !planId || !taskId) {
      return res
        .status(400)
        .json({ error: "User ID, Plan ID, and Task ID are required." });
    }

    // Store progress in Redis
    const progressKey = `study_plan:${planId}:${userId}`;
    const progressData = {
      taskId,
      completed,
      timestamp: new Date().toISOString(),
    };

    await redisService.storeProgress(progressKey, progressData);

    // Update the main study plan with progress
    const planKey = `study_plan:${userId}:current`;
    const plan = await redisService.getStudyPlan(planKey);

    if (plan) {
      const updatedTasks = plan.tasks.map((task: any) => {
        if (task.id === taskId) {
          return { ...task, completed };
        }
        return task;
      });

      const completedTasks = updatedTasks
        .filter((task: any) => task.completed)
        .map((task: any) => task.id);

      const weeklyProgress = Math.round(
        (completedTasks.length / updatedTasks.length) * 100
      );

      const updatedPlan = {
        ...plan,
        tasks: updatedTasks,
        completedTasks,
        weeklyProgress,
      };

      await redisService.storeStudyPlan(planKey, updatedPlan);
    }

    res.json({
      success: true,
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Error in /api/v1/plan/progress:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update progress. Please try again.",
    });
  }
});

// Get study plan history
app.get("/api/v1/plan/history/:userId", async (req: Request, res: Response) => {
  try {
    if (!redisService) {
      return res.status(503).json({ error: "Redis Service not available" });
    }
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const history = await redisService.getStudyPlanHistory(userId);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error in /api/v1/plan/history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve study plan history. Please try again.",
    });
  }
});

// Get specific study plan from history
app.get(
  "/api/v1/plan/history/:userId/:planId",
  async (req: Request, res: Response) => {
    try {
      if (!redisService) {
        return res.status(503).json({ error: "Redis Service not available" });
      }
      const { userId, planId } = req.params;

      if (!userId || !planId) {
        return res
          .status(400)
          .json({ error: "User ID and Plan ID are required." });
      }

      const plan = await redisService.getStudyPlanFromHistory(userId, planId);

      if (!plan) {
        return res.status(404).json({
          success: false,
          error: "Study plan not found in history.",
        });
      }

      res.json({
        success: true,
        plan,
      });
    } catch (error) {
      console.error("Error in /api/v1/plan/history/:planId:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve study plan. Please try again.",
      });
    }
  }
);

// Flashcard generation
app.post("/api/v1/flashcards/generate", async (req: Request, res: Response) => {
  try {
    if (!aiService) {
      return res.status(503).json({ error: "AI Service not available" });
    }
    const { topic, count = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const flashcards = await aiService.generateFlashcards(topic, count);

    res.json({
      success: true,
      flashcards,
      topic,
      count: flashcards.length,
    });
  } catch (error) {
    console.error("Error in /api/v1/flashcards/generate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate flashcards. Please try again.",
    });
  }
});

// User feedback
app.post("/api/v1/answer/feedback", async (req: Request, res: Response) => {
  try {
    if (!redisService) {
      return res.status(503).json({ error: "Redis Service not available" });
    }
    const { responseId, userId, isPositive, feedback } = req.body;

    if (!responseId || !userId) {
      return res
        .status(400)
        .json({ error: "Response ID and User ID are required." });
    }

    await redisService.storeFeedback(responseId, userId, isPositive, feedback);

    res.json({ success: true, message: "Feedback recorded successfully." });
  } catch (error) {
    console.error("Error in /api/v1/answer/feedback:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record feedback. Please try again.",
    });
  }
});

// M-Pesa Payment endpoints
app.post(
  "/api/v1/payment/initiate-mpesa",
  async (req: Request, res: Response) => {
    try {
      const { plan, phoneNumber, userId } = req.body;
      console.log(req.body);

      if (!plan || !phoneNumber) {
        return res
          .status(400)
          .json({ error: "Plan and phone number are required" });
      }

      const reference = `AI_STUDY_${Date.now()}`;

      const paymentRequest = {
        phoneNumber: phoneNumber,
        amount: plan.price,
        planId: plan.id,
        userId: userId,
        reference: reference,
      };

      const result = await paymentService.initiateMpesaPayment(paymentRequest);

      if (result.success) {
        res.json({
          success: true,
          checkoutRequestID: result.checkoutRequestID,
          customerMessage: result.customerMessage,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error initiating M-Pesa payment:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  }
);

app.post(
  "/api/v1/payment/mpesa-callback",
  async (req: Request, res: Response) => {
    try {
      console.log("M-Pesa callback received:", req.body);

      const success = await paymentService.handleMpesaCallback(req.body);

      if (success) {
        res.json({ success: true, message: "Payment processed successfully" });
      } else {
        res.status(400).json({ success: false, message: "Payment failed" });
      }
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

app.get(
  "/api/v1/payment/subscription/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const subscription = await paymentService.getUserSubscription(userId);
      const hasActiveSubscription = await paymentService.hasActiveSubscription(
        userId
      );

      res.json({
        success: true,
        subscription,
        hasActiveSubscription,
      });
    } catch (error) {
      console.error("Error in /api/v1/payment/subscription:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get subscription status. Please try again.",
      });
    }
  }
);

app.post(
  "/api/v1/payment/cancel/:userId",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const success = await paymentService.cancelSubscription(userId);

      if (success) {
        res.json({
          success: true,
          message: "Subscription cancelled successfully",
        });
      } else {
        res.status(400).json({ error: "Failed to cancel subscription" });
      }
    } catch (error) {
      console.error("Error in /api/v1/payment/cancel:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel subscription. Please try again.",
      });
    }
  }
);

// Health check endpoint
app.get("/api/v1/status", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Serve the frontend app for all other routes
app.get("*", (req: Request, res: Response) => {
  const indexPath = path.join(__dirname, "frontend/index.html");

  // Check if the file exists
  if (!fs.existsSync(indexPath)) {
    console.error(`Frontend index.html not found at: ${indexPath}`);
    return res.status(404).json({
      error: "Frontend not found",
      path: indexPath,
      currentDir: __dirname,
    });
  }

  res.sendFile(indexPath);
});

// Start server
if (process.env.NODE_ENV !== "test") {
  console.log(`Attempting to start server on port ${port}...`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`M-Pesa Consumer Key length: ${MPESA_CONSUMER_KEY.length}`);

  // Debug: Check if frontend files exist
  const frontendPath = path.join(__dirname, "frontend");
  const indexPath = path.join(frontendPath, "index.html");
  console.log(`Frontend path: ${frontendPath}`);
  console.log(`Index path: ${indexPath}`);
  console.log(`Frontend exists: ${fs.existsSync(frontendPath)}`);
  console.log(`Index exists: ${fs.existsSync(indexPath)}`);

  app
    .listen(Number(port), "0.0.0.0", () => {
      console.log(`AI Study Buddy backend running on http://0.0.0.0:${port}`);
      console.log(`Server started successfully!`);
    })
    .on("error", (error) => {
      console.error(`Failed to start server:`, error);
    });
}
