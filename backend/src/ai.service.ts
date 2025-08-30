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
  isFlashcardTask?: boolean;
}

interface StudyPlan {
  id: string;
  userId: string;
  dailyHours: number;
  weakTopics: string[];
  preferredTimeSlots: string[];
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

Please respond in a clear, structured format:

**Concise Answer:**
[Provide a brief, direct answer to the question]

**Explanation:**
[Give a detailed explanation of the concept, breaking it down into understandable parts]

**Practice:**
- [First practice activity or exercise]
- [Second practice activity or exercise] 
- [Third practice activity or exercise]

Make sure to use proper markdown formatting with **bold** headers and bullet points for the practice section.`;
  }

  private extractSection(text: string, sectionLabel: string): string | null {
    // Handle both "Explanation:" and "**Explanation:**" formats
    const regex = new RegExp(
      `\\*\\*${sectionLabel}\\*\\*[:\n]+([\\s\\S]*?)(?=\\*\\*|$)`,
      "i"
    );
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractPractice(text: string): string[] {
    // Look for the Practice section with markdown formatting
    const practiceRegex = /\*\*Practice:\*\*[\s\S]*?(- [^\n]+(?:\n|$))+/i;
    const match = text.match(practiceRegex);

    if (match) {
      const practiceSection = match[0];
      const items = practiceSection
        .split("\n")
        .map((line) => line.replace(/^[-*\d\.\)\s]+/, "").trim())
        .filter((line) => line.length > 0 && !line.includes("**Practice:**"))
        .slice(0, 3);

      return items.length > 0 ? items : this.getDefaultPractice();
    }

    return this.getDefaultPractice();
  }

  private getDefaultPractice(): string[] {
    return [
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
    weakTopics: string[],
    preferredTimeSlots: string[]
  ): Promise<StudyPlan> {
    if (dailyHours < 2) {
      throw new Error("Daily study hours must be at least 2");
    }

    // Generate AI-powered study plan with one topic per day
    if (this.genAI && weakTopics.length > 0) {
      try {
        const model = this.genAI.getGenerativeModel({ model: this.modelId });

        // Enhanced prompt for better topic distribution
        const prompt = `Create a 5-day study plan (Monday-Friday) for ${dailyHours} hours daily. 
        
Topics to focus on: ${weakTopics.join(", ")}
Available time slots: ${preferredTimeSlots.join(", ")}

Rules:
- Assign ONE topic per day (no mixing different subjects)
- Break each topic into 3-4 subtopics for that day
- Use only the provided time slots: ${preferredTimeSlots.join(", ")}
- Each session: 20-30 minutes
- Add a "Flashcard Review" task at the end of each day
- Distribute topics evenly across the 5 weekdays

Format: JSON with tasks array containing: day (1-5), timeSlot, duration (20-30), topic, activity, description, isFlashcardTask (boolean)`;

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
              preferredTimeSlots,
              tasks: aiPlan.tasks.map((task: any, index: number) => ({
                id: `task-${index}`,
                day: task.day || Math.floor(index / 3) + 1,
                timeSlot: task.timeSlot || preferredTimeSlots[0],
                duration: task.duration || 30,
                topic: task.topic || weakTopics[0],
                activity: task.activity || "Study session",
                description: task.description || "Review and practice",
                completed: false,
                estimatedTime: task.duration || 30,
                isFlashcardTask: task.isFlashcardTask || false,
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

    // Fallback: Generate default study plan with one topic per day
    const totalMinutes = dailyHours * 60;
    const tasks: StudyPlanTask[] = [];

    const activities = [
      "Review concepts",
      "Practice problems",
      "Take practice quiz",
      "Read textbook",
      "Watch educational videos",
      "Solve exercises",
      "Group study session",
    ];

    // Assign one topic per day (5 weekdays)
    const topicsPerDay = this.assignOneTopicPerDay(weakTopics);

    for (let day = 1; day <= 5; day++) {
      const dayTopic = topicsPerDay[day - 1];
      if (!dayTopic) continue;

      let dayMinutes = 0;
      const maxDayMinutes = totalMinutes;

      // Create 3-4 subtopics for the day
      const subtopics = this.generateSubtopics(dayTopic);

      // Add regular study sessions
      for (let i = 0; i < subtopics.length && dayMinutes < maxDayMinutes; i++) {
        const duration = Math.min(
          30,
          Math.max(20, Math.floor(Math.random() * 20) + 20)
        );
        const timeSlot = preferredTimeSlots[i % preferredTimeSlots.length];
        const activity =
          activities[Math.floor(Math.random() * activities.length)];

        tasks.push({
          id: `task-${tasks.length}`,
          day,
          timeSlot,
          duration,
          topic: dayTopic,
          activity,
          description: `${activity}: ${subtopics[i]}`,
          completed: false,
          estimatedTime: duration,
          isFlashcardTask: false,
        });

        dayMinutes += duration;
      }

      // Add flashcard review task at the end of the day
      if (dayMinutes < maxDayMinutes) {
        const flashcardDuration = Math.min(30, maxDayMinutes - dayMinutes);
        const lastTimeSlot = preferredTimeSlots[preferredTimeSlots.length - 1];

        tasks.push({
          id: `task-${tasks.length}`,
          day,
          timeSlot: lastTimeSlot,
          duration: flashcardDuration,
          topic: dayTopic,
          activity: "Flashcard Review",
          description: `Generate flashcards for: ${dayTopic} - ${subtopics.join(
            ", "
          )}`,
          completed: false,
          estimatedTime: flashcardDuration,
          isFlashcardTask: true,
        });
      }
    }

    return {
      id: Date.now().toString(),
      userId,
      dailyHours,
      weakTopics,
      preferredTimeSlots,
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

  private assignOneTopicPerDay(topics: string[]): string[] {
    const topicsPerDay: string[] = [];

    // Initialize 5 weekdays
    for (let i = 0; i < 5; i++) {
      topicsPerDay[i] = "";
    }

    // Assign one topic per day, cycling through topics if needed
    topics.forEach((topic, index) => {
      const dayIndex = index % 5;
      topicsPerDay[dayIndex] = topic;
    });

    // If we have fewer topics than days, repeat the last topic
    if (topics.length < 5) {
      for (let day = topics.length; day < 5; day++) {
        topicsPerDay[day] = topics[topics.length - 1];
      }
    }

    return topicsPerDay;
  }

  private generateSubtopics(topic: string): string[] {
    const subtopicMap: { [key: string]: string[] } = {
      DSA: [
        "Arrays and Strings",
        "Linked Lists",
        "Stacks and Queues",
        "Trees and Graphs",
        "Dynamic Programming",
        "Sorting Algorithms",
      ],
      DBMS: [
        "Database Design",
        "SQL Queries",
        "Normalization",
        "Indexing",
        "Transaction Management",
        "ACID Properties",
      ],
      Calculus: [
        "Limits and Continuity",
        "Derivatives",
        "Integration",
        "Applications of Derivatives",
        "Series and Sequences",
        "Multivariable Calculus",
      ],
      Chemistry: [
        "Atomic Structure",
        "Chemical Bonding",
        "Reaction Kinetics",
        "Thermodynamics",
        "Organic Chemistry",
        "Electrochemistry",
      ],
      Physics: [
        "Mechanics",
        "Thermodynamics",
        "Electromagnetism",
        "Optics",
        "Modern Physics",
        "Wave Motion",
      ],
    };

    return (
      subtopicMap[topic] || [
        "Fundamental Concepts",
        "Core Principles",
        "Advanced Topics",
        "Practical Applications",
      ]
    );
  }

  private distributeTopicsAcrossWeekdays(topics: string[]): string[][] {
    const distribution: string[][] = [];

    // Initialize 5 weekdays only
    for (let i = 0; i < 5; i++) {
      distribution[i] = [];
    }

    // Distribute topics across weekdays only
    topics.forEach((topic, index) => {
      // Spread topics across different weekdays
      const dayIndex = index % 5;
      distribution[dayIndex].push(topic);
    });

    // Ensure each weekday has at least one topic if possible
    for (let day = 0; day < 5; day++) {
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
If the answer contains a code sample, format it using Markdown (e.g., \`\`\`code\`\`\`).
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
