import dns from 'dns';
import { Resolver } from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please set MONGODB_URI in your .env or environment before running this script.');
  process.exit(1);
}

const getSrvHost = (u) => {
  try {
    const match = u.match(/mongodb\+srv:\/\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const srvHost = getSrvHost(uri);

const resolveWith = async (resolver, name, rr) => new Promise((res) => {
  resolver[rr](name, (err, records) => {
    if (err) return res({ err });
    return res({ records });
  });
});

(async () => {
  try {
    console.log('URI looks like SRV:', !!srvHost, srvHost || '(not an SRV URI)');

    if (srvHost) {
      // System resolver
      const systemResolver = dns;
      console.log('\n-- System DNS resolution --');
      const sysTxt = await resolveWith(systemResolver, `_mongodb._tcp.${srvHost}`, 'resolveTxt');
      console.log('System TXT:', sysTxt.err ? sysTxt.err.message : sysTxt.records);
      const sysSrv = await resolveWith(systemResolver, `_mongodb._tcp.${srvHost}`, 'resolveSrv');
      console.log('System SRV:', sysSrv.err ? sysSrv.err.message : sysSrv.records);

      // Google resolver
      const google = new Resolver();
      google.setServers(['8.8.8.8']);
      console.log('\n-- Google DNS (8.8.8.8) resolution --');
      const gTxt = await resolveWith(google, `_mongodb._tcp.${srvHost}`, 'resolveTxt');
      console.log('Google TXT:', gTxt.err ? gTxt.err.message : gTxt.records);
      const gSrv = await resolveWith(google, `_mongodb._tcp.${srvHost}`, 'resolveSrv');
      console.log('Google SRV:', gSrv.err ? gSrv.err.message : gSrv.records);
    }

    console.log('\n-- Attempting MongoDB connection --');
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, family: 4 });
      console.log('✅ MongoDB connection successful');
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ MongoDB connect failed:', err && err.message ? err.message : err);
      process.exit(1);
    }

  } catch (err) {
    console.error('Unexpected error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
