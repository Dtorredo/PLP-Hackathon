#!/bin/bash

echo "=== Deployment Debug Script ==="

# Build the project
echo "Building project..."
pnpm run build

# Check if frontend dist exists
echo "Checking frontend build..."
if [ -d "frontend/dist" ]; then
    echo "✅ Frontend dist directory exists"
    ls -la frontend/dist/
    echo "Frontend dist contents:"
    find frontend/dist -type f
else
    echo "❌ Frontend dist directory missing"
fi

# Check if backend dist exists
echo "Checking backend build..."
if [ -d "backend/dist" ]; then
    echo "✅ Backend dist directory exists"
    ls -la backend/dist/
else
    echo "❌ Backend dist directory missing"
fi

# Check Docker build
echo "Building Docker image..."
docker build -t hackathon-debug .

# Run container for testing
echo "Running container for testing..."
docker run --rm -p 3001:3001 hackathon-debug &
CONTAINER_PID=$!

# Wait for container to start
sleep 10

# Test health endpoint
echo "Testing health endpoint..."
curl -f http://localhost:3001/api/v1/status || echo "Health endpoint failed"

# Test debug endpoint
echo "Testing debug endpoint..."
curl -f http://localhost:3001/api/v1/debug/static || echo "Debug endpoint failed"

# Test frontend
echo "Testing frontend..."
curl -f http://localhost:3001/ || echo "Frontend failed"

# Stop container
kill $CONTAINER_PID

echo "=== Debug complete ==="
