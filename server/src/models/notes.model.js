const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  subjectSlug: {
    type: String,
    required: true,
    unique: true
  },
  sections: {
    type: Array,
    required: true,
    default: []
  }
}, { timestamps: true });

const notesModel = mongoose.model("Notes", notesSchema);

module.exports = notesModel;