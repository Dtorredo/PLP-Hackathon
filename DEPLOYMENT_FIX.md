# Fly.io Deployment Fix Guide

## Issues Fixed

1. **Static File Path Issue**: Backend was looking for frontend files in the wrong location
2. **Content Security Policy**: Updated CSP to allow WebSocket connections and fonts
3. **Vite Configuration**: Added proper build configuration for production
4. **Error Handling**: Added better error handling and debugging endpoints

## Deployment Steps

### 1. Build and Deploy

```bash
# Build the project
pnpm run build

# Deploy to Fly.io
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

## Local Testing

To test the deployment locally before pushing to Fly.io:

```bash
# Setup development environment
pnpm run setup:dev

# Start the server
pnpm run start:dev

# Test locally
curl http://localhost:3001/
curl http://localhost:3001/api/v1/status
```
