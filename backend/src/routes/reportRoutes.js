
// backend/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {generateReport} = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

router.post('/generate', authMiddleware, generateReport);
module.exports = router;