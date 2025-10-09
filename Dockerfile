# Multi-stage Dockerfile: builds client, installs server, serves SPA via Express

# ---- Build client ----
FROM node:20-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY client/ ./
RUN npm run build

# ---- Install server ----
FROM node:20-alpine AS server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --no-audit --no-fund
COPY server/ ./

# ---- Runtime image ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy server app
COPY --from=server /app/server /app/server

# Copy client build into server/public
RUN mkdir -p /app/server/public
COPY --from=client /app/client/dist/ /app/server/public/

# Render provides PORT env var; our server reads process.env.PORT
EXPOSE 10000

CMD ["node", "server/index.js"]


