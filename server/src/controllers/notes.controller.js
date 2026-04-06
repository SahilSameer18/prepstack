const notesModel = require('../models/notes.model');

// controller to get all the notes
const getNotes = async (req, res) => {
  try {
    // We could return just slugs and subjects
    const notesSummary = await notesModel.find({}, 'subject subjectSlug');
    res.status(200).json({
      success: true,
      data: notesSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// controller to get notes by subject
const getNotesBySubject = async (req, res) => {
  try {
    const subject = req.params.subject.toLowerCase();
    
    // Find note by subject slug
    const notes = await notesModel.findOne({ subjectSlug: subject });
    
    if (!notes) {
      return res.status(404).json({ success: false, message: "Notes not found for this subject" });
    }

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = { getNotes, getNotesBySubject };