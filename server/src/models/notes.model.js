const mongoose = require('mongoose');

// Topic content varies wildly per note (concept/why/deepInsight/traps/pcbContains/flow/...),
// so only the outer shape (id, title and a topics array) is enforced here; topic internals stay Mixed.
// The full rules are in validators/notes.validators.js (the seed and a test run them).
const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true }, // permanent, for example os-deadlocks; links use this, never the title
  title: { type: String, required: true },
  overview: [String],
  topics: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { _id: false, strict: false });

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
    type: [sectionSchema],
    required: true,
    default: []
  }
}, { timestamps: true });

const notesModel = mongoose.model("Notes", notesSchema);

module.exports = notesModel;

