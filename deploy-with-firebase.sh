#!/bin/bash

echo "=== Fly.io Deployment with Build Args ==="

# Get Firebase secrets from Fly.io
echo "Getting Firebase secrets from Fly.io..."
FIREBASE_API_KEY=$(flyctl secrets list -a plp-hackathon | grep VITE_FIREBASE_API_KEY | awk '{print $2}')
FIREBASE_AUTH_DOMAIN=$(flyctl secrets list -a plp-hackathon | grep VITE_FIREBASE_AUTH_DOMAIN | awk '{print $2}')
FIREBASE_PROJECT_ID=$(flyctl secrets list -a plp-hackathon | grep VITE_FIREBASE_PROJECT_ID | awk '{print $2}')
FIREBASE_STORAGE_BUCKET=$(flyctl secrets list -a plp-hackathon | grep VITE_FIREBASE_STORAGE_BUCKET | awk '{print $2}')
FIREBASE_MESSAGING_SENDER_ID=$(flyctl secrets list -a plp-hackathon | grep VITE_FIREBASE_MESSAGING_SENDER_ID | awk '{print $2}')
FIREBASE_APP_ID=$(flyctl secrets list -a plp-hackathon | grep VITE_FIREBASE_APP_ID | awk '{print $2}')

# Deploy with build arguments
echo "Deploying with Firebase build arguments..."
flyctl deploy -a plp-hackathon \
  --build-arg VITE_FIREBASE_API_KEY="$FIREBASE_API_KEY" \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN" \
  --build-arg VITE_FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="$FIREBASE_STORAGE_BUCKET" \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg VITE_FIREBASE_APP_ID="$FIREBASE_APP_ID"

echo "✅ Deployment complete!"
echo "Testing deployment..."
sleep 10
curl -f https://plp-hackathon.fly.dev/api/v1/status && echo " - Backend OK"
curl -f https://plp-hackathon.fly.dev/ && echo " - Frontend OK"
