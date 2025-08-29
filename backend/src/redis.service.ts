// Mock Redis service for development - replace with actual Redis implementation
export class RedisService {
  private storage: Map<string, any> = new Map();

  async storeMessage(sessionId: string, userId: string, role: string, content: string): Promise<void> {
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

  async storeFeedback(responseId: string, userId: string, isPositive: boolean, feedback?: string): Promise<void> {
    const key = `feedback:${responseId}`;
    this.storage.set(key, {
      responseId,
      userId,
      isPositive,
      feedback,
      timestamp: new Date().toISOString()
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    const key = `user:${userId}:profile`;
    return this.storage.get(key) || null;
  }

  async updateUserProfile(userId: string, profile: any): Promise<void> {
    const key = `user:${userId}:profile`;
    this.storage.set(key, profile);
  }

  async getSessionMessages(sessionId: string): Promise<any[]> {
    const key = `session:${sessionId}:messages`;
    return this.storage.get(key) || [];
  }

  async clearSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}:messages`;
    this.storage.delete(key);
  }
}
