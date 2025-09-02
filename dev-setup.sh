#!/bin/bash

echo "=== Development Setup Script ==="

# Build both frontend and backend
echo "Building project..."
pnpm run build

# Copy frontend files to backend dist for local development
echo "Copying frontend files to backend dist..."
mkdir -p backend/dist/frontend
cp -r frontend/dist/* backend/dist/frontend/

# Copy public files
mkdir -p backend/dist/frontend/public
cp -r frontend/public/* backend/dist/frontend/public/

echo "✅ Development setup complete!"
echo "You can now run: cd backend && pnpm start"
