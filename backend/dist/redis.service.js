"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
// Mock Redis service for development - replace with actual Redis implementation
class RedisService {
    constructor() {
        this.storage = new Map();
    }
    async storeMessage(sessionId, userId, role, content) {
        const key = `session:${sessionId}:messages`;
        const messages = this.storage.get(key) || [];
        messages.push({
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date().toISOString()
        });
        this.storage.set(key, messages);
    }
    async storeFeedback(responseId, userId, isPositive, feedback) {
        const key = `feedback:${responseId}`;
        this.storage.set(key, {
            responseId,
            userId,
            isPositive,
            feedback,
            timestamp: new Date().toISOString()
        });
    }
    async getUserProfile(userId) {
        const key = `user:${userId}:profile`;
        return this.storage.get(key) || null;
    }
    async updateUserProfile(userId, profile) {
        const key = `user:${userId}:profile`;
        this.storage.set(key, profile);
    }
    async getSessionMessages(sessionId) {
        const key = `session:${sessionId}:messages`;
        return this.storage.get(key) || [];
    }
    async clearSession(sessionId) {
        const key = `session:${sessionId}:messages`;
        this.storage.delete(key);
    }
}
exports.RedisService = RedisService;
