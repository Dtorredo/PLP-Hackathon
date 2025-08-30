# AI Study Buddy 🧠

A comprehensive AI-powered study platform that helps students create personalized learning experiences through intelligent flashcards, study plans, and interactive learning tools.

## 🚀 Features

### 🤖 AI-Powered Learning

- **Smart Flashcard Generation**: Create personalized flashcards for any subject using Google Gemini AI
- **Intelligent Study Plans**: AI-generated weekly study schedules with topic distribution
- **Interactive Chat**: Ask questions and get detailed explanations with practice exercises
- **Adaptive Content**: Content adapts to your learning style and progress

### 📚 Study Tools

- **Flashcard System**: Interactive, draggable flashcards with markdown support
- **Study Plan Calendar**: Notion-style calendar grid with daily task tracking
- **Progress Tracking**: Monitor your learning progress and achievements
- **Flashcard History**: Save and revisit previously generated flashcards

### 🎯 Personalization

- **Subject Selection**: Choose your study subjects and focus areas
- **Time Management**: Set preferred study time slots for optimal scheduling
- **Achievement System**: Earn badges for consistent study habits
- **User Profiles**: Track points, streaks, and learning history

### 🎨 Modern UI/UX

- **Dark Theme**: Beautiful dark interface with pink accents
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Framer Motion powered interactions
- **Glassmorphism Effects**: Modern blur effects and gradients

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Firebase** for authentication and data storage
- **React Markdown** for content rendering

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **Google Gemini AI** for intelligent content generation
- **Redis** for session management and caching
- **ioredis** for Redis client

### Package Management

- **pnpm** for fast, efficient dependency management
- **pnpm workspaces** for monorepo structure

## 📦 Project Structure

```
ai-study-buddy/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/             # Utilities and types
│   │   └── pages/           # Page components
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── ai.service.ts    # AI integration
│   │   ├── redis.service.ts # Redis operations
│   │   └── index.ts         # Express server
│   └── package.json
├── package.json              # Root package.json
├── pnpm-workspace.yaml       # pnpm workspace config
└── dev.sh                    # Development script
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Redis** server running locally

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-study-buddy
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` files in both `frontend/` and `backend/` directories:

   **Backend (.env)**

   ```env
   PORT=3001
   GOOGLE_AI_API_KEY=your_gemini_api_key
   REDIS_URL=redis://localhost:6379
   ```

   **Frontend (.env)**

   ```env
   VITE_API_URL=http://localhost:3001
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   ```

4. **Start Redis server**

   ```bash
   redis-server
   ```

5. **Start development servers**

   ```bash
   # Option 1: Use the convenience script
   ./dev.sh

   # Option 2: Use pnpm workspace commands
   pnpm dev
   ```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 📋 Available Scripts

### Root Level (pnpm workspace)

```bash
pnpm dev              # Start both frontend and backend
pnpm dev:frontend     # Start only frontend
pnpm dev:backend      # Start only backend
pnpm build            # Build both projects
pnpm install:all      # Install all dependencies
```

### Frontend

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
```

### Backend

```bash
pnpm dev              # Start development server
pnpm build            # Build TypeScript
pnpm start            # Start production server
```

## 🔧 Development

### Key Features Implementation

#### AI Integration

- **Google Gemini 2.5 Flash**: Fast, efficient AI model for content generation
- **Smart Prompts**: Structured prompts for consistent, high-quality output
- **Fallback Systems**: Robust error handling and fallback responses

#### Flashcard System

- **Dynamic Generation**: Create flashcards for any subject or topic
- **Markdown Support**: Rich text formatting with code highlighting
- **Interactive Cards**: Draggable cards with smooth animations
- **History Management**: Save and load previous flashcard sets

#### Study Plan Generation

- **Weekly Scheduling**: 5-day plans with topic distribution
- **Time Slot Management**: User-defined study time preferences
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Flashcard Integration**: Daily flashcard prompts based on study topics

#### User Experience

- **Sticky Navigation**: Header and navbar stay in position while scrolling
- **Loading States**: Custom SVG animations for better UX
- **Responsive Design**: Optimized for all screen sizes
- **Dark Theme**: Consistent dark interface throughout

### Database Schema

#### Firebase Firestore

```typescript
// User Document
{
  id: string
  name: string
  email: string
  points: number
  streak: number
  subjects: string[]
  achievements: Achievement[]
  flashcardHistory: FlashcardHistory[]
  createdAt: Date
  lastActive: Date
}

// Achievement
{
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
  type: 'points' | 'streak'
}

// Flashcard History
{
  id: string
  prompt: string
  module: string
  specificArea: string
  flashcards: Flashcard[]
  createdAt: Date
  lastViewed: Date
}
```

#### Redis

- **Session Management**: User session data and message history
- **Study Plan Storage**: Weekly study plans with progress tracking
- **Caching**: Frequently accessed data for improved performance

## 🎨 UI Components

### Custom Components

- **LoadingSpinner**: Custom SVG animation for loading states
- **CardStack**: Draggable card stack with 3D effects
- **Flashcard**: Interactive flashcard with markdown rendering
- **CourseSidebar**: Flashcard generation and history management
- **StudyPlanCalendar**: Notion-style calendar grid

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Colors**: Dark theme with pink accents
- **Glassmorphism**: Modern blur effects and transparency
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure environment variables
3. Set build commands:
   - **Frontend**: `cd frontend && pnpm build`
   - **Backend**: `cd backend && pnpm build && pnpm start`

### Railway (Alternative)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🔍 Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Kill existing processes
pkill -f "vite\|ts-node-dev" || true
# Restart services
pnpm dev
```

#### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Start Redis if not running
redis-server
```

#### pnpm Issues

```bash
# Clear pnpm cache
pnpm store prune
# Reinstall dependencies
pnpm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent content generation
- **Firebase** for backend services
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **pnpm** for fast package management

---

**Built with ❤️ for better learning experiences**
