# Production Dockerfile for Node.js Express app
FROM node:22-alpine AS base

ENV NODE_ENV=production
WORKDIR /app

# Install build tools for optional native deps, then clean up
RUN apk add --no-cache python3 make g++

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Build static assets (tailwind -> public/css)
RUN npm run build || npm run build:check

# Expose port (App Runner/ECS uses PORT env to map)
EXPOSE 3000

# Healthcheck (optional but useful on ECS/App Runner)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/ || exit 1

# Start the server
CMD ["npm", "start"]


