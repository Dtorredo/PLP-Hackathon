# Deploying the Application with Firebase Configuration

To fix the `auth/api-key-not-valid` error, the application has been updated to require Firebase configuration at build time. You must now provide your Firebase project's environment variables as build arguments when building the Docker image.

## Building the Docker Image

To build the image for deployment, you need to pass your Firebase configuration using `--build-arg`.

Here is an example command:

```bash
docker build . -t my-app \\
  --build-arg VITE_FIREBASE_API_KEY="your_api_key" \\
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain" \\
  --build-arg VITE_FIREBASE_PROJECT_ID="your_project_id" \\
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket" \\
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id" \\
  --build-arg VITE_FIREBASE_APP_ID="your_app_id" \\
  --build-arg VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
```

Replace `"your_..."` with your actual Firebase project configuration values.

## Deploying to Fly.io

When deploying to Fly.io, you can use the same build arguments with the `flyctl deploy` command. Fly.io will pass these to the Docker build process.

```bash
flyctl deploy \\
  --build-arg VITE_FIREBASE_API_KEY="your_api_key" \\
  --build-arg VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain" \\
  --build-arg VITE_FIREBASE_PROJECT_ID="your_project_id" \\
  --build-arg VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket" \\
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id" \\
  --build-arg VITE_FIREBASE_APP_ID="your_app_id" \\
  --build-arg VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
```

**Important:** It is recommended to use secrets management for these values rather than passing them directly on the command line, especially in a CI/CD environment. For Fly.io, you can set these as secrets and then use them in your deployment process. However, for the build process to access them, you must use build arguments as shown above.
