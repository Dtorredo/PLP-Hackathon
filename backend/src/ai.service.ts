interface AIResponse {
  answer: string;
  explanation: string;
  practice: string[];
  sources: any[];
  confidence: number;
}

interface StudyPlanTask {
  id: string;
  day: number;
  timeSlot: string;
  duration: number; // in minutes
  topic: string;
  activity: string;
  description: string;
  completed: boolean;
  estimatedTime: number;
}

interface StudyPlan {
  id: string;
  userId: string;
  dailyHours: number;
  weakTopics: string[];
  tasks: StudyPlanTask[];
  createdAt: Date;
  completedTasks: string[];
  weeklyProgress: number;
  badges: string[];
}

import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIService {
  private readonly genAI: GoogleGenerativeAI | null = null;
  private readonly modelId: string = "gemini-2.5-flash";
  private readonly fallbackResponses = {
    "chain rule": {
      answer:
        "The chain rule is a fundamental theorem in calculus that allows us to find the derivative of composite functions.",
      explanation:
        "If f(x) = g(h(x)), then f'(x) = g'(h(x)) · h'(x). This rule is essential for differentiating complex functions.",
      practice: [
        "Find the derivative of f(x) = (x² + 1)³",
        "Differentiate g(x) = sin(x²)",
        "Calculate the derivative of h(x) = e^(2x + 1)",
      ],
      confidence: 0.9,
    },
    derivative: {
      answer:
        "A derivative represents the rate of change of a function with respect to its variable.",
      explanation:
        "The derivative f'(x) gives us the slope of the tangent line to the function f(x) at any point x.",
      practice: [
        "Find the derivative of f(x) = x³",
        "Calculate the derivative of g(x) = 2x + 5",
        "Find the derivative of h(x) = 1/x",
      ],
      confidence: 0.9,
    },
    quadratic: {
      answer:
        "A quadratic equation is a second-degree polynomial equation in the form ax² + bx + c = 0.",
      explanation:
        "Quadratic equations can be solved using factoring, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.",
      practice: [
        "Solve x² - 5x + 6 = 0",
        "Find the roots of 2x² + 7x + 3 = 0",
        "Solve x² + 4x + 4 = 0",
      ],
      confidence: 0.9,
    },
  };

  constructor() {
    const apiKey =
      process.env.GEMINI_API_KEY || "AIzaSyAjmbLFqxETp-xrYyCZHwJ0nx6YlE-g3Jw";
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateResponse(
    question: string,
    mode: string = "explain"
  ): Promise<AIResponse> {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("chain rule")) {
      const response = this.fallbackResponses["chain rule"];
      return {
        ...response,
        sources: this.generateSources("chain rule"),
      };
    }

    if (lowerQuestion.includes("derivative")) {
      const response = this.fallbackResponses["derivative"];
      return {
        ...response,
        sources: this.generateSources("derivative"),
      };
    }

    if (
      lowerQuestion.includes("quadratic") ||
      lowerQuestion.includes("solve")
    ) {
      const response = this.fallbackResponses["quadratic"];
      return {
        ...response,
        sources: this.generateSources("quadratic"),
      };
    }

    // If Gemini is configured, call Gemini text generation
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.modelId });
        const prompt = this.buildPrompt(question, mode);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answerText =
          response.text().trim() || "I could not generate a response.";

        return {
          answer: answerText,
          explanation:
            this.extractSection(answerText, "Explanation") || answerText,
          practice: this.extractPractice(answerText),
          sources: this.generateSources(question),
          confidence: 0.85,
        };
      } catch (error) {
        console.error("Gemini generation failed, falling back:", error);
      }
    }

    // Fallback static response when Gemini is not configured or fails
    return {
      answer:
        "I understand you're asking about this topic. Let me provide you with a helpful explanation.",
      explanation:
        "This is a comprehensive explanation of the concept you asked about. I recommend reviewing the fundamentals and practicing with similar problems.",
      practice: [
        "Review the basic concepts",
        "Practice with similar problems",
        "Take a quiz to test your understanding",
      ],
      sources: this.generateSources(question),
      confidence: 0.7,
    };
  }

  private generateSources(question: string): any[] {
    return [
      {
        docId: "general-knowledge",
        title: "Educational Resources",
        snippet: "Comprehensive study materials and explanations",
        sourceUrl: "#",
      },
    ];
  }

  private buildPrompt(question: string, mode: string): string {
    return `You are an AI study buddy. Mode: ${mode}.
Question: ${question}

Please respond with:
- A concise answer.
- A short explanation section labeled "Explanation:".
- 3 short practice steps labeled "Practice:" as a bulleted list.`;
  }

  private extractSection(text: string, sectionLabel: string): string | null {
    const regex = new RegExp(`${sectionLabel}[:\n]+([\\s\\S]*)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractPractice(text: string): string[] {
    const practiceLabelIndex = text.toLowerCase().indexOf("practice");
    if (practiceLabelIndex === -1)
      return [
        "Review the basic concepts",
        "Practice with similar problems",
        "Take a quiz to test your understanding",
      ];
    const lines = text.slice(practiceLabelIndex).split("\n");
    const items = lines
      .map((l) => l.replace(/^[-*\d\.\)\s]+/, "").trim())
      .filter((l) => l.length > 0)
      .slice(0, 3);
    return items.length > 0
      ? items
      : [
          "Review the basic concepts",
          "Practice with similar problems",
          "Take a quiz to test your understanding",
        ];
  }

  async generateQuiz(topics: string[], count: number): Promise<any[]> {
    return [
      {
        id: "calc-1",
        question: "What is the derivative of x²?",
        answer: "2x",
        explanation: "Using the power rule: d/dx(x^n) = n·x^(n-1)",
        topic: "calculus",
      },
      {
        id: "calc-2",
        question: "What is the integral of 2x?",
        answer: "x² + C",
        explanation:
          "The integral of 2x is x² + C, where C is the constant of integration",
        topic: "calculus",
      },
      {
        id: "alg-1",
        question: "Solve for x: 2x + 5 = 13",
        answer: "4",
        explanation:
          "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
        topic: "algebra",
      },
    ].slice(0, count);
  }

  async gradeAnswer(questionId: string, userAnswer: string): Promise<any> {
    const questions = await this.generateQuiz([], 3);
    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return { correct: false, explanation: "Question not found", newScore: 0 };
    }

    const isCorrect =
      userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();

    return {
      correct: isCorrect,
      explanation: question.explanation,
      newScore: isCorrect ? 10 : 0,
    };
  }

  async generateStudyPlan(
    userId: string,
    dailyHours: number,
    weakTopics: string[]
  ): Promise<StudyPlan> {
    if (dailyHours < 2) {
      throw new Error("Daily study hours must be at least 2");
    }

    const totalMinutes = dailyHours * 60;
    const tasks: StudyPlanTask[] = [];
    let remainingMinutes = totalMinutes;

    // Generate AI-powered study plan
    if (this.genAI && weakTopics.length > 0) {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.modelId });
        const prompt = `Create a detailed 7-day study plan for a student who can study ${dailyHours} hours per day. 
        
Weak topics to focus on: ${weakTopics.join(", ")}
        
Generate a structured plan with:
- Distribute topics across the week (don't put all topics in one day)
- Time slots throughout the day (morning, afternoon, evening)
- Activities of 20-30 minutes each
- Mix of review, practice, and new learning
- Specific tasks for each time slot
- Progressive difficulty
- Each topic should appear on different days throughout the week

Format as JSON with tasks array containing: day, timeSlot, duration, topic, activity, description`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const planText = response.text().trim();

        // Try to parse AI response, fallback to default if it fails
        try {
          const aiPlan = JSON.parse(planText);
          if (aiPlan.tasks && Array.isArray(aiPlan.tasks)) {
            return {
              id: Date.now().toString(),
              userId,
              dailyHours,
              weakTopics,
              tasks: aiPlan.tasks.map((task: any, index: number) => ({
                id: `task-${index}`,
                day: task.day || Math.floor(index / 3) + 1,
                timeSlot: task.timeSlot || "Morning",
                duration: task.duration || 30,
                topic: task.topic || weakTopics[0],
                activity: task.activity || "Study session",
                description: task.description || "Review and practice",
                completed: false,
                estimatedTime: task.duration || 30,
              })),
              createdAt: new Date(),
              completedTasks: [],
              weeklyProgress: 0,
              badges: [],
            };
          }
        } catch (parseError) {
          console.error("Failed to parse AI study plan:", parseError);
        }
      } catch (error) {
        console.error("AI study plan generation failed:", error);
      }
    }

    // Fallback: Generate default study plan with distributed topics
    const timeSlots = ["Morning", "Afternoon", "Evening"];
    const activities = [
      "Review concepts",
      "Practice problems",
      "Take practice quiz",
      "Read textbook",
      "Watch educational videos",
      "Create flashcards",
      "Solve exercises",
      "Group study session",
    ];

    // Distribute topics across the week
    const topicDistribution = this.distributeTopicsAcrossWeek(weakTopics);

    for (let day = 1; day <= 7; day++) {
      let dayMinutes = 0;
      const maxDayMinutes = Math.min(remainingMinutes, totalMinutes);
      const dayTopics = topicDistribution[day - 1] || [];

      while (dayMinutes < maxDayMinutes && dayTopics.length > 0) {
        const duration = Math.min(
          30,
          Math.max(20, Math.floor(Math.random() * 20) + 20)
        );
        const timeSlot =
          timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const topic = dayTopics[Math.floor(Math.random() * dayTopics.length)];
        const activity =
          activities[Math.floor(Math.random() * activities.length)];

        tasks.push({
          id: `task-${tasks.length}`,
          day,
          timeSlot,
          duration,
          topic,
          activity,
          description: `${activity} for ${topic}`,
          completed: false,
          estimatedTime: duration,
        });

        dayMinutes += duration;
        remainingMinutes -= duration;

        if (remainingMinutes <= 0) break;
      }

      if (remainingMinutes <= 0) break;
    }

    return {
      id: Date.now().toString(),
      userId,
      dailyHours,
      weakTopics,
      tasks,
      createdAt: new Date(),
      completedTasks: [],
      weeklyProgress: 0,
      badges: [],
    };
  }

  private distributeTopicsAcrossWeek(topics: string[]): string[][] {
    const distribution: string[][] = [];

    // Initialize 7 days
    for (let i = 0; i < 7; i++) {
      distribution[i] = [];
    }

    // Distribute topics across the week
    topics.forEach((topic, index) => {
      // Spread topics across different days
      const dayIndex = index % 7;
      distribution[dayIndex].push(topic);
    });

    // Ensure each day has at least one topic if possible
    for (let day = 0; day < 7; day++) {
      if (distribution[day].length === 0 && topics.length > 0) {
        // Find a topic that appears less frequently
        const topicFrequency = new Map<string, number>();
        distribution.forEach((dayTopics) => {
          dayTopics.forEach((topic) => {
            topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + 1);
          });
        });

        const leastFrequentTopic = topics.reduce((least, current) => {
          const leastFreq = topicFrequency.get(least) || 0;
          const currentFreq = topicFrequency.get(current) || 0;
          return currentFreq < leastFreq ? current : least;
        });

        distribution[day].push(leastFrequentTopic);
      }
    }

    return distribution;
  }

  // Replace existing generateFlashcards with this version
  async generateFlashcards(topic: string, count: number = 5): Promise<any[]> {
    const topicLower = topic.toLowerCase();

    // If Gemini client not configured, skip straight to fallback
    if (!this.genAI) {
      return this.getFallbackFlashcards(topic, count);
    }

    const prompt = `Generate ${count} educational flashcards about ${topic}.
Format each as: "Question: [question] Answer: [answer]"
Make them progressively harder, covering fundamentals to advanced concepts.`;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelId });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const answerText = response.text().trim() || "";
      return this.parseFlashcardsFromAI(answerText, topic, count);
    } catch (error) {
      console.error("Gemini flashcard generation failed:", error);
      return this.getFallbackFlashcards(topic, count);
    }
  }

  private parseFlashcardsFromAI(
    aiText: string,
    topic: string,
    count: number
  ): any[] {
    console.log(
      "--- Raw AI Response ---\n",
      aiText,
      "\n-------------------------"
    );
    const flashcards = [];
    const lines = aiText.split("\n");
    let currentQuestion = "";
    let currentAnswer = "";

    for (const line of lines) {
      const qMatch = line.match(/question:(.*)/i);
      const aMatch = line.match(/answer:(.*)/i);

      if (qMatch) {
        if (currentQuestion && currentAnswer) {
          flashcards.push({
            id: flashcards.length + 1,
            question: currentQuestion.trim(),
            answer: currentAnswer.trim(),
            topic: topic,
          });
          if (flashcards.length >= count) break;
        }
        currentQuestion = qMatch[1].trim();
        currentAnswer = "";
      } else if (aMatch) {
        currentAnswer = aMatch[1].trim();
      }
    }

    if (currentQuestion && currentAnswer && flashcards.length < count) {
      flashcards.push({
        id: flashcards.length + 1,
        question: currentQuestion.trim(),
        answer: currentAnswer.trim(),
        topic: topic,
      });
    }

    if (flashcards.length === 0) {
      console.log(
        "Parsing AI response failed to produce flashcards. Falling back."
      );
      return this.getFallbackFlashcards(topic, count);
    }

    return flashcards;
  }

  private getFallbackFlashcards(topic: string, count: number): any[] {
    const fallbackCards: Record<
      | "calculus"
      | "algebra"
      | "physics"
      | "chemistry"
      | "biology"
      | "computer science",
      { question: string; answer: string }[]
    > = {
      calculus: [
        { question: "What is the derivative of x²?", answer: "2x" },
        {
          question: "What does the chain rule state?",
          answer: "If f(x) = g(h(x)), then f'x) = g'h(x)) · h'x)",
        },
        { question: "What is the integral of 2x?", answer: "x² + C" },
        { question: "What is the derivative of sin(x)?", answer: "cos(x)" },
        {
          question: "What is the power rule for derivatives?",
          answer: "d/dx(x^n) = n·x^(n-1)",
        },
      ],
      algebra: [
        {
          question: "What is the quadratic formula?",
          answer: "x = (-b ± √(b² - 4ac)) / 2a",
        },
        {
          question: "How do you solve 2x + 5 = 13?",
          answer: "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4",
        },
        {
          question: "What is factoring?",
          answer: "Breaking down a polynomial into simpler factors",
        },
        {
          question: "What is the slope-intercept form?",
          answer: "y = mx + b",
        },
        {
          question: "How do you find the slope between two points?",
          answer: "m = (y₂ - y₁) / (x₂ - x₁)",
        },
      ],
      physics: [
        {
          question: "What is Newton's First Law?",
          answer:
            "An object at rest stays at rest unless acted upon by an external force",
        },
        {
          question: "What is the formula for kinetic energy?",
          answer: "KE = ½mv²",
        },
        {
          question: "What is acceleration?",
          answer: "Rate of change of velocity with respect to time",
        },
        {
          question: "What is the law of conservation of energy?",
          answer: "Energy cannot be created or destroyed, only transformed",
        },
        { question: "What is the formula for force?", answer: "F = ma" },
      ],
      chemistry: [
        {
          question: "What is the chemical symbol for water?",
          answer: "H₂O",
        },
        { question: "What is the atomic number of carbon?", answer: "6" },
        {
          question: "What is a molecule?",
          answer: "Two or more atoms bonded together",
        },
        { question: "What is the pH scale range?", answer: "0 to 14" },
        {
          question: "What is a chemical reaction?",
          answer:
            "Process where substances are transformed into new substances",
        },
      ],
      biology: [
        {
          question: "What is the powerhouse of the cell?",
          answer: "Mitochondria",
        },
        {
          question: "What is DNA?",
          answer: "Deoxyribonucleic acid, the genetic material",
        },
        {
          question: "What is photosynthesis?",
          answer: "Process where plants convert sunlight into energy",
        },
        {
          question: "What is evolution?",
          answer: "Change in species over time through natural selection",
        },
        {
          question: "What is homeostasis?",
          answer: "Maintenance of stable internal conditions",
        },
      ],
      "computer science": [
        {
          question: "What is an algorithm?",
          answer: "A step-by-step procedure for solving a problem",
        },
        {
          question: "What is a variable?",
          answer: "A container for storing data values",
        },
        {
          question: "What is a function?",
          answer: "A reusable block of code that performs a specific task",
        },
        { question: "What is recursion?", answer: "A function calling itself" },
        {
          question: "What is object-oriented programming?",
          answer:
            "Programming paradigm based on objects containing data and code",
        },
      ],
    };

    const topicKey = (
      Object.keys(fallbackCards) as Array<keyof typeof fallbackCards>
    ).find((key) => topic.toLowerCase().includes(String(key).toLowerCase()));

    if (!topicKey) {
      return [
        {
          id: 1,
          question: `No fallback cards for "${topic}"`,
          answer:
            "The AI failed to generate cards for this topic, and no static fallback exists. Please try a different topic.",
          topic: topic,
        },
      ];
    }

    return fallbackCards[topicKey]
      .slice(0, count)
      .map((card: { question: string; answer: string }, index: number) => ({
        id: index + 1,
        question: card.question,
        answer: card.answer,
        topic: topic,
      }));
  }
}
