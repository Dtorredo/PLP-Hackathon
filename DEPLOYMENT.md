# Fly.io Deployment Guide

## Prerequisites

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login to Fly: `flyctl auth login`
3. Create app: `flyctl apps create plp-hackathon`

## Environment Variables Setup

### 1. M-Pesa Daraja API Secrets

```bash
flyctl secrets set \
  MPESA_CONSUMER_KEY="6bR1vxevErGCebyZtkOG3Kg2H90xG6i4cidECqRbpP5AwyZJ" \
  MPESA_CONSUMER_SECRET="yRR5m8pt6KQCvRPoM06y4mC8IsvL5GjetVMVjfB4yjcWSBOFdvW2QHJVzVKaxTEY" \
  MPESA_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919" \
  MPESA_BUSINESS_SHORTCODE="174379"
```

### 2. Google AI API Key

```bash
flyctl secrets set GEMINI_API_KEY="AIzaSyAjmbLFqxETp-xrYyCZHwJ0nx6YlE-g3Jw"
```

### 3. Firebase Configuration

```bash
flyctl secrets set \
  FIREBASE_API_KEY="your_firebase_api_key" \
  FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com" \
  FIREBASE_PROJECT_ID="your_project_id" \
  FIREBASE_STORAGE_BUCKET="your_project.appspot.com" \
  FIREBASE_MESSAGING_SENDER_ID="your_sender_id" \
  FIREBASE_APP_ID="your_app_id"
```

### 4. Redis Configuration (Optional - for production Redis)

```bash
flyctl secrets set \
  REDIS_HOST="your_redis_host" \
  REDIS_PORT="your_redis_port" \
  REDIS_PASSWORD="your_redis_password"
```

## Deployment

1. **Build and Deploy:**

```bash
flyctl deploy --build-only --push -a plp-hackathon
```

2. **Deploy the app:**

```bash
flyctl deploy -a plp-hackathon
```

3. **Check deployment status:**

```bash
flyctl status -a plp-hackathon
```

4. **View logs:**

```bash
flyctl logs -a plp-hackathon
```

## Post-Deployment

1. **Update frontend environment variables** for production:

   - Create `frontend/.env.production` with:

   ```env
   VITE_API_URL=https://plp-hackathon.fly.dev
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

2. **Deploy frontend separately** (if needed):

   - You can deploy the frontend to Vercel, Netlify, or another platform
   - Or build and serve it from the same Fly.io app

3. **Test the deployment:**

```bash
curl https://plp-hackathon.fly.dev/api/v1/status
```

## Troubleshooting

### Build Issues

- If TypeScript build fails, ensure all dev dependencies are installed
- Check that `tsconfig.json` files are properly configured

### Runtime Issues

- Check logs: `flyctl logs -a plp-hackathon`
- Verify secrets are set: `flyctl secrets list -a plp-hackathon`
- Check app status: `flyctl status -a plp-hackathon`

### M-Pesa Issues

- Ensure callback URL is publicly accessible
- Verify all M-Pesa credentials are correct
- Check that the business shortcode is active

## Scaling

- **Scale up:** `flyctl scale count 2 -a plp-hackathon`
- **Scale down:** `flyctl scale count 1 -a plp-hackathon`
- **Add memory:** `flyctl scale memory 1024 -a plp-hackathon`
