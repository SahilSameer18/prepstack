const mongoose = require('mongoose');
const seedLoveBabbar = require('./sheetSeeds/loveBabbarSeed');
const seedStriverA2Z = require('./sheetSeeds/striverA2ZSeed');
const seedStriverSDE = require('./sheetSeeds/striverSDESeed');
const seedNeetCode = require('./sheetSeeds/neetCodeSeed');
const seedBlind75 = require('./sheetSeeds/blind75');
const connectDB = require('../../../shared/config/seedConfig');
const { clearContentCache } = require('../../../shared/infra/cache');
const report = (result) => console.log(result.skipped ? 'Content cache: Redis is not set or not reachable, so cached copies expire by themselves within about ten minutes.' : `Content cache cleared (${result.cleared} keys).`);

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
    await seedBlind75();

    console.log('All DSA Sheets seeded successfully!');
    report(await clearContentCache().catch(() => ({ skipped: true, cleared: 0 }))); // the public sheet reads are cached for a few minutes (phase 4)
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAll();

