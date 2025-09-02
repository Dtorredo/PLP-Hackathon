#!/bin/bash

echo "=== Deploy to Fly.io ==="

# Build locally first to test
echo "Building locally..."
pnpm run build

# Deploy to Fly.io
echo "Deploying to Fly.io..."
flyctl deploy -a plp-hackathon

echo "✅ Deployment complete!"
echo "Testing deployment..."
sleep 10
curl -f https://plp-hackathon.fly.dev/api/v1/status && echo " - Backend OK"
curl -f https://plp-hackathon.fly.dev/ && echo " - Frontend OK"

echo ""
echo "If you still see a black page, check the browser console for errors."
echo "The Firebase error should now be resolved with fallback values."
