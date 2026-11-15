const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  // Planner/catalog reads import seed data. Environment and DNS setup belong
  // only to an explicitly invoked seed command, never to those read-only imports.
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_CUSTOM_DNS === 'true') {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  }
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
  
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/prepstack';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for seeding');
};

module.exports = connectDB;
