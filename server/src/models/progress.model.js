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
  // The link is the problem's identifier (it survives re-seeding). solvedAt is when it was ticked; entries from before
  // dates were recorded have null, and streaks and "last solved" ignore them.
  solvedProblems: [{
    _id: false,
    link: { type: String, trim: true, required: true },
    solvedAt: { type: Date, default: null }
  }]
}, {
  timestamps: true
});

// Ensure a user only has one progress document per sheet
progressSchema.index({ user: 1, sheetSlug: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
