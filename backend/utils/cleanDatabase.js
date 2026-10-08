const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cleanDatabase = async () => {
  try {
    console.log('[Cleaner] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Cleaner] Connected to MongoDB Atlas.');

    const collections = ['users', 'products', 'categories', 'carts', 'orders'];

    console.log('[Cleaner] Clearing all static/dummy collections...');
    for (const name of collections) {
      try {
        await mongoose.connection.db.collection(name).deleteMany({});
        console.log(`  ✓ Cleared collection: ${name}`);
      } catch (err) {
        // If collection doesn't exist yet, ignore
      }
    }

    console.log('\n======================================================');
    console.log('✅ All static data removed from MongoDB Atlas!');
    console.log('Your database is now clean and ready for your dynamic data.');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Cleaner] Error cleaning database: ${error.message}`);
    process.exit(1);
  }
};

cleanDatabase();
