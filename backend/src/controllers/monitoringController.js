const MonitoringData = require('../models/MonitoringData');

exports.getMonitoringData = async (req, res) => {
  try {
    const { routerId } = req.params;
    console.log(`[${new Date().toISOString()}] Fetching monitoring data for routerId: ${routerId}`);
    const monitoringData = await MonitoringData.find({ routerId })
      .sort({ timestamp: -1 })
      .limit(100);
    console.log(`[${new Date().toISOString()}] Found ${monitoringData.length} records for ${routerId}`);
    res.json(monitoringData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching monitoring data:`, error);
    res.status(500).json({ error: 'Failed to fetch monitoring data' });
  }
};

exports.getAllMonitoringData = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all monitoring data`);
    const monitoringData = await MonitoringData.find()
      .sort({ timestamp: -1 })
      .limit(100);
    console.log(`[${new Date().toISOString()}] Found ${monitoringData.length} records`);
    res.json(monitoringData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching all monitoring data:`, error);
    res.status(500).json({ error: 'Failed to fetch all monitoring data' });
  }
};