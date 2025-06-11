// backend/src/controllers/routerController.js
const MikrotikService = require('../services/mikrotikService');

class RouterController {

  async getSystemInfo(req, res) {
  const { routerId } = req.params;
  try {
    const systemInfo = await MikrotikService.getSystemInfo(routerId);
    res.json(systemInfo);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching system info for ${routerId}:`, error);
    res.status(500).json({ error: 'Failed to fetch system info' });
  }
};

async executeCommand(req, res) {
  const { routerId } = req.params;
  const { command } = req.body;
  try {
    const result = await MikrotikService.executeCommand(routerId, command);
    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error executing command for ${routerId}:`, error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
};

  async getInterfaces(req, res) {
    try {
      const { routerId } = req.params;
      const data = await MikrotikService.getInterfaces(routerId);
      res.json(data);
    } catch (error) {
      console.error('Error fetching interfaces:', error);
      res.status(500).json({ error: 'Failed to fetch interfaces', details: error.message });
    }
  }

  async getConnectedDevices(req, res) {
    try {
      const { routerId } = req.params;
      const data = await MikrotikService.getConnectedDevices(routerId);
      res.json(data);
    } catch (error) {
      console.error('Error fetching connected devices:', error);
      res.status(500).json({ error: 'Failed to fetch connected devices', details: error.message });
    }
  }
}

module.exports = new RouterController();