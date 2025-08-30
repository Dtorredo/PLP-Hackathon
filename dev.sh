#!/bin/bash

# Kill any existing processes
echo "🔄 Killing existing processes..."
pkill -f "vite\|ts-node-dev" || true

# Wait a moment
sleep 2

# Start backend
echo "🚀 Starting backend on port 3001..."
pnpm dev:backend &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 3000..."
pnpm dev:frontend &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

# Check if both services are running
echo "✅ Checking services..."
if curl -s http://localhost:3001/api/v1/status > /dev/null; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎉 Development servers are running!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
