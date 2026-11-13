const mongoose = require('mongoose');
const { PLAN_MAX_ITEMS, PLAN_TITLE_MAX } = require('../config/limits');

// A student's goal plan ("My plan"). The rules for what goes in it are in docs/plans/MY_PLAN_PLAN.md and src/services/planGenerator.js.
// The `user` reference means the "delete my account" cascade wipes plans automatically (see user.controller.js).
// Dates are plain "YYYY-MM-DD" strings (Indian time), like the generator uses.
const itemSchema = new mongoose.Schema({
  key: { type: String, required: true, maxlength: 600 }, // the generator's identity of the item (its ref, link or step, and part)
  type: { type: String, required: true, enum: ['dsa', 'notes', 'roadmap', 'review', 'mock', 'behavioral', 'custom'] },
  ref: { type: String, default: null, maxlength: 300 },
  link: { type: String, default: null, maxlength: 500 },
  title: { type: String, required: true, maxlength: 500 },
  plannedMinutes: { type: Number, required: true, min: 1 },
  day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  plannedDay: { type: String, default: null }, // where the planner first put it (a move is measured from here)
  part: { type: { n: Number, of: Number }, default: null, _id: false },
  source: { type: String, default: 'planner', maxlength: 60 }, // planner | analyzer:<reportId> | student
  core: { type: Boolean, default: true },
  sheet: { type: String, default: null },
  topicId: { type: String, default: null },
  topicTitle: { type: String, default: null },
  subject: { type: String, default: null },
  stepId: { type: String, default: null },
  difficulty: { type: String, default: null },
  unitId: { type: String, default: null },
  order: { type: Number, default: 0 },
  starred: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  skipped: { type: Boolean, default: false },
  result: { type: String, enum: ['alone', 'hints', 'solution', null], default: null },
  quizScore: { type: Number, default: null },
  reviewLadder: { type: String, default: null },
  reviewStage: { type: Number, default: null },
  reviewBaseDay: { type: String, default: null },
  nextReviewDay: { type: String, default: null },
  lastFailedDay: { type: String, default: null },
  doneAt: { type: Date, default: null },
});

const planSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalType: { type: String, required: true, enum: ['placements', 'role', 'bigtech'] },
  style: { type: String, required: true, enum: ['one-topic', 'mixed'] },
  title: { type: String, required: true, trim: true, maxlength: PLAN_TITLE_MAX },
  targetRole: { type: String, default: '', trim: true, maxlength: PLAN_TITLE_MAX },
  status: { type: String, enum: ['active', 'finished'], default: 'active' },
  sheetSlug: { type: String, default: null },
  roadmapSlug: { type: String, default: null },
  subjects: { type: [String], default: [] },
  knownTopics: { type: [String], default: [] },
  solvedLinks: { type: [String], default: [] }, // solved when the plan was made or last rebuilt, so a rebuild does not bring them back
  weeks: { type: Number, required: true, min: 1, max: 52 },
  startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  deadline: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  hoursByWeekday: { type: [Number], required: true, validate: (v) => v.length === 7 },
  restDay: { type: Number, default: null, min: 0, max: 6 },
  lighterDays: { type: [{ _id: false, from: String, to: String, hours: Number }], default: [] },
  coverage: { type: mongoose.Schema.Types.Mixed, default: {} }, // { syllabusMinutes, plannedMinutes, extraMinutes, leftOut[], ... } from the generator
  notices: { type: [String], default: [] },
  items: { type: [itemSchema], default: [], validate: { validator: (v) => v.length <= PLAN_MAX_ITEMS, message: `A plan can have at most ${PLAN_MAX_ITEMS} items` } },
}, { timestamps: true });

// One active plan per user; finished plans are kept as history (at most a few, see the controller).
planSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });
planSchema.index({ user: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Plan', planSchema);
