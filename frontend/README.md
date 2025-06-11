MikroTik Admin Platform
A centralized platform for managing MikroTik routers, built with React, Node.js, Express, MongoDB, and Socket.IO. Supports real-time monitoring and PWA functionality.
Setup
Prerequisites

Node.js 18+
MongoDB (local or MongoDB Atlas)
Docker (for deployment)

Local Development

Clone the repository:git clone <repository-url>
cd mikrotik-admin-platform


Install backend dependencies:cd backend
npm install


Install frontend dependencies:cd ../frontend
npm install


Set up environment variables:
Copy backend/.env.example to backend/.env and fill in the values.
Copy frontend/.env.example to frontend/.env and fill in the values.


Start MongoDB locally or use MongoDB Atlas.
Run the backend:cd backend
npm run dev


Run the frontend:cd ../frontend
npm run dev


Access the app at http://localhost:5173.

Deployment

Deploy to Render using the Dockerfile.
Set environment variables in Render's dashboard.
Use MongoDB Atlas for the database.

Environment Variables

MONGODB_URI: MongoDB connection string
MIKROTIK1_IP, MIKROTIK1_USER, MIKROTIK1_PASS: MikroTik router 1 credentials
MIKROTIK2_IP, MIKROTIK2_USER, MIKROTIK2_PASS: MikroTik router 2 credentials
JWT_SECRET: Secret for JWT tokens
JWT_EXPIRE: JWT expiration time
VITE_API_BASE_URL: Frontend API base URL
VITE_SOCKET_URL: WebSocket URL

