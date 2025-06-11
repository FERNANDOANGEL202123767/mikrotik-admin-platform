// backend/src/services/monitoringService.js
const MonitoringData = require('../models/MonitoringData');
const MikrotikService = require('./mikrotikService');
const NotificationService = require('./notificationService');
const config = require('../config/mikrotik');

class MonitoringService {
  constructor() {
    // Bind methods to ensure `this` refers to the instance
    this.startMonitoring = this.startMonitoring.bind(this);
    this.storeMonitoringData = this.storeMonitoringData.bind(this);
    this.checkAlerts = this.checkAlerts.bind(this);
    this.getMonitoringData = this.getMonitoringData.bind(this);
    this.getAllMonitoringData = this.getAllMonitoringData.bind(this);
    this.calculateMemoryUsage = this.calculateMemoryUsage.bind(this);
  }

  // backend/src/services/monitoringService.js
async startMonitoring(io) {
  console.log(`[${new Date().toISOString()}] Starting monitoring service`);
  config.forEach(({ id, ip, user }) => {
    setInterval(async () => {
      try {
        console.log(`[${new Date().toISOString()}] Monitoring router: ${id} (${ip})`);
        const [systemResource, bandwidth, connectedDevices] = await Promise.all([
          MikrotikService.getSystemResource(id),
          MikrotikService.getBandwidth(id),
          MikrotikService.getConnectedDevices(id),
        ]);

        const record = {
          timestamp: new Date().toISOString(),
          routerId: id,
          online: true,
          cpu: parseInt(systemResource['cpu-load'] || 0),
          memory: this.calculateMemoryUsage(systemResource),
          'rx-bytes': parseFloat(bandwidth['rx-bits-per-second'] || 0),
          'tx-bytes': parseFloat(bandwidth['tx-bits-per-second'] || 0),
          uptime: systemResource.uptime || '0s',
          connectedDevices,
          systemResource,
          bandwidth,
        };

        console.log(`[${new Date().toISOString()}] Emitting data for ${id}:`, JSON.stringify(record, null, 2));
        await this.storeMonitoringData(id, record);
        await this.checkAlerts(id, systemResource, bandwidth);

        io.emit('monitoringData', { [id]: record });
        io.emit('alert', {
          severity: 'info',
          message: `${id} monitoring data updated`,
          routerId: id,
        });
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching data for ${id}:`, error.message);
        const offlineRecord = { [id]: { online: false, timestamp: new Date().toISOString() } };
        io.emit('monitoringData', offlineRecord);
        io.emit('alert', {
          severity: 'critical',
          message: `${id} is offline: ${error.message}`,
          routerId: id,
        });
      }
    }, process.env.MONITORING_INTERVAL || 10000);
  });
}

  async getMonitoringData(routerId) {
    return await MonitoringData.find({ routerId }).sort({ timestamp: -1 }).limit(100);
  }

  async getAllMonitoringData() {
    const data = {};
    for (const router of config) {
      data[router.id] = await this.getMonitoringData(router.id);
    }
    return data;
  }

  calculateMemoryUsage(resource) {
    const total = parseInt(resource['total-memory']) || 1;
    const free = parseInt(resource['free-memory']) || 0;
    return ((total - free) / total) * 100;
  }

  async checkAlerts(routerId, systemResource, bandwidth) {
    const cpuLoad = parseInt(systemResource['cpu-load'] || 0);
    const memoryUsage = this.calculateMemoryUsage(systemResource);
    const bandwidthUsage = parseInt(bandwidth['rx-bits-per-second'] || 0) + parseInt(bandwidth['tx-bits-per-second'] || 0);

    if (cpuLoad > (process.env.ALERT_THRESHOLD_CPU || 80)) {
      NotificationService.sendAlert({
        severity: 'critical',
        message: `${routerId} CPU usage exceeded ${process.env.ALERT_THRESHOLD_CPU || 80}%: ${cpuLoad}%`,
        routerId,
      });
    }

    if (memoryUsage > (process.env.ALERT_THRESHOLD_RAM || 85)) {
      NotificationService.sendAlert({
        severity: 'warning',
        message: `${routerId} RAM usage exceeded ${process.env.ALERT_THRESHOLD_RAM || 85}%: ${memoryUsage.toFixed(2)}%`,
        routerId,
      });
    }

    if (bandwidthUsage > (parseInt(process.env.ALERT_THRESHOLD_BANDWIDTH || 90) * 1024 * 1024)) {
      NotificationService.sendAlert({
        severity: 'warning',
        message: `${routerId} Bandwidth usage exceeded threshold`,
        routerId,
      });
    }
  }

  async storeMonitoringData(routerId, record) {
    await MonitoringData.create({
      routerId,
      timestamp: record.timestamp,
      online: record.online,
      cpu: record.cpu,
      memory: record.memory,
      'rx-bytes': record['rx-bytes'],
      'tx-bytes': record['tx-bytes'],
      uptime: record.uptime,
      connectedDevices: record.connectedDevices,
      systemResource: record.systemResource,
      bandwidth: record.bandwidth,
    });

    const count = await MonitoringData.countDocuments({ routerId });
    if (count > 100) {
      const oldest = await MonitoringData.find({ routerId })
        .sort({ timestamp: 1 })
        .limit(count - 100);
      await MonitoringData.deleteMany({ _id: { $in: oldest.map((doc) => doc._id) } });
    }
  }
}

module.exports = new MonitoringService();