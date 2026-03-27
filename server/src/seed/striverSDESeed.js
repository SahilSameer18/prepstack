const DSASheet = require('../models/sheets.model');
const connectDB = require('./seedConfig');

const striverSDEData = {
  name: "Striver SDE Sheet",
  slug: "striver-sde",
  description: "The famous SDE sheet by Striver for interview preparation (Placeholder).",
  topics: []
};

const seedStriverSDE = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: striverSDEData.slug },
    striverSDEData,
    { upsert: true, new: true }
  );
  console.log('Striver SDE Sheet Seeded');
};

module.exports = seedStriverSDE;
