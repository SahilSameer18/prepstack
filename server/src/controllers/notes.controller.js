const notesModel = require('../models/notes.model');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');
const { sectionStats, subjectStats } = require('../utils/notesStats');
const { cached } = require('../services/cache');
const { PUBLIC_CONTENT_CACHE_CONTROL } = require('../config/limits');

// controller to get all the notes: each subject with numbers worked out from its sections (no sections are sent)
const getNotes = async (req, res, next) => {
  try {
    // the notes only change when a seed runs: cached (phase 4); this read loads every section of every subject just to count them
    const notesSummary = await cached(['content', 'notes-list'], async () => {
      const subjects = await notesModel.find({}, 'subject subjectSlug sections').lean();
      return subjects.map(({ _id, subject, subjectSlug, sections }) => ({ _id, subject, subjectSlug, ...subjectStats(sections) }));
    });
    res.set('Cache-Control', PUBLIC_CONTENT_CACHE_CONTROL);
    sendSuccess(res, 200, 'Notes fetched successfully', notesSummary);
  } catch (error) {
    next(error);
  }
};

// controller to get notes by subject
const getNotesBySubject = async (req, res, next) => {
  try {
    const subject = req.params.subject.toLowerCase();
    
    // Find note by subject slug (the whole answer is cached; null means "not found")
    const result = await cached(['content', 'notes', subject], async () => {
      const notes = await notesModel.findOne({ subjectSlug: subject }).select('-__v').lean();
      if (!notes) return null;
      // each section also carries its reading time, worked out from its text
      const sections = notes.sections.map((section) => ({ ...section, readMinutes: sectionStats(section).readMinutes }));
      return { ...notes, sections };
    });

    if (!result) {
      return next(new AppError(404, "Notes not found for this subject"));
    }

    res.set('Cache-Control', PUBLIC_CONTENT_CACHE_CONTROL);
    sendSuccess(res, 200, 'Subject notes fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNotesBySubject };