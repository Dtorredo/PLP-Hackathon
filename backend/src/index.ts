import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { AIService } from './ai.service';
import { RedisService } from './redis.service';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3001;

// Initialize services
const aiService = new AIService();
const redisService = new RedisService();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ask question endpoint
app.post('/api/v1/ask', async (req: Request, res: Response) => {
  try {
    const { sessionId, userId, text, mode = 'explain' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    // Generate response using free AI model
    const response = await aiService.generateResponse(text, mode);
    
    // Store conversation in Redis
    if (sessionId && userId) {
      await redisService.storeMessage(sessionId, userId, 'user', text);
      await redisService.storeMessage(sessionId, userId, 'assistant', response.answer);
    }

    res.json({
      success: true,
      responseId: uuidv4(),
      ...response
    });
  } catch (error) {
    console.error('Error in /api/v1/ask:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate response. Please try again.' 
    });
  }
});

// Quiz endpoints
app.post('/api/v1/quiz/start', async (req: Request, res: Response) => {
  try {
    const { userId, topics = [], count = 5 } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const quiz = await aiService.generateQuiz(topics, count);
    
    res.json({
      success: true,
      quizId: uuidv4(),
      quiz
    });
  } catch (error) {
    console.error('Error in /api/v1/quiz/start:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate quiz. Please try again.' 
    });
  }
});

app.post('/api/v1/quiz/answer', async (req: Request, res: Response) => {
  try {
    const { quizId, questionId, userAnswer } = req.body;
    
    if (!userAnswer) {
      return res.status(400).json({ error: 'Answer is required.' });
    }

    const result = await aiService.gradeAnswer(questionId, userAnswer);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in /api/v1/quiz/answer:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to grade answer. Please try again.' 
    });
  }
});

// Study plan generation
app.post('/api/v1/plan/generate', async (req: Request, res: Response) => {
  try {
    const { userId, timeframeDays = 7 } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const plan = await aiService.generateStudyPlan(userId, timeframeDays);
    
    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Error in /api/v1/plan/generate:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate study plan. Please try again.' 
    });
  }
});

// Flashcard generation
app.post('/api/v1/flashcards/generate', async (req: Request, res: Response) => {
  try {
    const { topic, count = 5 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const flashcards = await aiService.generateFlashcards(topic, count);
    
    res.json({
      success: true,
      flashcards,
      topic,
      count: flashcards.length
    });
  } catch (error) {
    console.error('Error in /api/v1/flashcards/generate:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate flashcards. Please try again.' 
    });
  }
});

// User feedback
app.post('/api/v1/answer/feedback', async (req: Request, res: Response) => {
  try {
    const { responseId, userId, isPositive, feedback } = req.body;
    
    if (!responseId || !userId) {
      return res.status(400).json({ error: 'Response ID and User ID are required.' });
    }

    await redisService.storeFeedback(responseId, userId, isPositive, feedback);
    
    res.json({ success: true, message: 'Feedback recorded successfully.' });
  } catch (error) {
    console.error('Error in /api/v1/answer/feedback:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to record feedback. Please try again.' 
    });
  }
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`AI Study Buddy backend running on http://localhost:${port}`);
  });
}
