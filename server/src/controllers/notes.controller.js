const notesModel = require('../models/notes.model');


// controller to get all the notes
const getNotes = async (req, res) => {
  try {
    const notes = await notesModel.find({}, 'title content');
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


// controller to get notes by subject
const getNotesBySubject = async (req, res) => {
  try {
    const subject = req.params.subject.toLowerCase();
    const notes = await notesModel.find({ subject: { $regex: `^${subject}$`, $options: "i" } }, 'title content');
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