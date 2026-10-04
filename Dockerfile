# Stage 1: Build the React + Vite static bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Production Node.js server with SQLite, Coinbase CDP & Solana RPC proxying
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV DATA_DIR=/app/data

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server and database files
COPY server.js db.js ./

# Data volume for persistent SQLite database
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/health || exit 1

# Start production server
CMD ["node", "server.js"]
