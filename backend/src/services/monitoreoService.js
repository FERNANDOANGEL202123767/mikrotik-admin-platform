module.exports = [
  {
    id: 'mikrotik1',
    ip: process.env.MIKROTIK1_IP || '192.168.1.1',
    user: process.env.MIKROTIK1_USER || 'admin',
    pass: process.env.MIKROTIK1_PASS || '',
  },
  {
    id: 'mikrotik2',
    ip: process.env.MIKROTIK2_IP || '192.168.2.1',
    user: process.env.MIKROTIK2_USER || 'admin',
    pass: process.env.MIKROTIK2_PASS || '',
  },
];