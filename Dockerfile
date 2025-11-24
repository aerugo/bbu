# ===========================================
# Stage 1: Build the API
# ===========================================
FROM node:18-alpine AS api-builder

WORKDIR /app

# Copy API package files
COPY api/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy API source code
COPY api/tsconfig.json ./
COPY api/src/ ./src/

# Build TypeScript
RUN npm run build

# ===========================================
# Stage 2: Build the Frontend
# ===========================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY ui/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY ui/public/ ./public/
COPY ui/src/ ./src/

# Build the React app
RUN npm run build

# ===========================================
# Stage 3: Production image
# ===========================================
FROM node:18-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

# Create necessary directories
RUN mkdir -p /var/log/supervisor /var/run /usr/share/nginx/html

WORKDIR /app

# Copy API production dependencies
COPY api/package*.json ./api/
RUN cd api && npm ci --only=production && npm cache clean --force

# Copy built API from builder stage
COPY --from=api-builder /app/build ./api/build

# Copy built frontend from builder stage to nginx html directory
COPY --from=frontend-builder /app/build /usr/share/nginx/html

# Copy data file
COPY data/bbu_export.json ./data/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=4000
ENV DATA_FILE_PATH=/app/data/bbu_export.json

# Expose ports (3000 for frontend via nginx, 4000 for API internally)
EXPOSE 3000

# Health check against nginx
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ping || exit 1

# Start supervisor which manages both nginx and the API
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
