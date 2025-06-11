// backend/src/controllers/reportController.js
const MonitoringData = require('../models/MonitoringData');
const { generatePDF } = require('../utils/pdfGenerator');
const { generateCSV } = require('../utils/csvGenerator');

exports.generateReport = async (req, res) => {
  const { routerId, startDate, endDate, format } = req.body;

  if (!startDate || !endDate || !format) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Fetch data for both routers if routerId is 'all' or a single router
    const routerIds = routerId === 'all' ? ['mikrotik1', 'mikrotik2'] : [routerId];
    const data = {};

    for (const id of routerIds) {
      const records = await MonitoringData.find({
        routerId: id,
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }).sort({ timestamp: 1 });
      console.log(`[${new Date().toISOString()}] Fetched ${records.length} records for ${id}`);
      data[id] = records;
    }

    if (Object.values(data).every((records) => records.length === 0)) {
      return res.status(404).json({ error: 'No data found for the specified range' });
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(data, routerId, startDate, endDate);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=report-${routerId}-${new Date().toISOString().split('T')[0]}.pdf`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } else if (format === 'csv') {
      const csvData = generateCSV(data[routerId] || [], ['timestamp', 'cpu', 'memory', 'rx-bytes', 'tx-bytes', 'uptime']);
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=report-${routerId}-${new Date().toISOString().split('T')[0]}.csv`,
      });
      res.send(csvData);
    } else {
      res.status(400).json({ error: 'Invalid format specified' });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating report:`, error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};