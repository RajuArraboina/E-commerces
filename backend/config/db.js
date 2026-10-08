const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error('Check network connection and ensure MongoDB Atlas IP Access List (0.0.0.0/0) is configured.');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Handle connection events
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection lost. Reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Connection restored successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection event error:', err.message);
  });
};

module.exports = connectDB;
