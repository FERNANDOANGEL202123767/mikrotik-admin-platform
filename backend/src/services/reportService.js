const MonitoringService = require('./monitoringService');

class ReportService {
  generateCSVReport(filteredData, routerId, filteredOtherData, otherRouterId, period) {
    if (!filteredData || filteredData.length === 0) {
      return `Timestamp,${routerId} CPU Load,${routerId} Memory Usage,${routerId} Download (bps),${routerId} Upload (bps),${otherRouterId} CPU Load,${otherRouterId} Memory Usage,${otherRouterId} Download (bps),${otherRouterId} Upload (bps)\nNo data available for ${routerId} during ${period}`;
    }

    const headers = [
      'Timestamp',
      `${routerId} CPU Load`,
      `${routerId} Memory Usage`,
      `${routerId} Download (bps)`,
      `${routerId} Upload (bps)`,
      `${otherRouterId} CPU Load`,
      `${otherRouterId} Memory Usage`,
      `${otherRouterId} Download (bps)`,
      `${otherRouterId} Upload (bps)`,
    ];

    const rows = filteredData.map((record, index) => {
      const otherRecord = filteredOtherData[index] || {};
      return [
        record.timestamp,
        record.systemResource?.['cpu-load'] || 0,
        MonitoringService.calculateMemoryUsage(record.systemResource).toFixed(2),
        record.bandwidth?.['rx-bits-per-second'] || 0,
        record.bandwidth?.['tx-bits-per-second'] || 0,
        otherRecord.systemResource?.['cpu-load'] || 0,
        MonitoringService.calculateMemoryUsage(otherRecord.systemResource || {}).toFixed(2),
        otherRecord.bandwidth?.['rx-bits-per-second'] || 0,
        otherRecord.bandwidth?.['tx-bits-per-second'] || 0,
      ].join(',');
    });

    return [...headers, ...rows].join('\n');
  }

  compareData(data1, data2, startDate, endDate) {
    const filterData = (data) =>
      data.filter(
        (record) =>
          new Date(record.timestamp) >= new Date(startDate) &&
          new Date(record.timestamp) <= new Date(endDate)
      );

    return {
      router1: filterData(data1),
      router2: filterData(data2),
    };
  }
}

module.exports = new ReportService();