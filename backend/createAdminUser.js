const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

async function createAdminUser() {
  await connectDB();
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    await User.create({ username: 'admin', password: 'admin123' });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
  mongoose.connection.close();
}

createAdminUser();