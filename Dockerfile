# Stage 1 — dependencies + build
FROM node:20.18.0-slim AS build

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config files first (for efficient layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspaces
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy rest of repository
COPY . .

# Set environment variables for frontend build
ARG VITE_API_URL=https://plp-hackathon.fly.dev
ENV VITE_API_URL=$VITE_API_URL

# Debug: show the build arg value (optional)
RUN echo "VITE_API_URL during build: $VITE_API_URL"
RUN echo "VITE_FIREBASE_API_KEY during build: $VITE_FIREBASE_API_KEY"

# Build frontend and backend explicitly (use workspace filtering)
RUN pnpm --filter frontend build
RUN pnpm --filter backend build

# Verify build output (optional, helpful while debugging)
RUN ls -la frontend/dist || true
RUN ls -la backend/dist || true

# Stage 2 — runtime (small image with only what's needed)
FROM node:20.18.0-slim AS runtime

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config files from build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/pnpm-workspace.yaml ./

# Copy backend package.json
COPY --from=build /app/backend/package.json ./backend/

# Install only production deps for backend, from the workspace root
RUN pnpm --filter backend install --prod --frozen-lockfile

# Copy built backend and frontend files from build stage
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./backend/dist/frontend

# Set node env
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the backend
WORKDIR /app/backend
CMD ["pnpm", "start"]