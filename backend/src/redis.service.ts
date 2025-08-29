import Redis from "ioredis";

export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
    });

    this.redis.on("error", (error: Error) => {
      console.error("Redis connection error:", error);
    });

    this.redis.on("connect", () => {
      console.log("Connected to Redis");
    });
  }

  async storeMessage(
    sessionId: string,
    userId: string,
    role: string,
    content: string
  ): Promise<void> {
    const key = `chat:${sessionId}:${userId}`;
    const message = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.expire(key, 86400); // Expire after 24 hours
  }

  async getMessages(sessionId: string, userId: string): Promise<any[]> {
    const key = `chat:${sessionId}:${userId}`;
    const messages = await this.redis.lrange(key, 0, -1);
    return messages.map((msg: string) => JSON.parse(msg));
  }

  async storeProgress(progressKey: string, progressData: any): Promise<void> {
    await this.redis.set(
      progressKey,
      JSON.stringify(progressData),
      "EX",
      604800 // Expire after 7 days
    );
  }

  async getProgress(progressKey: string): Promise<any | null> {
    const data = await this.redis.get(progressKey);
    return data ? JSON.parse(data) : null;
  }

  async storeFeedback(
    responseId: string,
    userId: string,
    isPositive: boolean,
    feedback?: string
  ): Promise<void> {
    const key = `feedback:${responseId}:${userId}`;
    const feedbackData = {
      isPositive,
      feedback,
      timestamp: new Date().toISOString(),
    };

    await this.redis.set(key, JSON.stringify(feedbackData), "EX", 86400);
  }

  async getFeedback(responseId: string, userId: string): Promise<any | null> {
    const key = `feedback:${responseId}:${userId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Study Plan Methods
  async storeStudyPlan(planKey: string, plan: any): Promise<void> {
    await this.redis.set(
      planKey,
      JSON.stringify(plan),
      "EX",
      604800 // Expire after 7 days (one week)
    );
  }

  async getStudyPlan(planKey: string): Promise<any | null> {
    const data = await this.redis.get(planKey);
    return data ? JSON.parse(data) : null;
  }

  async deleteStudyPlan(planKey: string): Promise<void> {
    await this.redis.del(planKey);
  }

  async updateStudyPlanProgress(
    planKey: string,
    taskId: string,
    completed: boolean
  ): Promise<void> {
    const plan = await this.getStudyPlan(planKey);
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

      await this.storeStudyPlan(planKey, updatedPlan);
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
