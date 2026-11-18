const mongoose = require('mongoose');
const notesModel = require('../models/notes.model');
const { checkNotesSubject } = require('../validators/notes.validators');
const { clearContentCache } = require('../services/cache');
const report = (result) => console.log(result.skipped ? 'Content cache: Redis is not set or not reachable, so cached copies expire by themselves within about ten minutes.' : `Content cache cleared (${result.cleared} keys).`);

const osNotes = require('../data/notes/os');
const dbmsNotes = require('../data/notes/dbms');
const cnNotes = require('../data/notes/cn');
const oopsNotes = require('../data/notes/oops');
const hldNotes = require('../data/notes/hld');

const publishNotes = async (notesToInsert) => {
  const problems = notesToInsert.flatMap(({ subjectSlug, subject, sections }) => checkNotesSubject(subjectSlug, { subject, sections }));
  if (!notesToInsert.length || new Set(notesToInsert.map((n) => n.subjectSlug)).size !== notesToInsert.length) problems.push('Subjects must be nonempty and unique');
  if (problems.length) throw new Error('The notes data has problems, nothing was changed:\n- ' + problems.join('\n- '));
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!topology.setName && topology.msg !== 'isdbgrid') throw new Error('Notes publishing needs a MongoDB replica set or Atlas; previous notes were left unchanged.');
  const session = await mongoose.startSession();
  try {
    // Requires a replica set (including Atlas). There is deliberately no destructive standalone fallback.
    await session.withTransaction(async () => {
      await notesModel.deleteMany({}, { session });
      await notesModel.insertMany(notesToInsert, { session });
    });
  } finally { await session.endSession(); }
};

const seedNotes = async () => {
  try {
    // Add subjectSlug to each object before saving
    const notesToInsert = [
      { subject: osNotes.subject, subjectSlug: 'os', sections: osNotes.sections },
      { subject: dbmsNotes.subject, subjectSlug: 'dbms', sections: dbmsNotes.sections },
      { subject: cnNotes.subject, subjectSlug: 'cn', sections: cnNotes.sections },
      { subject: oopsNotes.subject, subjectSlug: 'oops', sections: oopsNotes.sections },
      { subject: hldNotes.subject, subjectSlug: 'hld', sections: hldNotes.sections },
    ];

    // Only the explicit command loads environment/connection configuration.
    await require('./seedConfig')();
    await publishNotes(notesToInsert);
    console.log('Notes seeded successfully!');
    report(await clearContentCache().catch(() => ({ skipped: true, cleared: 0 }))); // the public notes reads are cached for a few minutes (phase 4)

  } catch (error) {
    console.error('Error seeding notes:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

if (require.main === module) seedNotes();
module.exports = { publishNotes, seedNotes };
