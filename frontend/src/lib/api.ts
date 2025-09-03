// API configuration for the application
export const API_CONFIG = {
  // Base URL for API calls - uses environment variable or falls back to localhost for development
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  
  // API endpoints
  ENDPOINTS: {
    // Chat endpoints
    ASK: "/api/v1/ask",
    
    // Flashcard endpoints
    GENERATE_FLASHCARDS: "/api/v1/flashcards/generate",
    GET_FLASHCARD_HISTORY: "/api/v1/flashcards/history",
    
    // Study plan endpoints
    GENERATE_PLAN: "/api/v1/plan/generate",
    GET_PLAN_HISTORY: "/api/v1/plan/history",
    UPDATE_PLAN_PROGRESS: "/api/v1/plan/progress",
    GET_PLAN_PROGRESS: "/api/v1/plan/progress",
    
    // Payment endpoints
    CREATE_PAYMENT: "/api/v1/payment/create",
    PAYMENT_WEBHOOK: "/api/v1/payment/webhook",
    
    // Health check
    STATUS: "/api/v1/status",
  },
  
  // Helper function to build full API URLs
  getUrl: (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`,
  
  // Helper function to make API requests
  async request(endpoint: string, options: RequestInit = {}) {
    const url = API_CONFIG.getUrl(endpoint);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Helper function for POST requests
  async post(endpoint: string, data: any) {
    return API_CONFIG.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Helper function for GET requests
  async get(endpoint: string) {
    return API_CONFIG.request(endpoint, {
      method: 'GET',
    });
  },
};

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Log API configuration in development
if (isDevelopment) {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    isDevelopment,
    isProduction,
  });
}
