const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sheetSlug: {
    type: String,
    required: true,
    trim: true
  },
  solvedProblems: [{
    type: String, // Storing problem link as unique identifier to survive re-seeding
    trim: true
  }]
}, {
  timestamps: true
});

// Ensure a user only has one progress document per sheet
progressSchema.index({ user: 1, sheetSlug: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
