# Software Design Specification (SDS)

## AI Study Buddy Platform

**Version:** 1.0  
**Date:** November 13, 2025  
**Project:** AI Study Buddy - Intelligent Learning Platform  
**Deployment:** https://plp-hackathon.fly.dev

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [Program Design](#5-program-design)
6. [Interface Design](#6-interface-design)
7. [Deployment Design](#7-deployment-design)
8. [Security Design](#8-security-design)
9. [References](#9-references)

---

## 1. Introduction

### 1.1 Purpose

This Software Design Specification (SDS) document describes the architectural and technical design of the AI Study Buddy platform. The system provides an intelligent, personalized learning experience using AI-powered tools including flashcard generation, study plan creation, interactive tutoring, and progress tracking with gamification elements.

### 1.2 Scope

**Included:**

- AI-powered chat interface for interactive learning and Q&A
- Automated flashcard generation using Google Gemini AI
- Personalized study plan creation with time management
- User authentication and profile management
- Progress tracking with points, streaks, and achievements
- Premium subscription management via M-Pesa payments
- Real-time data caching and session management
- Multi-theme UI (light/dark mode)
- Mobile-responsive design

**Excluded:**

- Video conferencing or live tutoring sessions
- Peer-to-peer collaboration features
- Content management system for educators
- Mobile native applications (iOS/Android)
- Offline mode functionality

### 1.3 Overview

AI Study Buddy is a full-stack web application built as a monorepo with separate frontend and backend workspaces. The platform leverages Google Gemini 2.5 Flash for AI content generation, Firebase for authentication and persistent storage, Redis for caching and session management, and M-Pesa for payment processing. The system is deployed on Fly.io with Docker containerization.

**Key Stakeholders:**

- **Students:** Primary users seeking personalized study assistance
- **System Administrators:** Manage deployment, monitoring, and maintenance
- **Payment Providers:** M-Pesa integration for subscription processing
- **AI Service Providers:** Google Gemini API for content generation

### 1.4 Definitions, Acronyms, and Abbreviations

| Term          | Definition                                      |
| ------------- | ----------------------------------------------- |
| **AI**        | Artificial Intelligence                         |
| **API**       | Application Programming Interface               |
| **SPA**       | Single Page Application                         |
| **REST**      | Representational State Transfer                 |
| **JWT**       | JSON Web Token                                  |
| **CORS**      | Cross-Origin Resource Sharing                   |
| **SDS**       | Software Design Specification                   |
| **UI/UX**     | User Interface / User Experience                |
| **CRUD**      | Create, Read, Update, Delete                    |
| **STK Push**  | SIM Toolkit Push (M-Pesa payment initiation)    |
| **Firestore** | Firebase Cloud Firestore (NoSQL database)       |
| **Redis**     | Remote Dictionary Server (in-memory data store) |
| **Gemini**    | Google's Generative AI model                    |
| **pnpm**      | Performant Node Package Manager                 |
| **Monorepo**  | Single repository containing multiple projects  |
| **Docker**    | Containerization platform                       |
| **Fly.io**    | Cloud deployment platform                       |

---

## 2. System Overview

### 2.1 System Context

The AI Study Buddy platform operates within the following ecosystem:

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SYSTEMS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Google     │  │   Firebase   │  │   M-Pesa     │          │
│  │   Gemini AI  │  │   Services   │  │   Daraja API │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          │ AI Content       │ Auth & Data      │ Payments
          │ Generation       │ Storage          │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼──────────────────┐
│                    AI STUDY BUDDY PLATFORM                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Backend (Node.js/Express)               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   AI     │  │  Redis   │  │ Payment  │  │   API    │  │  │
│  │  │ Service  │  │ Service  │  │ Service  │  │  Routes  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                         REST API                                  │
│                              │                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Frontend (React + TypeScript)                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   Chat   │  │Flashcards│  │  Study   │  │ Profile  │  │  │
│  │  │   Page   │  │   Page   │  │   Plan   │  │   Page   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    │ HTTPS
                                    │
                          ┌─────────▼─────────┐
                          │   End Users       │
                          │   (Students)      │
                          └───────────────────┘
```

**External System Integrations:**

1. **Google Gemini AI (v2.5 Flash):** Generates educational content, flashcards, study plans, and chat responses
2. **Firebase Authentication:** Manages user sign-up, sign-in, and session tokens
3. **Firebase Firestore:** Stores user profiles, chat history, flashcard history, and subscription data
4. **Redis (Upstash):** Caches study plans, chat sessions, and temporary data
5. **M-Pesa Daraja API:** Processes premium subscription payments via STK Push

### 2.2 Assumptions and Dependencies

**Assumptions:**

- Users have stable internet connectivity
- Users access the platform via modern web browsers (Chrome, Firefox, Safari, Edge)
- Google Gemini API maintains 99.9% uptime
- Firebase services remain available and performant
- M-Pesa Daraja API is accessible for Kenyan users
- Users have basic digital literacy
- Study content is primarily text-based (no video/audio generation)

**Dependencies:**

| Dependency        | Version   | Purpose               | Criticality |
| ----------------- | --------- | --------------------- | ----------- |
| Node.js           | 20.18.0+  | Backend runtime       | Critical    |
| React             | 18.x      | Frontend framework    | Critical    |
| TypeScript        | 5.x       | Type safety           | High        |
| Express.js        | 4.19+     | Web server            | Critical    |
| Google Gemini API | 2.5 Flash | AI content generation | Critical    |
| Firebase SDK      | 9.0+      | Auth & Database       | Critical    |
| Redis (Upstash)   | 6.0+      | Caching layer         | High        |
| Framer Motion     | Latest    | UI animations         | Medium      |
| Tailwind CSS      | 3.x       | Styling framework     | Medium      |
| pnpm              | 8.x+      | Package management    | High        |
| Docker            | Latest    | Containerization      | Critical    |
| Fly.io CLI        | Latest    | Deployment            | Critical    |

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              React SPA (TypeScript + Vite)                    │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │  │
│  │  │ Landing │ │  Chat   │ │Flashcard│ │  Study  │ │Profile │ │  │
│  │  │  Page   │ │  Page   │ │  Page   │ │  Plan   │ │ Page   │ │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │         State Management & Context Providers             │ │  │
│  │  │  • Theme Context  • Page State  • Auth State             │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS/REST API
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      APPLICATION LAYER (Backend)                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Express.js Server (TypeScript)                   │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │                    API Routes                             │ │  │
│  │  │  /api/v1/ask              - Chat Q&A                      │ │  │
│  │  │  /api/v1/flashcards/*     - Flashcard generation          │ │  │
│  │  │  /api/v1/plan/*           - Study plan CRUD               │ │  │
│  │  │  /api/v1/payment/*        - M-Pesa integration            │ │  │
│  │  │  /api/v1/status           - Health check                  │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │                  Service Layer                            │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │ │  │
│  │  │  │   AI     │  │  Redis   │  │ Payment  │               │ │  │
│  │  │  │ Service  │  │ Service  │  │ Service  │               │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘               │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                        DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Firebase   │  │    Redis     │  │   Google     │              │
│  │  Firestore   │  │   (Upstash)  │  │   Gemini     │              │
│  │              │  │              │  │     API      │              │
│  │ • Users      │  │ • Sessions   │  │              │              │
│  │ • Chat Hist  │  │ • Study Plans│  │ • Content    │              │
│  │ • Flashcards │  │ • Cache      │  │   Generation │              │
│  │ • Payments   │  │ • Feedback   │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Modules and Components

#### 3.2.1 Frontend Modules

**A. Core Components (`frontend/src/components/core/`)**

- `CardStack.tsx` - Reusable drag-and-drop card stack component
- `DraggableContainer.tsx` - Wrapper for draggable UI elements

**B. Feature Components (`frontend/src/components/features/`)**

- `Flashcard.tsx` - Individual flashcard with flip animation
- `FlashcardStack.tsx` - Stack of flashcards with swipe gestures
- `CourseSidebar.tsx` - Topic selection and history navigation
- `ChatInterface.tsx` - Message display and input handling

**C. Page Components (`frontend/src/components/pages/`)**

- `LandingPage.tsx` - Marketing page with authentication prompts
- `SignInPage.tsx` / `SignUpPage.tsx` - Authentication forms
- `ChatPage.tsx` - AI tutoring interface with chat history
- `FlashcardsPage.tsx` - Flashcard generation and review
- `StudyPlanPage.tsx` - Study plan creation and progress tracking
- `ProfilePage.tsx` - User stats, achievements, and settings
- `PricingPage.tsx` - Subscription plans and M-Pesa payment
- `SubjectsPage.tsx` - Initial subject selection for new users

**D. Utility Modules (`frontend/src/lib/`)**

- `firebase.ts` - Firebase initialization and configuration
- `api.ts` - API endpoint configuration and helper functions
- `types.ts` - TypeScript type definitions
- `theme.tsx` - Theme context provider (light/dark mode)
- `pageState.tsx` - Persistent state management across pages

#### 3.2.2 Backend Modules

**A. Main Server (`backend/src/index.ts`)**

- Express server initialization
- Middleware configuration (CORS, JSON parsing)
- Route definitions and handlers
- Static file serving for frontend
- Error handling

**B. Service Layer**

1. **AI Service (`backend/src/ai.service.ts`)**

   - `generateResponse()` - Chat Q&A with context
   - `generateFlashcards()` - AI-powered flashcard creation
   - `generateStudyPlan()` - Personalized study schedule
   - `generateQuiz()` - Quiz question generation
   - `gradeAnswer()` - Answer validation and feedback

2. **Redis Service (`backend/src/redis.service.ts`)**

   - `storeMessage()` / `getMessages()` - Chat session management
   - `storeStudyPlan()` / `getStudyPlan()` - Study plan caching
   - `storeFeedback()` / `getFeedback()` - User feedback storage
   - `storeProgress()` / `getProgress()` - Progress tracking

3. **Payment Service (`backend/src/payment.service.ts`)**
   - `initiateMpesaPayment()` - STK Push initiation
   - `handleMpesaCallback()` - Payment confirmation processing
   - `getUserSubscription()` - Subscription status retrieval
   - `cancelSubscription()` - Subscription cancellation
   - `getAccessToken()` - M-Pesa OAuth token management

**C. Firebase Integration (`backend/src/lib/firebase.ts`)**

- Firebase Admin SDK initialization
- Firestore database connection

### 3.3 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND                                                    │
│  ├─ Framework: React 18 + TypeScript                        │
│  ├─ Build Tool: Vite                                        │
│  ├─ Styling: Tailwind CSS 3.x                               │
│  ├─ Animations: Framer Motion                               │
│  ├─ Markdown: react-markdown + remark-gfm                   │
│  ├─ Icons: Lucide React                                     │
│  └─ State: React Context API + localStorage                 │
│                                                              │
│  BACKEND                                                     │
│  ├─ Runtime: Node.js 20.18.0                                │
│  ├─ Framework: Express.js 4.19+                             │
│  ├─ Language: TypeScript 5.x                                │
│  ├─ Dev Server: ts-node-dev                                 │
│  └─ Testing: Jest + ts-jest                                 │
│                                                              │
│  AI & EXTERNAL SERVICES                                     │
│  ├─ AI Model: Google Gemini 2.5 Flash                       │
│  ├─ Auth: Firebase Authentication 9.x                       │
│  ├─ Database: Firebase Firestore 9.x                        │
│  ├─ Cache: Redis (Upstash REST API)                         │
│  └─ Payments: M-Pesa Daraja API (Sandbox/Live)              │
│                                                              │
│  DEPLOYMENT & INFRASTRUCTURE                                │
│  ├─ Containerization: Docker (Multi-stage build)            │
│  ├─ Hosting: Fly.io                 │
│  ├─ Package Manager: pnpm 8.x (Workspace monorepo)          │
│  ├─ CI/CD: Fly.io auto-deploy                               │
│  └─ Environment: Production + Development configs           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Design

### 4.1 Data Model/Schema

#### 4.1.1 Firebase Firestore Collections

**Collection: `users`**

```typescript
{
  id: string
  name: string
  email: string
  points: number
  streak: number
  subjects: string[]
  topics: {
    [topicName: string]: {
      attempts: number
      correct: number
      strength: number
      lastSeen: number
    }
  }
  achievements: Achievement[]
  flashcardHistory: FlashcardHistory[]
  createdAt: Date
  lastActive: Date
}
```

**Sub-collection: `users/{userId}/chatSessions`**

```typescript
{
  id: string
  userId: string
  createdAt: Date
  messages: ChatMessage[]
}
  lastActive: Date
```

**Sub-collection: `users/{userId}/flashcardHistory`**

```typescript
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

**Collection: `subscriptions`**

```typescript
{
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired";
  amount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: "mpesa";
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Collection: `payments`**

```typescript
{
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  provider: "mpesa";
  checkoutRequestID: string;
  merchantRequestID: string;
  mpesaReceiptNumber: string;
  phoneNumber: string;
  reference: string;
  planId: string;
  createdAt: Date;
  completedAt: Date;
}
```

#### 4.1.2 Redis Cache Schema (Upstash)

**Key Pattern: `chat:{sessionId}:{userId}`**

```typescript
[
  {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  },
  ...
]
```

**Key Pattern: `study_plan:{userId}:current`**

```typescript
{
  id: string
  userId: string
  dailyHours: number
  weakTopics: string[]
  preferredTimeSlots: TimeSlot[]
  tasks: StudyPlanTask[]
  createdAt: string
  completedTasks: string[]
  weeklyProgress: number
  badges: string[]
}
```

**Key Pattern: `study_plan:{userId}:history`**

```typescript
[
  { ...StudyPlan },
  { ...StudyPlan },
  ...
]
```

**Key Pattern: `feedback:{responseId}:{userId}`**

```typescript
{
  isPositive: boolean;
  feedback: string;
  timestamp: string;
}
```

**Key Pattern: `progress:{userId}:{planId}`**

```typescript
{
  completedTasks: string[]
  lastUpdated: string
  weeklyProgress: number
}
```

### 4.2 Data Flow Diagrams

#### 4.2.1 User Authentication Flow

```
┌─────────┐                ┌──────────┐              ┌──────────┐
│ Browser │                │ Frontend │              │ Firebase │
│         │                │  (React) │              │   Auth   │
└────┬────┘                └────┬─────┘              └────┬─────┘
     │                          │                         │
     │ 1. Click Sign In         │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │ 2. signInWithEmail()    │
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │ 3. ID Token             │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │ 4. onAuthStateChanged() │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │ 5. Fetch user doc       │
     │                          ├─────────────┐           │
     │                          │             │           │
     │                          │<────────────┘           │
     │                          │ (Firestore)             │
     │                          │                         │
     │ 6. Redirect to App       │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
```

#### 4.2.2 Flashcard Generation Flow

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐
│ Browser │    │ Frontend │    │ Backend  │    │ Gemini  │    │Firestore │
│         │    │          │    │  API     │    │   AI    │    │          │
└────┬────┘    └────┬─────┘    └────┬─────┘    └────┬────┘    └────┬─────┘
     │              │               │               │              │
     │ 1. Select    │               │               │              │
     │    Topic     │               │               │              │
     ├─────────────>│               │               │              │
     │              │               │               │              │
     │              │ 2. POST       │               │              │
     │              │ /flashcards/  │               │              │
     │              │    generate   │               │              │
     │              ├──────────────>│               │              │
     │              │               │               │              │
     │              │               │ 3. Generate   │              │
     │              │               │    Content    │              │
     │              │               ├──────────────>│              │
     │              │               │               │              │
     │              │               │ 4. Flashcards │              │
     │              │               │<──────────────┤              │
     │              │               │               │              │
     │              │ 5. JSON       │               │              │
     │              │    Response   │               │              │
     │              │<──────────────┤               │              │
     │              │               │               │              │
     │              │ 6. Save to    │               │              │
     │              │    History    │               │              │
     │              ├───────────────────────────────────────────────>│
     │              │               │               │              │
     │ 7. Display   │               │               │              │
     │    Cards     │               │               │              │
     │<─────────────┤               │               │              │
     │              │               │               │              │
```

#### 4.2.3 Study Plan Generation & Caching Flow

```
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐
│ Browser │  │ Frontend │  │ Backend  │  │ Gemini  │  │  Redis  │
│         │  │          │  │  API     │  │   AI    │  │  Cache  │
└────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬────┘
     │            │             │             │            │
     │ 1. Submit  │             │             │            │
     │    Plan    │             │             │            │
     │    Form    │             │             │            │
     ├───────────>│             │             │            │
     │            │             │             │            │
     │            │ 2. POST     │             │            │
     │            │ /plan/      │             │            │
     │            │  generate   │             │            │
     │            ├────────────>│             │            │
     │            │             │             │            │
     │            │             │ 3. AI Plan  │            │
     │            │             │    Request  │            │
     │            │             ├────────────>│            │
     │            │             │             │            │
     │            │             │ 4. Plan     │            │
     │            │             │    JSON     │            │
     │            │             │<────────────┤            │
     │            │             │             │            │
     │            │             │ 5. Store    │            │
     │            │             │    Current  │            │
     │            │             ├─────────────────────────>│
     │            │             │             │            │
     │            │             │ 6. Store    │            │
     │            │             │    History  │            │
     │            │             ├─────────────────────────>│
     │            │             │             │            │
     │            │ 7. Plan     │             │            │
     │            │    Response │             │            │
     │            │<────────────┤             │            │
     │            │             │             │            │
     │ 8. Display │             │             │            │
     │    Plan    │             │             │            │
     │<───────────┤             │             │            │
     │            │             │             │            │
```

### 4.3 Data Storage

**Storage Strategy:**

1. **Firebase Firestore (Persistent Storage)**

   - User profiles and authentication data
   - Chat session history (long-term)
   - Flashcard generation history
   - Payment records and subscriptions
   - **Retention:** Indefinite (user-controlled deletion)
   - **Backup:** Firebase automatic daily backups

2. **Redis/Upstash (Temporary Cache)**

   - Active chat sessions (30-minute TTL)
   - Current study plans (7-day expiry)
   - User feedback (30-day retention)
   - Progress tracking (session-based)
   - **Retention:** Time-based expiration
   - **Backup:** Not required (ephemeral data)

3. **localStorage (Client-Side)**
   - Theme preferences (light/dark mode)
   - Current page state
   - Form input persistence
   - **Retention:** Until browser cache cleared
   - **Backup:** Not applicable

**Data Retrieval Patterns:**

- **User Profile:** Firestore → Single document read on authentication
- **Chat History:** Firestore → Query with orderBy + limit
- **Active Chat:** Redis → LRANGE for recent messages
- **Study Plan:** Redis (current) → Firestore (history)
- **Flashcards:** Firestore → Query by userId + orderBy createdAt

### 4.4 Data Security and Privacy

**Encryption:**

- **In Transit:** TLS 1.3 for all HTTPS connections
- **At Rest:** Firebase/Firestore automatic encryption
- **API Keys:** Environment variables, never committed to version control

**Access Controls:**

- **Firebase Security Rules:** User can only access own documents
- **Redis Keys:** Namespaced by userId to prevent cross-user access
- **API Authentication:** Firebase ID token validation on backend

**Data Privacy Measures:**

- **PII Protection:** Email and phone numbers stored securely
- **Payment Data:** M-Pesa handles sensitive card/account data
- **User Consent:** Terms of service acceptance required
- **Data Deletion:** User-initiated account deletion removes all data
- **Audit Logging:** Payment transactions logged with timestamps

**Compliance:**

- GDPR-ready (user data export/deletion capabilities)
- Data minimization (only essential data collected)
- Secure payment processing (PCI DSS via M-Pesa)

---

## 5. Program Design

### 5.1 Module Design

This section provides detailed process flows for key functional requirements.

#### 5.1.1 AI Chat Q&A Module

**Functional Requirement:** FR-001 - Users can ask questions and receive AI-generated explanations

**Process Flow:**

```
START
  │
  ├─> User enters question in chat input
  │
  ├─> Validate input (not empty)
  │   ├─> If invalid: Display error message → END
  │   └─> If valid: Continue
  │
  ├─> Create user message object
  │   └─> { role: 'user', content: text, timestamp: now }
  │
  ├─> Add message to local state (optimistic UI)
  │
  ├─> Set loading state = true
  │
  ├─> POST /api/v1/ask
  │   └─> Body: { sessionId, userId, text, mode }
  │
  ├─> Backend receives request
  │   │
  │   ├─> Validate request parameters
  │   │   ├─> If invalid: Return 400 error → END
  │   │   └─> If valid: Continue
  │   │
  │   ├─> Call AIService.generateResponse(text, mode)
  │   │   │
  │   │   ├─> Check for keyword matches (fallback responses)
  │   │   │
  │   │   ├─> If Gemini API available:
  │   │   │   ├─> Build prompt with mode and question
  │   │   │   ├─> Call Gemini API
  │   │   │   ├─> Parse response (extract sections)
  │   │   │   └─> Return structured AIResponse
  │   │   │
  │   │   └─> Else: Return fallback response
  │   │
  │   ├─> Store user message in Redis
  │   │   └─> LPUSH chat:{sessionId}:{userId}
  │   │
  │   ├─> Store assistant message in Redis
  │   │   └─> LPUSH chat:{sessionId}:{userId}
  │   │
  │   └─> Return JSON response
  │       └─> { success, responseId, answer, explanation, practice, sources }
  │
  ├─> Frontend receives response
  │   │
  │   ├─> If error: Display error message
  │   │
  │   └─> If success:
  │       ├─> Create assistant message object
  │       ├─> Add to local state
  │       └─> Render markdown content
  │
  ├─> Set loading state = false
  │
  ├─> Save session to Firestore (async)
  │   └─> Collection: users/{userId}/chatSessions
  │
END
```

**Pseudocode:**

```javascript
async function handleSendMessage(inputValue, sessionId, userId) {
  if (!inputValue.trim()) {
    return showError("Please enter a question");
  }

  const userMessage = {
    id: generateId(),
    role: "user",
    content: inputValue,
    timestamp: new Date(),
  };

  addMessageToState(userMessage);
  setLoading(true);

  try {
    const response = await fetch("/api/v1/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        userId,
        text: inputValue,
        mode: "explain",
      }),
    });

    const data = await response.json();

    if (data.success) {
      const assistantMessage = {
        id: data.responseId,
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        confidence: data.confidence,
        sources: data.sources,
      };

      addMessageToState(assistantMessage);

      saveChatSession(sessionId, userId, [userMessage, assistantMessage]);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    showError("Failed to get response. Please try again.");
  } finally {
    setLoading(false);
  }
}
```

#### 5.1.2 Flashcard Generation Module

**Functional Requirement:** FR-002 - Generate AI-powered flashcards for any topic

**Process Flow:**

```
START
  │
  ├─> User selects topic from sidebar
  │
  ├─> Set loading state = true
  │
  ├─> POST /api/v1/flashcards/generate
  │   └─> Body: { topic, count: 8 }
  │
  ├─> Backend receives request
  │   │
  │   ├─> Validate topic (not empty)
  │   │   ├─> If invalid: Return 400 error → END
  │   │   └─> If valid: Continue
  │   │
  │   ├─> Call AIService.generateFlashcards(topic, count)
  │   │   │
  │   │   ├─> If Gemini API available:
  │   │   │   ├─> Build flashcard generation prompt
  │   │   │   ├─> Call Gemini API
  │   │   │   ├─> Parse response (extract Q&A pairs)
  │   │   │   └─> Return flashcard array
  │   │   │
  │   │   └─> Else: Return fallback flashcards
  │   │
  │   └─> Return JSON response
  │       └─> { success, flashcards, topic, count }
  │
  ├─> Frontend receives response
  │   │
  │   ├─> If error: Display error message
  │   │
  │   └─> If success:
  │       ├─> Set flashcards state
  │       ├─> Render FlashcardStack component
  │       └─> Save to Firestore history (async)
  │
  ├─> Set loading state = false
  │
  ├─> Save to Firestore
  │   └─> Collection: users/{userId}/flashcardHistory
  │       └─> Document: { prompt, module, flashcards, createdAt }
  │
END
```

#### 5.1.3 Study Plan Generation Module

**Functional Requirement:** FR-003 - Create personalized weekly study plans

**Process Flow:**

```
START
  │
  ├─> User fills study plan form
  │   ├─> Select weak topics (max 5)
  │   ├─> Add time slots (time + duration)
  │   └─> Submit form
  │
  ├─> Validate form inputs
  │   ├─> weakTopics.length > 0 && <= 5
  │   ├─> preferredTimeSlots.length > 0
  │   ├─> totalDailyHours >= 2
  │   │
  │   ├─> If invalid: Show validation error → END
  │   └─> If valid: Continue
  │
  ├─> Calculate dailyHours from time slots
  │   └─> dailyHours = sum(slot.duration) / 60
  │
  ├─> POST /api/v1/plan/generate
  │   └─> Body: { userId, dailyHours, weakTopics, preferredTimeSlots }
  │
  ├─> Backend receives request
  │   │
  │   ├─> Validate request parameters
  │   │
  │   ├─> Call AIService.generateStudyPlan(...)
  │   │   │
  │   │   ├─> If Gemini API available:
  │   │   │   ├─> Build study plan prompt
  │   │   │   │   └─> Include: topics, time slots, duration, rules
  │   │   │   ├─> Call Gemini API
  │   │   │   ├─> Parse JSON response
  │   │   │   └─> Validate task structure
  │   │   │
  │   │   ├─> If parsing fails or API unavailable:
  │   │   │   ├─> Generate fallback plan
  │   │   │   ├─> Assign one topic per day (5 weekdays)
  │   │   │   ├─> Create 3-4 subtopic tasks per day
  │   │   │   └─> Add flashcard review task
  │   │   │
  │   │   └─> Return StudyPlan object
  │   │
  │   ├─> Store plan in Redis (current)
  │   │   └─> SET study_plan:{userId}:current
  │   │
  │   ├─> Store plan in Redis (history)
  │   │   └─> LPUSH study_plan:{userId}:history
  │   │   └─> LTRIM to keep last 10
  │   │
  │   └─> Return JSON response
  │       └─> { success, plan }
  │
  ├─> Frontend receives response
  │   │
  │   ├─> If error: Display error message
  │   │
  │   └─> If success:
  │       ├─> Set currentPlan state
  │       ├─> Hide plan form
  │       └─> Display plan with tasks grouped by day
  │
END
```

---

## 6. Interface Design

### 6.1 User Interface (UI)

The platform features a modern, responsive design with light/dark theme support.

#### 6.1.1 Key UI Screens

**A. Landing Page**

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] AI Study Buddy                    [Sign In] [Sign Up]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              🎓 Your AI-Powered Study Companion              │
│                                                              │
│         Personalized Learning • Smart Flashcards            │
│              AI Tutoring • Progress Tracking                │
│                                                              │
│                   [Get Started Free]                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  💬 Chat     │  │  📚 Study    │  │  🎯 Track    │      │
│  │  with AI     │  │  Plans       │  │  Progress    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**B. Chat Page (Main Interface)**

```
┌─────────────────────────────────────────────────────────────┐
│ [☀️/🌙] [Logout]                                             │
│ [Chat] [Study Plan] [Flashcards] [Profile] [Pricing]        │
├──────────────┬──────────────────────────────────────────────┤
│ 🔍 Search    │                                               │
│              │  💬 AI Study Buddy                            │
│ 📝 Threads   │  ─────────────────────────────────────────   │
│              │                                               │
│ • Calculus   │  User: What is the chain rule?               │
│ • Physics    │  ┌─────────────────────────────────────┐     │
│ • Chemistry  │  │ The chain rule is a fundamental...  │     │
│              │  └─────────────────────────────────────┘     │
│              │                                               │
│ [+ New Chat] │  AI: The chain rule states that...          │
│              │  ┌─────────────────────────────────────┐     │
│              │  │ **Explanation:** If f(x) = g(h(x)) │     │
│              │  │ then f'(x) = g'(h(x)) · h'(x)      │     │
│              │  │                                     │     │
│              │  │ **Practice:**                       │     │
│              │  │ • Find derivative of (x²+1)³        │     │
│              │  └─────────────────────────────────────┘     │
│              │                                               │
│              │  ┌─────────────────────────────────────┐     │
│              │  │ Ask a question...            [Send] │     │
│              │  └─────────────────────────────────────┘     │
└──────────────┴──────────────────────────────────────────────┘
```

**C. Flashcards Page**

```
┌─────────────────────────────────────────────────────────────┐
│ [☀️/🌙] [Logout]                                             │
│ [Chat] [Study Plan] [Flashcards] [Profile] [Pricing]        │
├──────────────┬──────────────────────────────────────────────┤
│ 📚 Topics    │                                               │
│              │        AI-Powered Flashcards                  │
│ Calculus     │        Studying: Derivatives                  │
│ • Limits     │                                               │
│ • Derivatives│  ┌───────────────────────────────────────┐   │
│ • Integrals  │  │                                       │   │
│              │  │                                       │   │
│ Physics      │  │   What is the power rule for         │   │
│ • Mechanics  │  │   derivatives?                        │   │
│ • Optics     │  │                                       │   │
│              │  │                                       │   │
│ 📜 History   │  │         [Tap to flip]                 │   │
│              │  │                                       │   │
│ • Session 1  │  │                                       │   │
│ • Session 2  │  └───────────────────────────────────────┘   │
│              │                                               │
│              │         [← Swipe to navigate →]               │
│              │              Card 3 of 8                      │
└──────────────┴──────────────────────────────────────────────┘
```

**D. Study Plan Page**

```
┌─────────────────────────────────────────────────────────────┐
│ [☀️/🌙] [Logout]                                             │
│ [Chat] [Study Plan] [Flashcards] [Profile] [Pricing]        │
├─────────────────────────────────────────────────────────────┤
│  📅 Your AI Study Plan                                       │
│  2.5 hours daily • Calculus, Physics, Chemistry             │
│                                                              │
│  Progress: ████████░░ 75% (15/20 tasks)                     │
│  Streak: 🔥 5 days                                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Monday - Calculus                                    │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ ✅ 09:00 - Review Limits (30 min)                   │   │
│  │ ✅ 14:00 - Practice Derivatives (30 min)            │   │
│  │ ⬜ 18:00 - Flashcard Review (20 min)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tuesday - Physics                                    │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ ⬜ 09:00 - Newton's Laws (30 min)                   │   │
│  │ ⬜ 14:00 - Practice Problems (30 min)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Generate New Plan] [View History]                         │
└─────────────────────────────────────────────────────────────┘
```

#### 6.1.2 UI Design Principles

- **Mobile-First:** Responsive design optimized for all screen sizes
- **Accessibility:** WCAG 2.1 AA compliant (semantic HTML, ARIA labels)
- **Theme Support:** Light and dark modes with smooth transitions
- **Animations:** Framer Motion for page transitions and micro-interactions
- **Typography:** Clear hierarchy with readable font sizes
- **Color Palette:**
  - Light Mode: Pink/Purple accents (#EC4899, #A855F7) on white/gray
  - Dark Mode: Purple/Blue accents on dark gray/black (#231E28)

### 6.2 External System Interfaces

#### 6.2.1 Google Gemini AI API

**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

**Authentication:** API Key in request header

**Request Format:**

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here"
        }
      ]
    }
  ]
}
```

**Response Format:**

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Generated content..."
          }
        ]
      }
    }
  ]
}
```

#### 6.2.2 Firebase Authentication API

**Methods Used:**

- `signInWithEmailAndPassword(auth, email, password)`
- `createUserWithEmailAndPassword(auth, email, password)`
- `signInWithPopup(auth, googleProvider)`
- `signOut(auth)`
- `onAuthStateChanged(auth, callback)`

**Token Flow:**

1. User authenticates → Firebase returns ID token
2. Frontend includes token in API requests (optional)
3. Backend validates token using Firebase Admin SDK (if needed)

#### 6.2.3 M-Pesa Daraja API

**Base URL (Sandbox):** `https://sandbox.safaricom.co.ke`
**Base URL (Production):** `https://api.safaricom.co.ke`

**Endpoints Used:**

1. **OAuth Token**

   - `GET /oauth/v1/generate?grant_type=client_credentials`
   - Auth: Basic (Base64 encoded consumer key:secret)

2. **STK Push**

   - `POST /mpesa/stkpush/v1/processrequest`
   - Body: Business shortcode, amount, phone number, callback URL

3. **Callback (Webhook)**
   - `POST /api/v1/payment/mpesa-callback` (our endpoint)
   - Receives payment confirmation from M-Pesa

**Integration Flow:**

```
User → Frontend → Backend → M-Pesa API → User's Phone
                     ↓
                  Firestore (payment record)
                     ↓
                  M-Pesa Callback → Backend → Update subscription
```

---

## 7. Deployment Design

### 7.1 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET (HTTPS)                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      FLY.IO PLATFORM                         │
│  Region: Johannesburg (jnb)                                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Load Balancer / Edge Proxy                │ │
│  │              (Auto HTTPS, Force HTTPS)                 │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │           Docker Container (Node.js App)               │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Express Server (Port 3001)                      │  │ │
│  │  │  • API Routes (/api/v1/*)                        │  │ │
│  │  │  • Static Files (React SPA)                      │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  │  Resources:                                             │ │
│  │  • CPU: 1 shared core                                  │ │
│  │  • Memory: 1024 MB                                     │ │
│  │  • Auto-stop: Enabled (min 0 machines)                 │ │
│  │  • Auto-start: Enabled                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Firebase   │   │    Redis     │   │   Google     │
│   Services   │   │  (Upstash)   │   │   Gemini     │
│              │   │              │   │     API      │
│ • Auth       │   │ • Cache      │   │              │
│ • Firestore  │   │ • Sessions   │   │ • Content    │
│              │   │              │   │   Gen        │
└──────────────┘   └──────────────┘   └──────────────┘
```

### 7.2 Deployment Strategy

#### 7.2.1 Build Process

**Multi-Stage Docker Build:**

1. **Stage 1: Build**

   ```dockerfile
   FROM node:20.18.0-slim AS build
   - Install pnpm
   - Copy workspace files
   - Install dependencies (pnpm install --frozen-lockfile)
   - Build frontend (pnpm --filter frontend build)
   - Build backend (pnpm --filter backend build)
   ```

2. **Stage 2: Runtime**
   ```dockerfile
   FROM node:20.18.0-slim AS runtime
   - Install pnpm
   - Copy built files from build stage
   - Install production dependencies only
   - Expose port 3001
   - Start backend server
   ```

#### 7.2.2 Deployment Steps

**Automated Deployment (Fly.io):**

```bash
# 1. Build Docker image
fly deploy

# 2. Fly.io automatically:
#    - Builds Docker image
#    - Pushes to registry
#    - Creates new machine
#    - Health checks on port 3001
#    - Routes traffic to new machine
#    - Stops old machine (if healthy)
```

**Manual Deployment:**

```bash
# 1. Set environment variables
fly secrets set GEMINI_API_KEY=xxx
fly secrets set FIREBASE_API_KEY=xxx
fly secrets set MPESA_CONSUMER_KEY=xxx
# ... (all required secrets)

# 2. Deploy
fly deploy --config fly.toml

# 3. Monitor logs
fly logs

# 4. Check status
fly status
```

#### 7.2.3 Environment Configuration

**Development:**

- Local Node.js server (backend: 3001, frontend: 5173)
- `.env` files for secrets
- Hot reload enabled

**Production:**

- Fly.io hosted Docker container
- Secrets managed via `fly secrets`
- Environment variables:
  - `NODE_ENV=production`
  - `PORT=3001`
  - `VITE_API_URL=https://plp-hackathon.fly.dev`

#### 7.2.4 Rollback Procedure

```bash
# 1. List recent releases
fly releases

# 2. Rollback to previous version
fly releases rollback <version>

# 3. Verify rollback
fly status
fly logs
```

#### 7.2.5 Health Checks

**Endpoint:** `GET /api/v1/status`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "environment": "production"
}
```

**Fly.io Configuration:**

- Internal port: 3001
- Force HTTPS: true
- Auto-stop/start: Enabled
- Health check interval: 30 seconds

---

## 8. Security Design

### 8.1 Authentication and Authorization

#### 8.1.1 User Authentication

**Primary Method: Firebase Authentication**

- **Email/Password Authentication:**

  - Password requirements: Minimum 6 characters (Firebase default)
  - Password hashing: Handled by Firebase (bcrypt-based)
  - Account verification: Email verification links sent on signup

- **OAuth Providers:**
  - Google Sign-In via Firebase Auth
  - Redirect-based flow for web applications
  - Automatic account linking for existing emails

**Authentication Flow:**

```
1. User submits credentials
   ↓
2. Frontend calls Firebase Auth SDK
   ↓
3. Firebase validates credentials
   ↓
4. Firebase returns ID token (JWT)
   ↓
5. Frontend stores token in memory (AuthContext)
   ↓
6. Token included in API requests (optional)
   ↓
7. Backend validates token if needed (Firebase Admin SDK)
```

**Session Management:**

- **Frontend:** Firebase Auth manages session state
- **Token Refresh:** Automatic token refresh every 1 hour
- **Logout:** `signOut()` clears all session data
- **Persistence:** Session persists across browser refreshes (localStorage)

#### 8.1.2 Authorization

**Role-Based Access Control (RBAC):**

Currently, the system has a simple authorization model:

- **Free Users:**

  - Access to basic chat functionality
  - Limited flashcard generation (rate-limited)
  - No study plan generation

- **Premium Users:**
  - Unlimited chat and flashcard generation
  - Study plan creation and tracking
  - Priority AI response times
  - Access to advanced features

**Authorization Checks:**

```javascript
if (user.subscription?.status === "active") {
} else {
}

const subscription = await getSubscription(userId);
if (!subscription || subscription.status !== "active") {
  return res.status(403).json({ error: "Premium subscription required" });
}
```

**Data Access Control:**

- **Firestore Security Rules:**

  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /users/{userId}/chatSessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /users/{userId}/flashcardHistory/{historyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /subscriptions/{subscriptionId} {
        allow read: if request.auth != null &&
                       resource.data.userId == request.auth.uid;
        allow write: if false;
      }
    }
  }
  ```

- **Redis Access Control:**
  - Keys namespaced by userId: `chat:{sessionId}:{userId}`
  - Backend validates userId matches authenticated user
  - No direct client access to Redis

### 8.2 Data Protection

#### 8.2.1 Encryption

**Data in Transit:**

- **HTTPS/TLS 1.3:** All communications encrypted
- **Certificate Management:** Automatic via Fly.io
- **Force HTTPS:** Configured in fly.toml
- **HSTS Headers:** Strict-Transport-Security enabled

**Data at Rest:**

- **Firestore:** Automatic encryption at rest (AES-256)
- **Redis/Upstash:** Encryption at rest enabled
- **Environment Variables:** Encrypted via Fly.io secrets management

**API Key Protection:**

- **Storage:** Environment variables only (never in code)
- **Access:** Restricted to backend server
- **Rotation:** Manual rotation process (documented)
- **Exposure Prevention:**
  - `.env` files in `.gitignore`
  - Secrets managed via `fly secrets set`
  - No API keys in frontend code

#### 8.2.2 Data Masking and Sanitization

**Input Validation:**

```javascript
function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/<script>/gi, "")
    .replace(/javascript:/gi, "")
    .substring(0, 5000);
}
```

**Output Encoding:**

- **Markdown Rendering:** Using `react-markdown` with safe defaults
- **XSS Prevention:** React's automatic escaping
- **SQL Injection:** N/A (NoSQL database with parameterized queries)

**PII Protection:**

- **Phone Numbers:** Masked in logs (e.g., `254XXX***789`)
- **Email Addresses:** Not logged in production
- **Payment Data:** Only transaction IDs stored (no card/account numbers)

#### 8.2.3 Rate Limiting

**API Rate Limits:**

```javascript
const rateLimit = {
  "/api/v1/ask": {
    free: "10 requests/hour",
    premium: "100 requests/hour",
  },
  "/api/v1/flashcards/generate": {
    free: "5 requests/day",
    premium: "unlimited",
  },
  "/api/v1/plan/generate": {
    free: "1 request/week",
    premium: "unlimited",
  },
};
```

**DDoS Protection:**

- Fly.io edge network provides basic DDoS protection
- Connection limits configured in fly.toml
- Future: Implement rate limiting middleware (express-rate-limit)

### 8.3 Audit and Logging

#### 8.3.1 Application Logging

**Log Levels:**

- **ERROR:** Critical failures, exceptions
- **WARN:** Deprecated features, potential issues
- **INFO:** Important events (user signup, payments)
- **DEBUG:** Detailed debugging information (dev only)

**Logged Events:**

```javascript
logger.info("User login", { userId, timestamp, ip });
logger.info("User logout", { userId, timestamp });

logger.info("Payment initiated", { userId, amount, transactionId });
logger.info("Payment completed", { userId, mpesaReceiptNumber });
logger.error("Payment failed", { userId, error, transactionId });

logger.info("AI request", { userId, endpoint, model });
logger.error("AI service error", { error, endpoint });

logger.warn("Failed login attempt", { email, ip, timestamp });
logger.warn("Rate limit exceeded", { userId, endpoint });
```

**Log Storage:**

- **Development:** Console output
- **Production:** Fly.io log aggregation
- **Retention:** 7 days (Fly.io default)
- **Access:** Via `fly logs` command (requires authentication)

#### 8.3.2 Security Monitoring

**Monitored Metrics:**

- Failed authentication attempts (potential brute force)
- Unusual API usage patterns (potential abuse)
- Payment failures and anomalies
- Error rates and service availability

**Alerting (Future Implementation):**

- Email notifications for critical errors
- Slack/Discord webhooks for payment events
- Automated alerts for service downtime

#### 8.3.3 Compliance and Privacy

**GDPR Compliance:**

- **Data Minimization:** Only essential data collected
- **User Consent:** Terms of service acceptance required
- **Right to Access:** Users can view all their data
- **Right to Deletion:** Account deletion removes all user data
- **Data Portability:** Export functionality (to be implemented)

**Data Retention Policy:**

- **User Data:** Retained until account deletion
- **Chat History:** Indefinite (user-controlled)
- **Payment Records:** 7 years (legal requirement)
- **Logs:** 7 days (operational)
- **Cache (Redis):** 7-30 days (automatic expiration)

**Privacy Measures:**

- No third-party analytics or tracking
- No data sold to third parties
- Minimal data shared with external services:
  - Firebase: Authentication and database
  - Google Gemini: User questions (anonymized)
  - M-Pesa: Payment information only
  - Upstash Redis: Temporary session data

---

## 9. References

### 9.1 External Documentation

**APIs and Services:**

1. **Google Gemini API**

   - Documentation: https://ai.google.dev/docs
   - API Reference: https://ai.google.dev/api/rest
   - Model: gemini-2.5-flash

2. **Firebase**

   - Authentication: https://firebase.google.com/docs/auth
   - Firestore: https://firebase.google.com/docs/firestore
   - Security Rules: https://firebase.google.com/docs/rules

3. **M-Pesa Daraja API**

   - Documentation: https://developer.safaricom.co.ke/docs
   - STK Push: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

4. **Upstash Redis**

   - Documentation: https://docs.upstash.com/redis
   - REST API: https://docs.upstash.com/redis/features/restapi

5. **Fly.io**
   - Documentation: https://fly.io/docs/
   - Deployment: https://fly.io/docs/languages-and-frameworks/node/

### 9.2 Technology Stack References

**Frontend:**

- React 18: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Vite: https://vitejs.dev/guide/
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/
- React Markdown: https://github.com/remarkjs/react-markdown

**Backend:**

- Node.js 20: https://nodejs.org/docs/latest-v20.x/api/
- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/docs/

**Build Tools:**

- pnpm: https://pnpm.io/
- Docker: https://docs.docker.com/
- ESLint: https://eslint.org/docs/

### 9.3 Design and Architecture Patterns

**Architectural Patterns:**

- Monorepo Architecture: https://monorepo.tools/
- RESTful API Design: https://restfulapi.net/
- Microservices Communication: https://microservices.io/

**Design Patterns:**

- Context API (State Management): https://react.dev/reference/react/useContext
- Repository Pattern (Data Access)
- Service Layer Pattern (Business Logic)
- Factory Pattern (AI Response Generation)

### 9.4 Security Standards

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- GDPR Compliance: https://gdpr.eu/
- PCI DSS (via M-Pesa): https://www.pcisecuritystandards.org/

### 9.5 Project Resources

**Repository:**

- GitHub: (Private repository)

**Deployment:**

- Production URL: https://plp-hackathon.fly.dev
- Fly.io Dashboard: https://fly.io/dashboard

**Development:**

- Local Development: http://localhost:5173 (frontend), http://localhost:3001 (backend)
