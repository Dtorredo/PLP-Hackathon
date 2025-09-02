#!/bin/bash

echo "=== Create Local Environment File ==="
echo "This will create frontend/.env.local with your Firebase configuration"
echo ""

# Create the file
cat > frontend/.env.local << 'EOF'
# Firebase Configuration for Local Development
VITE_FIREBASE_API_KEY=AIzaSyC-Q9E-YAswbpSP1ycampSfghuKpKh7g6E
VITE_FIREBASE_AUTH_DOMAIN=study-buddy-cd400.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=study-buddy-cd400
VITE_FIREBASE_STORAGE_BUCKET=study-buddy-cd400.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=431747981964
VITE_FIREBASE_APP_ID=1:431747981964:web:cd0f7c34f8bd36ad3c11a9

# API Configuration
VITE_API_URL=http://localhost:3001
EOF

echo "✅ Created frontend/.env.local"
echo ""
echo "⚠️  IMPORTANT: You need to edit this file and replace the placeholder values"
echo "   with your actual Firebase configuration from the Firebase Console."
echo ""
echo "   Open frontend/.env.local in your editor and update the values."
echo ""
echo "   Then restart your development server:"
echo "   pnpm run dev:frontend"
