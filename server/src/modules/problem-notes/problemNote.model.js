const mongoose = require('mongoose');

// A student's note on one DSA problem: pattern, complexities and their own words. One note per user per problem LINK
// (the same link in two sheets is one note, as it was when notes lived in the browser).
// The `user` reference means the "delete my account" cascade wipes these automatically (see user.controller.js).
const problemNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemLink: { type: String, required: true, trim: true, maxlength: 500 },
  pattern: { type: String, default: '' },
  timeComplexity: { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
  approach: { type: String, default: '', maxlength: 5000 },
}, { timestamps: true });

problemNoteSchema.index({ user: 1, problemLink: 1 }, { unique: true });

module.exports = mongoose.model('ProblemNote', problemNoteSchema);
