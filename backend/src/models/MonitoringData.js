const mongoose = require('mongoose');

const monitoringDataSchema = new mongoose.Schema({
  routerId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  online: { type: Boolean, default: false },
  cpu: { type: Number, default: 0 },
  memory: { type: Number, default: 0 },
  'rx-bytes': { type: Number, default: 0 },
  'tx-bytes': { type: Number, default: 0 },
  uptime: { type: String, default: '0s' },
  connectedDevices: { type: Array, default: [] },
  systemResource: { type: Object, default: {} },
  bandwidth: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('MonitoringData', monitoringDataSchema);