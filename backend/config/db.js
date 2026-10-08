// Ensure global crypto is defined across all Node.js runtime environments
if (typeof globalThis.crypto === 'undefined' || typeof global.crypto === 'undefined') {
  const nodeCrypto = require('crypto');
  global.crypto = nodeCrypto;
  globalThis.crypto = nodeCrypto;
}

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error(
      '❌ [MongoDB] Connection error: MongoDB URI is undefined in environment variables.'
    );
    console.error(
      '👉 In Railway: Go to Service > Variables > Add MONGODB_URI with your MongoDB Atlas connection string.'
    );
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error(
      'Check network connection and ensure MongoDB Atlas IP Access List (0.0.0.0/0) is configured.'
    );
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
