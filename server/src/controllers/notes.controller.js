const notesModel = require('../models/notes.model');

// controller to get all the notes
const getNotes = async (req, res, next) => {
  try {
    const notesSummary = await notesModel.find({}, 'subject subjectSlug');
    res.status(200).json({
      success: true,
      data: notesSummary
    });
  } catch (error) {
    next(error);
  }
}

// controller to get notes by subject
const getNotesBySubject = async (req, res, next) => {
  try {
    const subject = req.params.subject.toLowerCase();
    
    // Find note by subject slug
    const notes = await notesModel.findOne({ subjectSlug: subject });
    
    if (!notes) {
      const error = new Error("Notes not found for this subject");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotes, getNotesBySubject };


