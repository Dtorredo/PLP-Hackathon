# Fly.io Deployment Fix Guide

## Issues Fixed

1. **Static File Path Issue**: Backend was looking for frontend files in the wrong location
2. **Content Security Policy**: Updated CSP to allow WebSocket connections and fonts
3. **Vite Configuration**: Added proper build configuration for production
4. **Error Handling**: Added better error handling and debugging endpoints
5. **Firebase Configuration**: Fixed environment variable handling

## Current Status

✅ **Backend**: Working correctly on Fly.io
✅ **Frontend**: Serving correctly on Fly.io  
✅ **Static Files**: Properly configured
✅ **Environment Variables**: Set in Fly.io secrets

## Deployment Steps

### 1. Deploy to Fly.io (Current Working Method)

```bash
# Simple deployment - uses secrets already set in Fly.io
flyctl deploy -a plp-hackathon
```

### 2. Check Deployment Status

```bash
# Check app status
flyctl status -a plp-hackathon

# View logs
flyctl logs -a plp-hackathon
```

### 3. Test the Deployment

```bash
# Test health endpoint
curl https://plp-hackathon.fly.dev/api/v1/status

# Test debug endpoint (for troubleshooting)
curl https://plp-hackathon.fly.dev/api/v1/debug/static

# Test frontend
curl https://plp-hackathon.fly.dev/
```

## Local Development Setup

### 1. Create Environment Files

The following files need to be created manually (they're in .gitignore for security):

**Frontend** (`frontend/.env.local`):

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3001
```

**Backend** (`backend/.env`):

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=https://peaceful-corgi-9538.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 2. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend && pnpm start

# Terminal 2 - Frontend
cd frontend && pnpm dev
```

## Troubleshooting

### If you still see a black page:

1. **Check the logs**:

   ```bash
   flyctl logs -a plp-hackathon
   ```

2. **Check the debug endpoint**:

   ```bash
   curl https://plp-hackathon.fly.dev/api/v1/debug/static
   ```

3. **Verify environment variables**:
   ```bash
   flyctl secrets list -a plp-hackathon
   ```

### Common Issues:

- **Missing environment variables**: Ensure all required secrets are set
- **Build failures**: Check that the build process completes successfully
- **Port issues**: Ensure the app is listening on port 3001 (as configured in fly.toml)

## Current Working Configuration

The application is currently deployed and working on Fly.io with:

- ✅ Backend API responding correctly
- ✅ Frontend serving correctly
- ✅ Static files properly configured
- ✅ Environment variables set in Fly.io secrets

The main fixes applied:

1. Fixed static file paths in backend
2. Updated Content Security Policy
3. Improved Vite configuration
4. Added error handling and debugging
5. Simplified Firebase configuration
