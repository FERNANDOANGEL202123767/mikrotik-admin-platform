const express = require('express');
const ReportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/generate', auth, ReportController.generateReport);

module.exports = router;


