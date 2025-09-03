#!/bin/bash

# AI Study Buddy Deployment Script
# This script helps deploy the application to production

echo "🚀 AI Study Buddy Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build both frontend and backend
echo "📦 Building applications..."

echo "Building backend..."
cd backend
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

echo "Building frontend..."
cd frontend
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo "✅ Build completed successfully!"

# Check environment variables
echo ""
echo "🔧 Environment Variables Check"
echo "============================="

echo "Backend environment variables needed:"
echo "  - GOOGLE_AI_API_KEY"
echo "  - UPSTASH_REDIS_REST_URL"
echo "  - UPSTASH_REDIS_REST_TOKEN"
echo ""

echo "Frontend environment variables needed:"
echo "  - VITE_API_URL (your deployed backend URL)"
echo "  - VITE_FIREBASE_API_KEY"
echo "  - VITE_FIREBASE_AUTH_DOMAIN"
echo "  - VITE_FIREBASE_PROJECT_ID"
echo ""

echo "📋 Deployment Instructions:"
echo "1. Deploy backend to your chosen platform (Railway, Render, etc.)"
echo "2. Set the backend environment variables"
echo "3. Deploy frontend to Vercel/Netlify/etc."
echo "4. Set VITE_API_URL to your backend URL"
echo "5. Set Firebase environment variables"
echo ""

echo "🎯 Quick Commands:"
echo "  Backend: cd backend && pnpm build"
echo "  Frontend: cd frontend && pnpm build"
echo ""

echo "✅ Deployment script completed!"
echo "Remember to set your environment variables in your deployment platform!"
