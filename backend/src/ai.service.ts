interface AIResponse {
  answer: string;
  explanation: string;
  practice: string[];
  sources: any[];
  confidence: number;
}

import { HfInference } from '@huggingface/inference';

export class AIService {
  private readonly hf: HfInference | null = null;
  private readonly modelId: string | undefined = process.env.HUGGINGFACE_MODEL_ID;
  private readonly fallbackResponses = {
    'chain rule': {
      answer: 'The chain rule is a fundamental theorem in calculus that allows us to find the derivative of composite functions.',
      explanation: 'If f(x) = g(h(x)), then f\'(x) = g\'(h(x)) · h\'(x). This rule is essential for differentiating complex functions.',
      practice: [
        'Find the derivative of f(x) = (x² + 1)³',
        'Differentiate g(x) = sin(x²)',
        'Calculate the derivative of h(x) = e^(2x + 1)'
      ],
      confidence: 0.9
    },
    'derivative': {
      answer: 'A derivative represents the rate of change of a function with respect to its variable.',
      explanation: 'The derivative f\'(x) gives us the slope of the tangent line to the function f(x) at any point x.',
      practice: [
        'Find the derivative of f(x) = x³',
        'Calculate the derivative of g(x) = 2x + 5',
        'Find the derivative of h(x) = 1/x'
      ],
      confidence: 0.9
    },
    'quadratic': {
      answer: 'A quadratic equation is a second-degree polynomial equation in the form ax² + bx + c = 0.',
      explanation: 'Quadratic equations can be solved using factoring, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.',
      practice: [
        'Solve x² - 5x + 6 = 0',
        'Find the roots of 2x² + 7x + 3 = 0',
        'Solve x² + 4x + 4 = 0'
      ],
      confidence: 0.9
    }
  };

  constructor() {
    const token = process.env.HUGGINGFACE_API_TOKEN;
    if (token) {
      this.hf = new HfInference(token);
    }
  }

  async generateResponse(question: string, mode: string = 'explain'): Promise<AIResponse> {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('chain rule')) {
      const response = this.fallbackResponses['chain rule'];
      return {
        ...response,
        sources: this.generateSources('chain rule')
      };
    }
    
    if (lowerQuestion.includes('derivative')) {
      const response = this.fallbackResponses['derivative'];
      return {
        ...response,
        sources: this.generateSources('derivative')
      };
    }
    
    if (lowerQuestion.includes('quadratic') || lowerQuestion.includes('solve')) {
      const response = this.fallbackResponses['quadratic'];
      return {
        ...response,
        sources: this.generateSources('quadratic')
      };
    }

    // If HF token is configured, call Hugging Face text generation
    if (this.hf) {
      try {
        const modelToUse = this.modelId || 'mistralai/Mixtral-8x7B-Instruct-v0.1';
        const prompt = this.buildPrompt(question, mode);
        const completion = await this.hf.textGeneration({
          model: modelToUse,
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false
          }
        });

        const answerText = completion.generated_text?.trim() || 'I could not generate a response.';
        return {
          answer: answerText,
          explanation: this.extractSection(answerText, 'Explanation') || answerText,
          practice: this.extractPractice(answerText),
          sources: this.generateSources(question),
          confidence: 0.85
        };
      } catch (error) {
        console.error('Hugging Face generation failed, falling back:', error);
      }
    }

    // Fallback static response when HF is not configured or fails
    return {
      answer: 'I understand you\'re asking about this topic. Let me provide you with a helpful explanation.',
      explanation: 'This is a comprehensive explanation of the concept you asked about. I recommend reviewing the fundamentals and practicing with similar problems.',
      practice: [
        'Review the basic concepts',
        'Practice with similar problems',
        'Take a quiz to test your understanding'
      ],
      sources: this.generateSources(question),
      confidence: 0.7
    };
  }

  private generateSources(question: string): any[] {
    return [
      {
        docId: 'general-knowledge',
        title: 'Educational Resources',
        snippet: 'Comprehensive study materials and explanations',
        sourceUrl: '#'
      }
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
    const regex = new RegExp(`${sectionLabel}[:\n]+([\s\S]*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractPractice(text: string): string[] {
    const practiceLabelIndex = text.toLowerCase().indexOf('practice');
    if (practiceLabelIndex === -1) return [
      'Review the basic concepts',
      'Practice with similar problems',
      'Take a quiz to test your understanding'
    ];
    const lines = text.slice(practiceLabelIndex).split('\n');
    const items = lines
      .map(l => l.replace(/^[-*\d\.\)\s]+/, '').trim())
      .filter(l => l.length > 0)
      .slice(0, 3);
    return items.length > 0 ? items : [
      'Review the basic concepts',
      'Practice with similar problems',
      'Take a quiz to test your understanding'
    ];
  }

  async generateQuiz(topics: string[], count: number): Promise<any[]> {
    return [
      {
        id: 'calc-1',
        question: 'What is the derivative of x²?',
        answer: '2x',
        explanation: 'Using the power rule: d/dx(x^n) = n·x^(n-1)',
        topic: 'calculus'
      },
      {
        id: 'calc-2',
        question: 'What is the integral of 2x?',
        answer: 'x² + C',
        explanation: 'The integral of 2x is x² + C, where C is the constant of integration',
        topic: 'calculus'
      },
      {
        id: 'alg-1',
        question: 'Solve for x: 2x + 5 = 13',
        answer: '4',
        explanation: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4',
        topic: 'algebra'
      }
    ].slice(0, count);
  }

  async gradeAnswer(questionId: string, userAnswer: string): Promise<any> {
    const questions = await this.generateQuiz([], 3);
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      return { correct: false, explanation: 'Question not found', newScore: 0 };
    }

    const isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    
    return {
      correct: isCorrect,
      explanation: question.explanation,
      newScore: isCorrect ? 10 : 0
    };
  }

  async generateStudyPlan(userId: string, timeframeDays: number): Promise<any> {
    return {
      id: Date.now().toString(),
      userId,
      timeframeDays,
      tasks: [
        {
          day: 1,
          topics: ['calculus'],
          tasks: ['Review derivatives', 'Practice chain rule problems', 'Take a mini-quiz'],
          estimatedTime: 60,
          completed: false
        },
        {
          day: 2,
          topics: ['algebra'],
          tasks: ['Review quadratic equations', 'Practice factoring', 'Solve word problems'],
          estimatedTime: 45,
          completed: false
        }
      ],
      createdAt: new Date(),
      completedDays: []
    };
  }

  async generateFlashcards(topic: string, count: number = 5): Promise<any[]> {
    const topicLower = topic.toLowerCase();
    
    // Use Hugging Face to generate flashcards if available
    if (this.hf) {
      try {
        const modelToUse = this.modelId || 'mistralai/Mixtral-8x7B-Instruct-v0.1';
        const prompt = `Generate ${count} educational flashcards about ${topic}. 
Format each as: "Question: [question] Answer: [answer]"
Make them progressively harder, covering fundamentals to advanced concepts.
Focus on key principles, formulas, and problem-solving approaches.`;
        
        const completion = await this.hf.textGeneration({
          model: modelToUse,
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false
          }
        });

        const answerText = completion.generated_text?.trim() || '';
        return this.parseFlashcardsFromAI(answerText, topic, count);
      } catch (error) {
        console.error('Hugging Face flashcard generation failed, falling back:', error);
      }
    }

    // Fallback to curated flashcards based on topic
    return this.getFallbackFlashcards(topic, count);
  }

  private parseFlashcardsFromAI(aiText: string, topic: string, count: number): any[] {
    const flashcards = [];
    const lines = aiText.split('\n');
    let currentQuestion = '';
    let currentAnswer = '';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('question:')) {
        if (currentQuestion && currentAnswer) {
          flashcards.push({
            id: flashcards.length + 1,
            question: currentQuestion.trim(),
            answer: currentAnswer.trim(),
            topic: topic
          });
          if (flashcards.length >= count) break;
        }
        currentQuestion = line.replace(/question:/i, '').trim();
        currentAnswer = '';
      } else if (line.toLowerCase().includes('answer:')) {
        currentAnswer = line.replace(/answer:/i, '').trim();
      }
    }
    
    // Add the last card if we have both parts
    if (currentQuestion && currentAnswer && flashcards.length < count) {
      flashcards.push({
        id: flashcards.length + 1,
        question: currentQuestion.trim(),
        answer: currentAnswer.trim(),
        topic: topic
      });
    }
    
    return flashcards.length > 0 ? flashcards : this.getFallbackFlashcards(topic, count);
  }

  private getFallbackFlashcards(topic: string, count: number): any[] {
    const fallbackCards = {
      'calculus': [
        { question: 'What is the derivative of x²?', answer: '2x' },
        { question: 'What does the chain rule state?', answer: 'If f(x) = g(h(x)), then f\'(x) = g\'(h(x)) · h\'(x)' },
        { question: 'What is the integral of 2x?', answer: 'x² + C' },
        { question: 'What is the derivative of sin(x)?', answer: 'cos(x)' },
        { question: 'What is the power rule for derivatives?', answer: 'd/dx(x^n) = n·x^(n-1)' }
      ],
      'algebra': [
        { question: 'What is the quadratic formula?', answer: 'x = (-b ± √(b² - 4ac)) / 2a' },
        { question: 'How do you solve 2x + 5 = 13?', answer: 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4' },
        { question: 'What is factoring?', answer: 'Breaking down a polynomial into simpler factors' },
        { question: 'What is the slope-intercept form?', answer: 'y = mx + b' },
        { question: 'How do you find the slope between two points?', answer: 'm = (y₂ - y₁) / (x₂ - x₁)' }
      ],
      'physics': [
        { question: 'What is Newton\'s First Law?', answer: 'An object at rest stays at rest unless acted upon by an external force' },
        { question: 'What is the formula for kinetic energy?', answer: 'KE = ½mv²' },
        { question: 'What is acceleration?', answer: 'Rate of change of velocity with respect to time' },
        { question: 'What is the law of conservation of energy?', answer: 'Energy cannot be created or destroyed, only transformed' },
        { question: 'What is the formula for force?', answer: 'F = ma' }
      ],
      'chemistry': [
        { question: 'What is the chemical symbol for water?', answer: 'H₂O' },
        { question: 'What is the atomic number of carbon?', answer: '6' },
        { question: 'What is a molecule?', answer: 'Two or more atoms bonded together' },
        { question: 'What is the pH scale range?', answer: '0 to 14' },
        { question: 'What is a chemical reaction?', answer: 'Process where substances are transformed into new substances' }
      ],
      'biology': [
        { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria' },
        { question: 'What is DNA?', answer: 'Deoxyribonucleic acid, the genetic material' },
        { question: 'What is photosynthesis?', answer: 'Process where plants convert sunlight into energy' },
        { question: 'What is evolution?', answer: 'Change in species over time through natural selection' },
        { question: 'What is homeostasis?', answer: 'Maintenance of stable internal conditions' }
      ],
      'computer science': [
        { question: 'What is an algorithm?', answer: 'A step-by-step procedure for solving a problem' },
        { question: 'What is a variable?', answer: 'A container for storing data values' },
        { question: 'What is a function?', answer: 'A reusable block of code that performs a specific task' },
        { question: 'What is recursion?', answer: 'A function calling itself' },
        { question: 'What is object-oriented programming?', answer: 'Programming paradigm based on objects containing data and code' }
      ]
    };

    const topicKey = Object.keys(fallbackCards).find(key => 
      topic.toLowerCase().includes(key.toLowerCase())
    ) || 'calculus';

    return fallbackCards[topicKey].slice(0, count).map((card, index) => ({
      id: index + 1,
      question: card.question,
      answer: card.answer,
      topic: topic
    }));
  }
}
