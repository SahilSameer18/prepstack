const mongoose = require('mongoose');
const seedLoveBabbar = require('./loveBabbarSeed');
const seedStriverA2Z = require('./striverA2ZSeed');
const seedStriverSDE = require('./striverSDESeed');
const seedNeetCode = require('./neetCodeSeed');
const connectDB = require('./seedConfig');

const seedAll = async () => {
  try {
    await connectDB();
    
    // Clear existing sheets to avoid duplicates if required, 
    // but using findOneAndUpdate with upsert: true in individual seeds is safer.
    // Uncomment the next line if you want to start fresh every time.
    // await DSASheet.deleteMany({});

    await seedLoveBabbar();
    await seedStriverA2Z();
    await seedStriverSDE();
    await seedNeetCode();

    console.log('All DSA Sheets seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAll();

