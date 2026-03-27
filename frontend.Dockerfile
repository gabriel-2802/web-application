# Development Stage: Run React with npm start
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/tsconfig.json ./
# tsconfig.node.json is optional - only copy if present
COPY frontend/tsconfig*.json ./

# React dev server port
EXPOSE 3000

# Health check for the dev server
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start React development server, binding to all interfaces
CMD ["npm", "start"]
