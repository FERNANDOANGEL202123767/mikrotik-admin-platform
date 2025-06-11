// frontend/src/utils/formatters.js
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatBitsPerSecond = (bits) => {
  const numBits = parseFloat(bits) || 0;
  if (numBits === 0) return '0 bps';
  const k = 1000;
  const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  const i = Math.floor(Math.log(numBits) / Math.log(k));
  return `${parseFloat((numBits / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatUptime = (uptime) => {
  if (!uptime) return '0s';
  return uptime;
};

export const calculateMemoryUsage = (resource) => {
  const total = parseInt(resource['total-memory']) || 1;
  const free = parseInt(resource['free-memory']) || 0;
  return ((total - free) / total) * 100;
};

