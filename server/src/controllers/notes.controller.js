const notesModel = require('../models/notes.model');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');

// controller to get all the notes
const getNotes = async (req, res, next) => {
  try {
    const notesSummary = await notesModel.find({}, 'subject subjectSlug');
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
    const notes = await notesModel.findOne({ subjectSlug: subject }).select('-__v');
    
    if (!notes) {
      return next(new AppError(404, "Notes not found for this subject"));
    }

    sendSuccess(res, 200, 'Subject notes fetched successfully', notes);
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNotesBySubject };