# Use the official Node.js 20 image.
FROM node:20.18.0-slim as base

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy workspace dependency configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json from each workspace
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install all dependencies (including dev dependencies for building)
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Build the project
RUN pnpm run build

# The command to run the backend server
CMD ["pnpm", "--filter", "backend", "start"]
