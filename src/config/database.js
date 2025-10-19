import mongoose from 'mongoose';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MongoDB URI missing. Please set MONGODB_URI in your environment or .env file');
      return;
    }

    const opts = {
      // Mongoose v8 has good defaults; these keep connection attempts reasonably short for debugging
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4, // prefer IPv4 to avoid some DNS/IPv6 issues
    };

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const conn = await mongoose.connect(uri, opts);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('⚠️ MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
          await mongoose.connection.close();
          console.log('🔌 MongoDB closed');
          process.exit(0);
        });

        // Connected successfully — stop retrying
        return;
      } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        console.error(`MongoDB connect attempt ${attempt} failed:`, msg);

        // If it's the last attempt, provide actionable advice
        if (attempt === maxAttempts) {
          console.error('❌ MongoDB connection failed after maximum attempts.');

          if (msg.includes('queryTxt') || msg.includes('ETIMEDOUT') || msg.includes('ETIMEOUT') || msg.includes('ENOTFOUND') || msg.includes('MongoServerSelectionError')) {
            console.error('\nPossible causes and next steps:');
            console.error('- If you use MongoDB Atlas (mongodb+srv): DNS SRV/TXT lookup failed. Check your network/DNS or try from another network.');
            console.error('- In Atlas: ensure Network Access allows your IP (or 0.0.0.0/0 temporarily) and use the correct connection string.');
            console.error('- Try using the non-SRV connection string (replace mongodb+srv:// with mongodb:// and include the host list) if DNS is problematic.');
            console.error('- Verify MONGODB_URI credentials and database name.');
            console.error('- If behind a VPN or corporate proxy, try disabling it or allow MongoDB endpoints.');
            console.error('- As a debug step, run a small test script to pinpoint the error (I can create one for you).\n');
          }

          // Do NOT exit the process here to allow debugging while using nodemon.
          return;
        }

        // Wait before retrying (exponential backoff)
        const delay = 1000 * Math.pow(2, attempt); // 2s, 4s, ...
        console.log(`Retrying MongoDB connection in ${delay / 1000}s...`);
        // eslint-disable-next-line no-await-in-loop
        await sleep(delay);
      }
    }

  } catch (error) {
    console.error('Unexpected error in connectDB:', error);
  }
};

export default connectDB;
