import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('MONGODB_URI present:', !!uri);
    if (!uri) {
      console.error('Please set MONGODB_URI in your .env or environment before running this script.');
      process.exit(1);
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, family: 4 });
    console.log('✅ Test connection successful');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test connection failed:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();
