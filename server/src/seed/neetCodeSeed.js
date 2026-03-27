const DSASheet = require('../models/sheets.model');
const connectDB = require('./seedConfig');

const neetCodeData = {
  name: "NeetCode 150",
  slug: "neetcode-150",
  description: "A curated list of 150 LeetCode problems by NeetCode (Placeholder).",
  topics: []
};

const seedNeetCode = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: neetCodeData.slug },
    neetCodeData,
    { upsert: true, new: true }
  );
  console.log('NeetCode 150 Sheet Seeded');
};

module.exports = seedNeetCode;
