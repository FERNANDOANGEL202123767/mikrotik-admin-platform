// backend/src/utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');

async function generatePDF(data, routerId, startDate, endDate) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50, autoFirstPage: true });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] PDF generation error:`, error);
        reject(error);
      });

      // Function to render individual router report
      const renderRouterReport = (routerData, id) => {
        // Header
        doc.fontSize(20).text(`Router Report: ${id.toUpperCase()}`, { align: 'center' });
        doc.fontSize(12).text(`From: ${new Date(startDate).toLocaleString()}`, { align: 'center' });
        doc.text(`To: ${new Date(endDate).toLocaleString()}`, { align: 'center' });
        doc.moveDown(1);

        // Summary
        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(12);
        const lastRecord = routerData[routerData.length - 1] || {};
        doc.text(`CPU Usage: ${lastRecord.cpu || 0}%`);
        doc.text(`Memory Usage: ${(lastRecord.memory || 0).toFixed(2)}%`);
        doc.text(`Uptime: ${lastRecord.uptime || 'N/A'}`);
        doc.text(`Connected Devices: ${(lastRecord.connectedDevices || []).length}`);
        doc.moveDown(1);

        // CPU Chart
        if (doc.y > 500) doc.addPage();
        doc.fontSize(14).text('CPU Usage Over Time', { underline: true });
        try {
          const canvas = createCanvas(500, 200);
          const ctx = canvas.getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: routerData.map((d) => new Date(d.timestamp).toLocaleTimeString()),
              datasets: [{
                label: 'CPU Usage (%)',
                data: routerData.map((d) => d.cpu || 0),
                borderColor: '#1890ff',
                fill: false,
              }],
            },
            options: { scales: { y: { beginAtZero: true, max: 100 } } },
          });
          doc.image(canvas.toBuffer('image/png'), { width: 500 });
          console.log(`[${new Date().toISOString()}] CPU chart generated for ${id}`);
        } catch (chartError) {
          console.error(`[${new Date().toISOString()}] CPU chart error for ${id}:`, chartError);
          doc.text('Error generating CPU chart', { align: 'center', color: 'red' });
        }
        doc.moveDown(1);

        // Memory Chart
        if (doc.y > 500) doc.addPage();
        doc.fontSize(14).text('Memory Usage Over Time', { underline: true });
        try {
          const memoryCanvas = createCanvas(500, 200);
          const memoryCtx = memoryCanvas.getContext('2d');
          new Chart(memoryCtx, {
            type: 'line',
            data: {
              labels: routerData.map((d) => new Date(d.timestamp).toLocaleTimeString()),
              datasets: [{
                label: 'Memory Usage (%)',
                data: routerData.map((d) => d.memory || 0),
                borderColor: '#52c41a',
                fill: false,
              }],
            },
            options: { scales: { y: { beginAtZero: true, max: 100 } } },
          });
          doc.image(memoryCanvas.toBuffer('image/png'), { width: 500 });
          console.log(`[${new Date().toISOString()}] Memory chart generated for ${id}`);
        } catch (chartError) {
          console.error(`[${new Date().toISOString()}] Memory chart error for ${id}:`, chartError);
          doc.text('Error generating Memory chart', { align: 'center', color: 'red' });
        }
        doc.moveDown(1);

        // Data Table
        if (doc.y > 400) doc.addPage();
        doc.fontSize(14).text('Detailed Data', { underline: true });
        const tableTop = doc.y;
        const headers = ['Timestamp', 'CPU (%)', 'Memory (%)', 'RX (bps)', 'TX (bps)'];
        const colWidths = [150, 80, 80, 80, 80];
        let y = tableTop + 20;

        // Draw headers
        doc.fontSize(10);
        headers.forEach((header, i) => {
          doc.text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, { width: colWidths[i], align: 'center' });
        });

        // Draw data rows
        routerData.slice(0, 10).forEach((row) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
            headers.forEach((header, i) => {
              doc.text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y - 20, { width: colWidths[i], align: 'center' });
            });
          }
          doc.text(new Date(row.timestamp).toLocaleString(), 50, y, { width: colWidths[0] });
          doc.text((row.cpu || 0).toString(), 50 + colWidths[0], y, { width: colWidths[1], align: 'center' });
          doc.text((row.memory || 0).toFixed(2), 50 + colWidths.slice(0, 2).reduce((a, b) => a + b, 0), y, { width: colWidths[2], align: 'center' });
          doc.text((row['rx-bytes'] || 0).toString(), 50 + colWidths.slice(0, 3).reduce((a, b) => a + b, 0), y, { width: colWidths[3], align: 'center' });
          doc.text((row['tx-bytes'] || 0).toString(), 50 + colWidths.slice(0, 4).reduce((a, b) => a + b, 0), y, { width: colWidths[4], align: 'center' });
          y += 20;
        });
      };

      // Render individual reports
      if (routerId === 'all') {
        Object.keys(data).forEach((id) => {
          if (data[id].length > 0) {
            renderRouterReport(data[id], id);
            doc.addPage();
          }
        });
      } else {
        renderRouterReport(data[routerId] || [], routerId);
      }

      // Comparison Section (only for 'all')
      if (routerId === 'all' && data.mikrotik1?.length > 0 && data.mikrotik2?.length > 0) {
        doc.addPage();
        doc.fontSize(20).text('Router Comparison', { align: 'center' });
        doc.moveDown(1);

        // Merge data for comparison
        const mergedData = data.mikrotik1.map((item, index) => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          mikrotik1_cpu: item.cpu || 0,
          mikrotik2_cpu: data.mikrotik2[index]?.cpu || 0,
        }));

        // CPU Comparison Chart
        if (doc.y > 500) doc.addPage();
        doc.fontSize(14).text('CPU Usage Comparison', { underline: true });
        try {
          const canvas = createCanvas(500, 200);
          const ctx = canvas.getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: mergedData.map((d) => d.timestamp),
              datasets: [
                {
                  label: 'MikroTik 1 CPU (%)',
                  data: mergedData.map((d) => d.mikrotik1_cpu),
                  borderColor: '#1890ff',
                  fill: false,
                },
                {
                  label: 'MikroTik 2 CPU (%)',
                  data: mergedData.map((d) => d.mikrotik2_cpu),
                  borderColor: '#ff4d4f',
                  fill: false,
                },
              ],
            },
            options: { scales: { y: { beginAtZero: true, max: 100 } } },
          });
          doc.image(canvas.toBuffer('image/png'), { width: 500 });
          console.log(`[${new Date().toISOString()}] CPU comparison chart generated`);
        } catch (chartError) {
          console.error(`[${new Date().toISOString()}] CPU comparison chart error:`, chartError);
          doc.text('Error generating CPU comparison chart', { align: 'center', color: 'red' });
        }
        doc.moveDown(1);

        // Memory Comparison Chart
        if (doc.y > 500) doc.addPage();
        doc.fontSize(14).text('Memory Usage Comparison', { underline: true });
        try {
          const memoryCanvas = createCanvas(500, 200);
          const memoryCtx = memoryCanvas.getContext('2d');
          new Chart(memoryCtx, {
            type: 'line',
            data: {
              labels: mergedData.map((d) => d.timestamp),
              datasets: [
                {
                  label: 'MikroTik 1 Memory (%)',
                  data: data.mikrotik1.map((d) => d.memory || 0),
                  borderColor: '#52c41a',
                  fill: false,
                },
                {
                  label: 'MikroTik 2 Memory (%)',
                  data: data.mikrotik2.map((d) => d.memory || 0),
                  borderColor: '#faad14',
                  fill: false,
                },
              ],
            },
            options: { scales: { y: { beginAtZero: true, max: 100 } } },
          });
          doc.image(memoryCanvas.toBuffer('image/png'), { width: 500 });
          console.log(`[${new Date().toISOString()}] Memory comparison chart generated`);
        } catch (chartError) {
          console.error(`[${new Date().toISOString()}] Memory comparison chart error:`, chartError);
          doc.text('Error generating Memory comparison chart', { align: 'center', color: 'red' });
        }
      }

      doc.end();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error generating PDF:`, error);
      reject(error);
    }
  });
}

module.exports = { generatePDF };