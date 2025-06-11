// backend/src/monitoring/monitoring.js
const MikrotikService = require('../services/mikrotikService');
const MonitoringData = require('../models/MonitoringData');
const mikrotikConfig = require('../config/mikrotik');
const NotificationService = require('../services/notificationService');

class Monitoring {
  constructor(io) {
    this.io = io;
    this.data = {};
  }

  async start() {
    console.log(`[${new Date().toISOString()}] Starting monitoring service`);
    setInterval(async () => {
      await this.collectAndEmitData();
    }, process.env.MONITORING_INTERVAL || 30000);
    await this.collectAndEmitData(); // Initial collection
  }

  async collectAndEmitData() {
    const monitoringData = {};
    for (const router of mikrotikConfig) {
      const routerId = router.id;
      try {
        console.log(`[${new Date().toISOString()}] Monitoring router: ${routerId}`);
        const [systemResource, bandwidth, connectedDevices] = await Promise.all([
          MikrotikService.getSystemResource(routerId),
          MikrotikService.getBandwidth(routerId),
          MikrotikService.getConnectedDevices(routerId),
        ]);

        const cpuLoad = parseInt(systemResource['cpu-load'] || 0);
        const totalMemory = parseInt(systemResource['total-memory'] || 1);
        const freeMemory = parseInt(systemResource['free-memory'] || 0);
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
        const rxBits = parseFloat(bandwidth['rx-bits-per-second'] || 0);
        const txBits = parseFloat(bandwidth['tx-bits-per-second'] || 0);

        const record = {
          timestamp: new Date().toISOString(),
          routerId,
          online: true,
          cpu: cpuLoad,
          memory: memoryUsage,
          'rx-bytes': rxBits,
          'tx-bytes': txBits,
          uptime: systemResource.uptime || '0s',
          connectedDevices: connectedDevices,
          systemResource,
          bandwidth,
        };

        console.log(`[${new Date().toISOString()}] Data for ${routerId}:`, JSON.stringify(record, null, 2));

        await MonitoringData.create(record);

        // Keep only the latest 100 records
        const count = await MonitoringData.countDocuments({ routerId });
        if (count > 100) {
          const oldest = await MonitoringData.find({ routerId })
            .sort({ timestamp: 1 })
            .limit(count - 100);
          await MonitoringData.deleteMany({ _id: { $in: oldest.map(doc => doc._id) } });
        }

        await this.checkAlerts(routerId, systemResource, bandwidth);

        monitoringData[routerId] = record;
        this.io.emit('monitoringData', monitoringData);
        this.io.emit('alert', {
          severity: 'info',
          message: `${routerId} monitoring data updated`,
          routerId,
        });
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Monitoring error for ${routerId}:`, error.message);
        monitoringData[routerId] = {
          timestamp: new Date().toISOString(),
          routerId,
          online: false,
        };
        this.io.emit('monitoringData', monitoringData);
        this.io.emit('alert', {
          severity: 'critical',
          message: `${routerId} is offline: ${error.message}`,
          routerId,
        });
      }
    }
  }

  async checkAlerts(routerId, systemResource, bandwidth) {
    const cpuLoad = parseInt(systemResource['cpu-load'] || 0);
    const totalMemory = parseInt(systemResource['total-memory'] || 1);
    const freeMemory = parseInt(systemResource['free-memory'] || 0);
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
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

    if (bandwidthUsage > (process.env.ALERT_THRESHOLD_BANDWIDTH * 1024 * 1024 || 90 * 1024 * 1024)) {
      NotificationService.sendAlert({
        severity: 'warning',
        message: `${routerId} Bandwidth usage exceeded threshold`,
        routerId,
      });
    }
  }
}

module.exports = Monitoring;