# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY api/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY api/tsconfig.json ./
COPY api/src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and install production dependencies only
COPY api/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Copy data file from repository
COPY data/bbu_export.json ./data/

# Set environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=4000
ENV DATA_FILE_PATH=/app/data/bbu_export.json

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/ping || exit 1

# Start the server
CMD ["node", "build/index.js"]
