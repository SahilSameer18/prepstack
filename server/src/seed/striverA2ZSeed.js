const DSASheet = require('../models/sheets.model');
const connectDB = require('./seedConfig');

const striverA2ZData = {
  name: "Striver A2Z DSA Sheet",
  slug: "striver-a2z",
  description: "A comprehensive DSA path by Striver (Placeholder).",
  topics: []
};

const seedStriverA2Z = async () => {
  await connectDB();
  await DSASheet.findOneAndUpdate(
    { slug: striverA2ZData.slug },
    striverA2ZData,
    { upsert: true, new: true }
  );
  console.log('Striver A2Z Sheet Seeded');
};

module.exports = seedStriverA2Z;
