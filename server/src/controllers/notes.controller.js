const notesModel = require('../models/notes.model');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');
const { sectionStats, subjectStats } = require('../utils/notesStats');

// controller to get all the notes: each subject with numbers worked out from its sections (no sections are sent)
const getNotes = async (req, res, next) => {
  try {
    const subjects = await notesModel.find({}, 'subject subjectSlug sections').lean();
    const notesSummary = subjects.map(({ _id, subject, subjectSlug, sections }) => ({ _id, subject, subjectSlug, ...subjectStats(sections) }));
    sendSuccess(res, 200, 'Notes fetched successfully', notesSummary);
  } catch (error) {
    next(error);
  }
};

// controller to get notes by subject
const getNotesBySubject = async (req, res, next) => {
  try {
    const subject = req.params.subject.toLowerCase();
    
    // Find note by subject slug
    const notes = await notesModel.findOne({ subjectSlug: subject }).select('-__v').lean();
    
    if (!notes) {
      return next(new AppError(404, "Notes not found for this subject"));
    }

    // each section also carries its reading time, worked out from its text
    const sections = notes.sections.map((section) => ({ ...section, readMinutes: sectionStats(section).readMinutes }));
    sendSuccess(res, 200, 'Subject notes fetched successfully', { ...notes, sections });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNotesBySubject };