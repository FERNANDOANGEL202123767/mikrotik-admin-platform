// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log(`[${new Date().toISOString()}] Auth middleware: Token = ${token ? 'present' : 'missing'}`);
  if (!token) {
    console.log(`[${new Date().toISOString()}] No token provided`);
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[${new Date().toISOString()}] JWT_SECRET:`, process.env.JWT_SECRET);
    console.log(`[${new Date().toISOString()}] Received token:`, token);
    console.log(`[${new Date().toISOString()}] Token decoded:`, decoded);
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Token verification error:`, error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;