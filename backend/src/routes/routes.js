// backend/src/routes/routes.js
const express = require('express');
const RouterController = require('../controllers/routerController');
const auth = require('../middleware/auth');
const config = require('../config/mikrotik');

const router = express.Router();

// New route to list routers
router.get('/', auth, (req, res) => {
  console.log(`[${new Date().toISOString()}] Fetching routers for user:`, req.user?.username);
  try {
    const routers = config.map(({ id, ip }) => ({ id, ip }));
    res.json(routers);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching routers:`, error);
    res.status(500).json({ message: 'Error fetching routers' });
  }
});

router.get('/:routerId/system', auth, RouterController.getSystemInfo);
router.get('/:routerId/interfaces', auth, RouterController.getInterfaces);
router.get('/:routerId/devices', auth, RouterController.getConnectedDevices);
router.post('/:routerId/execute', auth, RouterController.executeCommand);
router.post('/:routerId/command', auth, RouterController.executeCommand);

module.exports = router;