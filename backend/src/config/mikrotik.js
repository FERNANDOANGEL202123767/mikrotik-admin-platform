// backend/src/config/mikrotik.js
require('dotenv').config();

const mikrotikConfig = [
  {
    id: 'mikrotik1',
    ip: process.env.MIKROTIK1_IP || '192.168.1.1',
    user: process.env.MIKROTIK1_USER || 'admin',
    password: process.env.MIKROTIK1_PASS || 'Y6T7RAX7IB',
  },
  {
    id: 'mikrotik2',
    ip: process.env.MIKROTIK2_IP || '192.168.2.1',
    user: process.env.MIKROTIK2_USER || 'admin',
    password: process.env.MIKROTIK2_PASS || 'K92PNELK3A',
  },
];

console.log(`[${new Date().toISOString()}] Loaded MikroTik config:`, mikrotikConfig.map(({ id, ip, user }) => ({ id, ip, user })));
module.exports = mikrotikConfig;