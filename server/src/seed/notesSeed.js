const mongoose = require('mongoose');
const connectDB = require('./seedConfig');
const notesModel = require('../models/notes.model');
const { checkNotesSubject } = require('../validators/notes.validators');

const osNotes = require('../data/notes/os');
const dbmsNotes = require('../data/notes/dbms');
const cnNotes = require('../data/notes/cn');
const oopsNotes = require('../data/notes/oops');
const hldNotes = require('../data/notes/hld');

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

    // Check the data before touching the database, so bad data can never wipe good notes
    const problems = notesToInsert.flatMap(({ subjectSlug, subject, sections }) => checkNotesSubject(subjectSlug, { subject, sections }));
    if (problems.length > 0) {
      console.error('The notes data has problems, nothing was changed:\n- ' + problems.join('\n- '));
      process.exitCode = 1;
      return;
    }

    await connectDB();

    console.log('Clearing existing notes...');
    await notesModel.deleteMany({});

    console.log('Seeding new rich structured notes...');
    await notesModel.insertMany(notesToInsert);
    console.log('Notes seeded successfully!');

  } catch (error) {
    console.error('Error seeding notes:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedNotes();
