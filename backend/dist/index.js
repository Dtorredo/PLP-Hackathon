"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const dotenv = __importStar(require("dotenv"));
const ai_service_1 = require("./ai.service");
const redis_service_1 = require("./redis.service");
dotenv.config();
exports.app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Initialize services
const aiService = new ai_service_1.AIService();
const redisService = new redis_service_1.RedisService();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Health check
exports.app.get('/api/v1/status', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Ask question endpoint
exports.app.post('/api/v1/ask', async (req, res) => {
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
            responseId: (0, uuid_1.v4)(),
            ...response
        });
    }
    catch (error) {
        console.error('Error in /api/v1/ask:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate response. Please try again.'
        });
    }
});
// Quiz endpoints
exports.app.post('/api/v1/quiz/start', async (req, res) => {
    try {
        const { userId, topics = [], count = 5 } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        const quiz = await aiService.generateQuiz(topics, count);
        res.json({
            success: true,
            quizId: (0, uuid_1.v4)(),
            quiz
        });
    }
    catch (error) {
        console.error('Error in /api/v1/quiz/start:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz. Please try again.'
        });
    }
});
exports.app.post('/api/v1/quiz/answer', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error in /api/v1/quiz/answer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to grade answer. Please try again.'
        });
    }
});
// Study plan generation
exports.app.post('/api/v1/plan/generate', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error in /api/v1/plan/generate:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate study plan. Please try again.'
        });
    }
});
// User feedback
exports.app.post('/api/v1/answer/feedback', async (req, res) => {
    try {
        const { responseId, userId, isPositive, feedback } = req.body;
        if (!responseId || !userId) {
            return res.status(400).json({ error: 'Response ID and User ID are required.' });
        }
        await redisService.storeFeedback(responseId, userId, isPositive, feedback);
        res.json({ success: true, message: 'Feedback recorded successfully.' });
    }
    catch (error) {
        console.error('Error in /api/v1/answer/feedback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record feedback. Please try again.'
        });
    }
});
// Start server
if (process.env.NODE_ENV !== 'test') {
    exports.app.listen(port, () => {
        console.log(`AI Study Buddy backend running on http://localhost:${port}`);
    });
}
