import fetch from "node-fetch";

export class RedisService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl =
      process.env.UPSTASH_REDIS_REST_URL ||
      "https://peaceful-corgi-9538.upstash.io";
    this.token =
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      "ASVCAAImcDE3YTQyZTgwYTY4MGI0M2U0ODQyYjY5ZGJjYjY3Y2VlZHAxOTUzOA";

    console.log("Redis service initialized with Upstash REST API");
  }

  private async makeRequest(
    command: string,
    key: string,
    value?: string,
    expiry?: number
  ): Promise<any> {
    const url = `${this.baseUrl}/${command}/${key}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };

    if (value !== undefined) {
      headers["Content-Type"] = "text/plain";
    }

    try {
      if (command === "get") {
        const response = await fetch(url, { headers });
        if (response.status === 404) return null;
        return await response.text();
      } else if (command === "set") {
        const setUrl = `${this.baseUrl}/set/${key}`;
        const body = value || "";
        const response = await fetch(setUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
          body,
        });
        return response.ok;
      } else if (command === "lpush") {
        const lpushUrl = `${this.baseUrl}/lpush/${key}`;
        const body = value || "";
        const response = await fetch(lpushUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
          body,
        });
        return response.ok;
      } else if (command === "lrange") {
        const response = await fetch(url, { headers });
        if (response.status === 404) return [];
        const data = await response.json();
        return data.result || [];
      } else if (command === "del") {
        // Upstash REST API uses POST for delete operations
        const delUrl = `${this.baseUrl}/del/${key}`;
        const response = await fetch(delUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
        });
        return response.ok;
      }
    } catch (error) {
      console.error(`Redis ${command} error:`, error);
      return null;
    }
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

    await this.makeRequest("lpush", key, JSON.stringify(message));
    // Note: Upstash REST API doesn't support direct expiry, but data is automatically managed
  }

  async getMessages(sessionId: string, userId: string): Promise<any[]> {
    const key = `chat:${sessionId}:${userId}`;
    const messages = await this.makeRequest("lrange", key);
    return messages.map((msg: string) => JSON.parse(msg));
  }

  async storeProgress(progressKey: string, progressData: any): Promise<void> {
    await this.makeRequest("set", progressKey, JSON.stringify(progressData));
  }

  async getProgress(progressKey: string): Promise<any | null> {
    const data = await this.makeRequest("get", progressKey);
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

    await this.makeRequest("set", key, JSON.stringify(feedbackData));
  }

  async getFeedback(responseId: string, userId: string): Promise<any | null> {
    const key = `feedback:${responseId}:${userId}`;
    const data = await this.makeRequest("get", key);
    return data ? JSON.parse(data) : null;
  }

  // Study Plan Methods
  async storeStudyPlan(planKey: string, plan: any): Promise<void> {
    await this.makeRequest("set", planKey, JSON.stringify(plan));
  }

  async getStudyPlan(planKey: string): Promise<any | null> {
    const data = await this.makeRequest("get", planKey);
    return data ? JSON.parse(data) : null;
  }

  async deleteStudyPlan(planKey: string): Promise<void> {
    await this.makeRequest("del", planKey);
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
    // No connection to close with REST API
    console.log("Redis service closed");
  }
}
