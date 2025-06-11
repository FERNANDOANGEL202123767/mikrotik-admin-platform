const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const routerRoutes = require('./routes/routes');
const monitoringRoutes = require('./routes/monitoring');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
// backend/src/app.js
// backend/src/app.js
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173', // Soporte para desarrollo local
    'https://miapp.onrender.com', // Dominio de Render
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routers', routerRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/reports', reportRoutes);

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling
app.use(errorHandler);

module.exports = app;

