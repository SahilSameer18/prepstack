const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Fix for MongoDB connection issues in some environments
dns.setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/prepstack';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for seeding');
};

module.exports = connectDB;
