// backend/src/server.js
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const monitoringRoutes = require('./routes/monitoring');
const reportsRoutes = require('./routes/reports');
const routerRoutes = require('./routes/routes');
const { startMonitoring } = require('./services/monitoringService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://mikrotik-admin-platform.onrender.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CSP Middleware
app.use((req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; connect-src 'self' ${clientUrl} wss://mikrotik-admin-platform.onrender.com https://mikrotik-admin-platform.onrender.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'`
  );
  next();
});

// Middleware

app.use(cors({
  origin: ['http://localhost:5173', 'https://mikrotik-admin-platform.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes (must be before catch-all)
app.use('/api/auth', authRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/routers', routerRoutes);

// SPA routing (catch-all for frontend)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`[${new Date().toISOString()}] MongoDB connected`))
  .catch((err) => console.error(`[${new Date().toISOString()}] MongoDB connection error:`, err));

// Socket.IO authentication
// backend/src/server.js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log(`[${new Date().toISOString()}] Socket.IO auth attempt:`, {
    token: token ? 'present' : 'missing',
  });
  if (!token) {
    console.error(`[${new Date().toISOString()}] Socket.IO auth error: No token provided`);
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[${new Date().toISOString()}] Socket.IO auth success:`, decoded);
    socket.user = decoded;
    next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Socket.IO auth error:`, error.message);
    next(new Error(`Authentication error: ${error.message}`));
  }
});

// Start monitoring service
startMonitoring(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
});
