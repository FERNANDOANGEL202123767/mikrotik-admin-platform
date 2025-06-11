const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Logger = require('../utils/logger');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log(`[${new Date().toISOString()}] Login attempt:`, { username });

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await User.findOne({ username });
      if (!user) {
        await Logger.error(`User not found: ${username}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await Logger.error(`Invalid password for user: ${username}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
      await Logger.error(`Login error: ${error.message}`);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async register(req, res) {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const user = new User({
        username,
        password,
        role: role || 'user',
      });

      await user.save();

      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
      await Logger.error(`Registration error: ${error.message}`);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = new AuthController();