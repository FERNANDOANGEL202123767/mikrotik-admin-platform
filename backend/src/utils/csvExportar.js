module.exports = (data) => {
  let csv = 'Timestamp,Router ID,Router Name,Online,CPU %,Memory %,Uptime,Connected Devices\n';
  data.forEach(item => {
    csv += [
      item.timestamp,
      item.routerId,
      item.routerName,
      item.online,
      item.cpu,
      item.memory,
      item.uptime,
      item.connectedDevices,
    ].join(',') + '\n';
  });
  return csv;
};