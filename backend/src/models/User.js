const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`[${new Date().toISOString()}] Password hashed for ${this.username}: ${this.password}`);
    next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Hashing error:`, error.message);
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`[${new Date().toISOString()}] Password comparison for ${this.username}:`, {
      candidatePassword,
      storedHash: this.password,
      isMatch,
    });
    return isMatch;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Password comparison error:`, error.message);
    throw new Error('Password comparison failed');
  }
};

module.exports = mongoose.model('User', userSchema);