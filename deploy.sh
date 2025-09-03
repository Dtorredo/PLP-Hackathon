#!/bin/bash

# AI Study Buddy Fly.io Deployment Script
# This script helps deploy the application to Fly.io

echo "🚀 AI Study Buddy Fly.io Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
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

# Deploy to Fly.io
echo ""
echo "🚀 Deploying to Fly.io..."
echo "========================="

# Deploy the application
flyctl deploy -a plp-hackathon

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    
    # Test the deployment
    echo ""
    echo "🧪 Testing deployment..."
    sleep 10
    
    echo "Testing backend API..."
    if curl -f https://plp-hackathon.fly.dev/api/v1/status; then
        echo "✅ Backend is running!"
    else
        echo "❌ Backend test failed"
    fi
    
    echo "Testing frontend..."
    if curl -f https://plp-hackathon.fly.dev/; then
        echo "✅ Frontend is running!"
    else
        echo "❌ Frontend test failed"
    fi
    
    echo ""
    echo "🎉 Your application is now live at:"
    echo "   https://plp-hackathon.fly.dev"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Set your environment variables in Fly.io:"
    echo "   flyctl secrets set GOOGLE_AI_API_KEY=your_key"
    echo "   flyctl secrets set UPSTASH_REDIS_REST_URL=your_url"
    echo "   flyctl secrets set UPSTASH_REDIS_REST_TOKEN=your_token"
    echo ""
    echo "2. Update your frontend environment variables:"
    echo "   VITE_API_URL=https://plp-hackathon.fly.dev"
    echo "   VITE_FIREBASE_API_KEY=your_firebase_key"
    echo "   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain"
    echo "   VITE_FIREBASE_PROJECT_ID=your_firebase_project"
    echo ""
    echo "3. Redeploy if you updated environment variables:"
    echo "   flyctl deploy -a plp-hackathon"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi
