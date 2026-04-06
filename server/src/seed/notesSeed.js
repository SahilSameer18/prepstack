const mongoose = require('mongoose');
const connectDB = require('./seedConfig');
const notesModel = require('../models/notes.model');

const osNotes = require('../data/notes/os');
const dbmsNotes = require('../data/notes/dbms');
const cnNotes = require('../data/notes/cn');
const oopsNotes = require('../data/notes/oops');

const seedNotes = async () => {
  try {
    await connectDB();

    console.log('Clearing existing notes...');
    await notesModel.deleteMany({});

    console.log('Seeding new rich structured notes...');
    
    // Add subjectSlug to each object before saving
    const notesToInsert = [
      { subject: osNotes.subject, subjectSlug: 'os', sections: osNotes.sections },
      { subject: dbmsNotes.subject, subjectSlug: 'dbms', sections: dbmsNotes.sections },
      { subject: cnNotes.subject, subjectSlug: 'cn', sections: cnNotes.sections },
      { subject: oopsNotes.subject, subjectSlug: 'oops', sections: oopsNotes.sections },
    ];

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
