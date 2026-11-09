// One-time migration for the progress dates (B1): turns every solved problem stored as a plain link string into
// { link, solvedAt: null }. Old ticks have no real date, so they get null and streaks ignore them.
// Safe to run more than once: entries that are already objects are left alone.
//
//   node scripts/migrate-solved-at.js --dry-run   only prints how many records and entries would change
//   node scripts/migrate-solved-at.js             does the migration
//
// Run it against the live database BEFORE deploying the code that reads { link, solvedAt }.
const mongoose = require('mongoose');

const HAS_STRING_ENTRY = { solvedProblems: { $elemMatch: { $type: 'string' } } };

// Works on the raw collection, not the Mongoose model, because the model only understands the new shape.
const migrateSolvedAt = async (collection, { dryRun = false } = {}) => {
  const records = await collection.find(HAS_STRING_ENTRY, { projection: { solvedProblems: 1 } }).toArray();
  const entries = records.reduce((sum, r) => sum + r.solvedProblems.filter((e) => typeof e === 'string').length, 0);
  if (!dryRun && records.length > 0) {
    await collection.updateMany(HAS_STRING_ENTRY, [{
      $set: {
        solvedProblems: {
          $map: {
            input: '$solvedProblems',
            as: 'entry',
            in: { $cond: [{ $eq: [{ $type: '$$entry' }, 'string'] }, { link: '$$entry', solvedAt: null }, '$$entry'] }
          }
        }
      }
    }]);
  }
  return { records: records.length, entries };
};

module.exports = { migrateSolvedAt };

if (require.main === module) {
  const connectDB = require('../src/seed/seedConfig');
  const dryRun = process.argv.includes('--dry-run');
  (async () => {
    await connectDB();
    const result = await migrateSolvedAt(mongoose.connection.collection('progresses'), { dryRun });
    console.log(`${dryRun ? 'Would migrate' : 'Migrated'} ${result.entries} solved problems in ${result.records} progress records.`);
    await mongoose.disconnect();
  })().catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
}
