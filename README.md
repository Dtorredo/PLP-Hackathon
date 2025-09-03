# AI Study Buddy 🧠

An intelligent AI-powered study platform that creates personalized learning experiences through smart flashcards, study plans, and interactive chat-based learning.

## ✨ Key Features

### 🤖 AI-Powered Learning

- **Smart Flashcard Generation**: Create personalized flashcards for any subject using Google Gemini AI
- **Intelligent Study Plans**: AI-generated weekly schedules with topic distribution and time management
- **Interactive Chat Learning**: Real-time chat with AI for explanations, practice exercises, and Q&A
- **Adaptive Content**: Content adapts to your learning style and progress

### 📚 Study Tools

- **Interactive Flashcards**: Draggable cards with markdown support and smooth animations
- **Study Plan Calendar**: Notion-style calendar with daily task tracking and progress visualization
- **Real-Time Chat History**: Persistent chat sessions with search functionality
- **Progress Tracking**: Monitor learning progress, streaks, and achievements

### 🎯 Personalization

- **Subject Selection**: Choose study subjects and focus areas
- **Time Management**: Set preferred study time slots for optimal scheduling
- **Session Management**: Automatic session timeout and manual chat reset
- **User Profiles**: Track points, streaks, and comprehensive learning history

### 🎨 Modern UI/UX

- **Dark/Light Theme**: Beautiful interface with theme toggle
- **Responsive Design**: Optimized for desktop and mobile devices
- **Smooth Animations**: Framer Motion powered interactions
- **Floating Sidebar**: Fixed chat history sidebar that doesn't interfere with scrolling

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript for type safety
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Firebase** for authentication and Firestore database
- **React Markdown** for rich content rendering
- **Vite** for fast development and building

### Backend

- **Node.js** with Express.js framework
- **TypeScript** for type safety
- **Google Gemini AI** for intelligent content generation
- **Redis** for session management and caching
- **ioredis** for Redis client operations

### Development Tools

- **pnpm** for fast, efficient package management
- **pnpm workspaces** for monorepo structure
- **ESLint** for code quality
- **Jest** for testing

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.19+)
- pnpm (v8+)
- Redis server

### Installation

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd ai-study-buddy
   pnpm install
   ```

2. **Environment setup**

   **Backend** (`backend/.env`):

   ```env
   PORT=3001
   GOOGLE_AI_API_KEY=your_gemini_api_key
   REDIS_URL=redis://localhost:6379
   ```

   **Frontend** (`frontend/.env`):

   ```env
   VITE_API_URL=http://localhost:3001
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

3. **Start development**

   ```bash
   # Start Redis
   redis-server

   # Start both frontend and backend
   pnpm dev
   ```

**Access the app:**

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📦 Project Structure

```
ai-study-buddy/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── core/        # Core components (CardStack, DraggableContainer)
│   │   │   ├── features/    # Feature components (Flashcard, CourseSidebar)
│   │   │   ├── pages/       # Page components (ChatPage, StudyPlanPage)
│   │   │   └── ui/          # UI components (LoadingSpinner)
│   │   ├── lib/             # Utilities (auth, firebase, types)
│   │   └── hooks/           # Custom hooks
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── ai.service.ts    # AI integration
│   │   ├── redis.service.ts # Redis operations
│   │   └── index.ts         # Express server
│   └── package.json
├── package.json              # Root workspace
└── pnpm-workspace.yaml       # Workspace config
```

## 🔧 Key Features Implementation

### Real-Time Chat System

- **Immediate History Updates**: Chat sessions appear in history instantly
- **Session Management**: Automatic session timeout (30 min) and manual reset
- **Persistent State**: Chat history persists across tab switches
- **Search Functionality**: Search across all message content and session metadata

### Flashcard System

- **Dynamic Generation**: Create flashcards for any subject/topic
- **Interactive Cards**: Draggable cards with 3D effects
- **Markdown Support**: Rich text formatting with code highlighting
- **History Management**: Save and load previous flashcard sets

### Study Plan Generation

- **Weekly Scheduling**: 5-day plans with topic distribution
- **Time Slot Management**: User-defined study preferences
- **Progress Tracking**: Visual progress indicators
- **Flashcard Integration**: Daily flashcard prompts

### State Management

- **Persistent State**: Custom `PageStateProvider` for cross-tab persistence
- **Local Storage**: Automatic state persistence using localStorage
- **Session Tracking**: Real-time session management with timeout

## 🎨 UI/UX Features

### Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Floating Sidebar**: Fixed chat history that doesn't interfere with scrolling
- **Theme Toggle**: Dark/light theme with smooth transitions
- **Mobile Navigation**: Left-aligned navbar on mobile to prevent overlap

### Animations & Interactions

- **Smooth Transitions**: Framer Motion powered animations
- **Loading States**: Custom SVG animations
- **Drag & Drop**: Interactive flashcard system
- **Glassmorphism**: Modern blur effects and transparency

## 📊 Database Schema

### Firebase Firestore

```typescript
// Users Collection
{
  id: string
  name: string
  email: string
  points: number
  streak: number
  subjects: string[]
  createdAt: Date
}

// Chat Sessions Collection
{
  id: string
  userId: string
  createdAt: Date
  messages: ChatMessage[]
}

// Study Plans Collection
{
  id: string
  userId: string
  topics: string[]
  timeSlots: TimeSlot[]
  createdAt: Date
}
```

### Redis

- Session management and caching
- Study plan storage
- Real-time data persistence

## 🚀 Deployment

### Production Build

```bash
# Build both frontend and backend
pnpm build

# Start production servers
pnpm start
```

### Environment Variables

Ensure all required environment variables are set for production deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for better learning experiences**

## 🚀 Deployment Guide

### **Problem Solved: Localhost URLs**

The application now uses a centralized API configuration that automatically adapts to different environments:

- **Development**: Uses `localhost:3001` (local development)
- **Production**: Uses environment variable `VITE_API_URL` (deployed backend)

### **Deployment Options**

#### **Option 1: Deploy Backend to Cloud Platform**

1. **Deploy Backend** (Railway, Render, DigitalOcean, etc.)

   ```bash
   # Set environment variables in your cloud platform:
   GOOGLE_AI_API_KEY=your_gemini_api_key
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```

2. **Update Frontend Environment**

   ```env
   # frontend/.env.production
   VITE_API_URL=https://your-backend-url.com
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

3. **Deploy Frontend** (Vercel, Netlify, etc.)

#### **Option 2: Full-Stack Deployment**

Deploy both frontend and backend together on platforms like:

- **Railway**: Supports full-stack deployments
- **Render**: Full-stack application support
- **DigitalOcean App Platform**: Monorepo deployment

### **Environment Variables**

#### **Backend (.env)**

```env
PORT=3001
GOOGLE_AI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

#### **Frontend (.env)**

```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### **Quick Deployment Steps**

1. **Backend Deployment**:

   ```bash
   cd backend
   pnpm build
   # Deploy to your chosen platform
   ```

2. **Frontend Deployment**:

   ```bash
   cd frontend
   pnpm build
   # Deploy to Vercel/Netlify/etc.
   ```

3. **Set Environment Variables** in your deployment platform

4. **Test the Application** - it should now work for all users!

### **Troubleshooting**

- **Connection Refused**: Ensure backend is deployed and `VITE_API_URL` is set correctly
- **CORS Issues**: Backend includes CORS configuration for production
- **Redis Issues**: Using Upstash Redis (cloud) - no local Redis required
