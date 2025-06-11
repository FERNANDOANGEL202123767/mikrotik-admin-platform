// backend/src/utils/csvGenerator.js
const generateCsv = (data, headers) => {
  if (!data || !data.length) return '';
  
  const csvRows = [];
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] || '';
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

module.exports = { generateCsv };



