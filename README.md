# AI Study Buddy 🧠📚

A comprehensive AI-powered study assistant that helps students learn smarter, track progress, and ace their exams with personalized study plans and instant answers.

## ✨ Features

### 🎯 Core Learning Features
- **AI-Powered Q&A**: Get instant, accurate answers with source citations and explanations
- **Personalized Quizzes**: Adaptive quizzes that focus on your weak areas
- **Study Planning**: AI-generated study plans that adapt to your schedule and learning pace
- **Progress Tracking**: Monitor your strengths and weaknesses across different topics

### 🏆 Gamification
- **Points System**: Earn points for correct answers and completed tasks
- **Streaks**: Build daily study streaks to maintain motivation
- **Badges**: Unlock achievements as you progress
- **Progress Visualization**: Beautiful charts and progress bars

### 🎨 User Experience
- **Modern UI**: Clean, responsive design built with React and Tailwind CSS
- **Smooth Animations**: Engaging interactions powered by Framer Motion
- **Mobile-First**: Optimized for all devices
- **Real-time Updates**: Instant feedback and progress updates

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Free AI Models** (Hugging Face compatible)
- **Mock Redis** for data storage (easily replaceable with real Redis)

### AI & ML
- **Free AI Models**: Uses Hugging Face inference API (when token provided)
- **Fallback System**: Intelligent fallback responses for reliable operation
- **Context-Aware**: Understands study context and provides relevant answers

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PLP-Hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Frontend on http://localhost:3000
   npm run dev:backend   # Backend on http://localhost:3001
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the AI Study Buddy in action!

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Optional: Hugging Face API token for enhanced AI responses
HF_TOKEN=your_huggingface_token_here

# Server configuration
PORT=3001
NODE_ENV=development
```

### AI Model Configuration

The system works out of the box with intelligent fallback responses. To enhance AI capabilities:

1. Get a free Hugging Face token from [huggingface.co](https://huggingface.co)
2. Add it to your `.env` file
3. The system will automatically use free AI models for enhanced responses

## 📱 Usage

### Getting Started
1. **Landing Page**: Learn about the features and get started
2. **Onboarding**: Quick setup with your name, email, and subjects
3. **Main Dashboard**: Access all learning features

### Learning Features
- **Ask & Learn**: Chat with AI about any subject
- **Study Plan**: Get personalized study schedules
- **Quiz Mode**: Test your knowledge with adaptive quizzes
- **Profile**: Track your progress and achievements

### Tips for Best Results
- Ask specific questions for better AI responses
- Complete daily study tasks to maintain streaks
- Take quizzes regularly to identify weak areas
- Use the feedback system to improve AI responses

## 🚀 Deployment

### Vercel (Frontend)
The project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Backend Deployment
Deploy the backend to any Node.js hosting service:

- **Railway**: Easy deployment with Redis support
- **Render**: Free tier available
- **Fly.io**: Global deployment
- **Heroku**: Classic platform

### Environment Setup for Production
```env
NODE_ENV=production
PORT=3001
# Add your production Redis URL if using real Redis
REDIS_URL=your_redis_url_here
```

## 🔍 API Endpoints

### Core Endpoints
- `POST /api/v1/ask` - Ask questions and get AI responses
- `POST /api/v1/quiz/start` - Start a new quiz
- `POST /api/v1/quiz/answer` - Submit quiz answers
- `POST /api/v1/plan/generate` - Generate personalized study plans
- `POST /api/v1/answer/feedback` - Provide feedback on AI responses

### Health Check
- `GET /api/v1/status` - Service health status

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for hackathon projects and educational purposes
- Uses free AI models to keep costs low
- Inspired by the need for accessible, AI-powered education tools

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/PLP-Hackathon/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic AI Q&A system
- ✅ Quiz functionality
- ✅ Study planning
- ✅ Progress tracking

### Phase 2 (Future)
- 🔄 Real Redis integration
- 🔄 Advanced AI model integration
- 🔄 Voice input support
- 🔄 Document upload and processing
- 🔄 Collaborative study groups

### Phase 3 (Advanced)
- 🔄 Adaptive learning algorithms
- 🔄 Multi-language support
- 🔄 Advanced analytics
- 🔄 Mobile app development

---

**Built with ❤️ for the hackathon community**

*Transform your learning experience with AI-powered education!*
