# Multi-stage build for better optimization
FROM node:20-slim

WORKDIR /app

# Install system dependencies for canvas (used by pdfGenerator)
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy and build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Limpiar manualmente antes del build
RUN rm -rf dist
RUN npm run build

# Copy backend source
WORKDIR /app
COPY backend ./backend

# Copy frontend build to backend public directory
RUN mkdir -p backend/public && cp -r frontend/dist/* backend/public/

# Copy icons to backend public directory (if they exist)
RUN if [ -d "frontend/public/icons" ]; then \
        mkdir -p backend/public/icons && \
        cp -r frontend/public/icons/* backend/public/icons/; \
    fi

# Set working directory to backend for the final command
WORKDIR /app/backend

# Expose port (adjust if your app uses a different port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
