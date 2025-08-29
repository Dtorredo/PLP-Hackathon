import express, { Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";
import { AIService } from "./ai.service";
import { RedisService } from "./redis.service";

dotenv.config();

export const app = express();
const port = process.env.PORT || 3001;

// Initialize services
const aiService = new AIService();
const redisService = new RedisService();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/v1/status", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Ask question endpoint - now with AI
app.post("/api/v1/ask", async (req: Request, res: Response) => {
  try {
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
    const { userId, dailyHours, weakTopics = [] } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
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
      weakTopics
    );

    // Save the plan to Redis
    const planKey = `study_plan:${userId}:current`;
    await redisService.storeStudyPlan(planKey, plan);

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
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const planKey = `study_plan:${userId}:current`;
    const plan = await redisService.getStudyPlan(planKey);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "No active study plan found.",
      });
    }

    // Check if plan is still valid (within the same week)
    const planDate = new Date(plan.createdAt);
    const currentDate = new Date();
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const planWeekStart = new Date(planDate);
    planWeekStart.setDate(planDate.getDate() - planDate.getDay() + 1); // Monday
    planWeekStart.setHours(0, 0, 0, 0);

    if (planWeekStart.getTime() !== weekStart.getTime()) {
      // Plan is from a different week, delete it
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

// Flashcard generation
app.post("/api/v1/flashcards/generate", async (req: Request, res: Response) => {
  try {
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

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`AI Study Buddy backend running on http://localhost:${port}`);
  });
}
