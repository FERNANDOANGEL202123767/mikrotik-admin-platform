# backend/Dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies for canvas (used by pdfGenerator)
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend package.json and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy frontend package.json and install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY backend/.env ./backend/.env
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Copy frontend build to backend public directory
RUN mkdir -p backend/public && cp -r frontend/dist/* backend/public/

# Copy icons to backend public directory
RUN mkdir -p backend/public/icons && cp -r frontend/public/icons/* backend/public/icons/

WORKDIR /app/backend

CMD ["npm", "start"]