FROM node:20-alpine

WORKDIR /app

# copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# dependencies
RUN npm ci --legacy-peer-deps

# copy source code
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/tsconfig.json ./
COPY frontend/tsconfig*.json ./

# react dev server port
EXPOSE 3000

# health check for the dev server
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["npm", "start"]
