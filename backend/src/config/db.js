// backend/src/config/db.js
const mongoose = require('mongoose');

// backend/src/config/db.js
const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 50000,
        connectTimeoutMS: 50000,
        socketTimeoutMS: 60000,
        maxPoolSize: 10,
        heartbeatFrequencyMS: 10000,
      });
      console.log(`[${new Date().toISOString()}] MongoDB connected`);
      break;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] MongoDB connection error:`, error.message);
      retries -= 1;
      console.log(`[${new Date().toISOString()}] Retries left: ${retries}`);
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  mongoose.connection.on('disconnected', () => {
    console.log(`[${new Date().toISOString()}] MongoDB disconnected, attempting to reconnect...`);
    connectDB();
  });

  mongoose.connection.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] MongoDB error:`, error.message);
  });
};

module.exports = connectDB;