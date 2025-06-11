const express = require('express');
const MonitoringController = require('../controllers/monitoringController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:routerId', auth, MonitoringController.getMonitoringData);
router.get('/', auth, MonitoringController.getAllMonitoringData);

module.exports = router;


