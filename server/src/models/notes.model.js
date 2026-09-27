const mongoose = require('mongoose');

// Topic content varies wildly per note (concept/why/deepInsight/traps/pcbContains/flow/...),
// so only the outer shape (title + topics array) is enforced; topic internals stay Mixed.
const sectionSchema = new mongoose.Schema({
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

