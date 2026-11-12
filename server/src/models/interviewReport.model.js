const mongoose = require('mongoose');

// A saved Role Analyzer report. The RESUME IS NEVER STORED: only what the report says about it. The `evidence` fields are
// short quotes (160 characters at most) taken from the resume AFTER contact details were removed.
// The `user` reference means the "delete my account" cascade wipes these automatically (see user.controller.js).
const counts = { met: { type: Number, default: 0 }, partial: { type: Number, default: 0 }, missing: { type: Number, default: 0 } };

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  jobDescription: { type: String, required: true },
  days: { type: Number, required: true },
  score: { type: Number, required: true, min: 0, max: 100 }, // computed by the code from the requirement marks, never by the AI
  scoreBreakdown: { must: counts, nice: counts },
  requirements: [{
    _id: false,
    text: String,
    importance: { type: String, enum: ['must', 'nice'] },
    status: { type: String, enum: ['met', 'partial', 'missing'] },
    evidence: String,
    evidenceCheck: { type: String, enum: ['exact', 'loose', 'unverified', 'n/a'] },
    downgraded: Boolean,
    skillKey: String,
    matchedBy: String, // "text" when the code (not the AI) found the skill in the requirement's words
    didYouMean: String, // a close spelling of a skill name: only a suggestion
    category: { type: String, enum: ['dsa', 'cs-core', 'stack', 'soft', 'other'] },
  }],
  priorities: [{ _id: false, title: String, why: String, hours: Number }],
  technicalQuestions: [{ _id: false, question: String, why: String, resumeAngle: String, followUps: [String] }],
  behavioralQuestions: [{ _id: false, id: Number, question: String, resumeAngle: String }],
  plan: [{
    _id: false,
    day: Number,
    focus: String,
    // done / doneAt belong to the student, not the AI: the AI reply schema (analyzer.service.js) never has them. A report saved before ticks existed has no `done`, which reads as false.
    items: [{ _id: false, ref: String, skillKey: String, task: String, done: { type: Boolean, default: false }, doneAt: Date }],
    extra: String,
  }],
  codingTopics: [{ _id: false, ref: String, why: String }],
  resumeTweaks: [{ _id: false, keyword: String, suggestion: String }],
  checks: { _id: false, requirementsTotal: Number, withEvidence: Number, downgraded: Number, droppedRefs: Number, droppedClaims: Number, droppedTweaks: Number },
  // which AI model answered: for debugging only, hidden from queries and from every API response
  aiProvider: { type: String, select: false },
}, { timestamps: true });

reportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewReport', reportSchema);
