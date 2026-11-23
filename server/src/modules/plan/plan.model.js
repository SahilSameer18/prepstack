const mongoose = require("mongoose");
const { PLAN_MAX_ITEMS, PLAN_TITLE_MAX } = require("../../shared/config/limits");

// A student's goal plan ("My plan"). The rules for what goes in it are in docs/plans/MY_PLAN_PLAN.md and src/modules/plan/planGenerator.js.
// The `user` reference means the "delete my account" cascade wipes plans automatically (see user.controller.js).
// Dates are plain "YYYY-MM-DD" strings in the account study calendar, like the generator uses.
const itemSchema = new mongoose.Schema({
  key: { type: String, required: true, maxlength: 600 }, // the generator's identity of the item (its ref, link or step, and part)
  type: {
    type: String,
    required: true,
    enum: ["dsa", "notes", "roadmap", "review", "mock", "behavioral", "custom"],
  },
  ref: { type: String, default: null, maxlength: 300 },
  link: { type: String, default: null, maxlength: 500 },
  title: { type: String, required: true, maxlength: 500 },
  plannedMinutes: { type: Number, required: true, min: 1 },
  day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  plannedDay: { type: String, default: null }, // where the planner first put it (a move is measured from here)
  part: { type: { n: Number, of: Number }, default: null, _id: false },
  source: { type: String, default: "planner", maxlength: 60 }, // planner | analyzer:<reportId> | student
  core: { type: Boolean, default: true },
  sheet: { type: String, default: null },
  topicId: { type: String, default: null },
  topicTitle: { type: String, default: null },
  subject: { type: String, default: null },
  stepId: { type: String, default: null },
  milestoneId: { type: String, default: null, maxlength: 120 },
  activity: { type: String, enum: ['learn', 'practice', 'checkpoint', 'project', null], default: null },
  objective: { type: String, default: null, maxlength: 2000 },
  learningKind: { type: String, enum: ['foundation', 'repair', 'transfer', 'rehearsal', null], default: null },
  relatedKey: { type: String, maxlength: 700, default: null },
  materialRef: { type: String, maxlength: 300, default: null },
  difficulty: { type: String, default: null },
  unitId: { type: String, default: null },
  replacesKey: { type: String, default: null },
  order: { type: Number, default: 0 },
  starred: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  skipped: { type: Boolean, default: false },
  result: {
    type: String,
    enum: ["alone", "hints", "solution", null],
    default: null,
  },
  quizScore: { type: Number, default: null },
  reviewLadder: { type: String, default: null },
  reviewStage: { type: Number, default: null },
  reviewBaseDay: { type: String, default: null },
  nextReviewDay: { type: String, default: null },
  lastFailedDay: { type: String, default: null },
  lastReviewDay: { type: String, default: null },
  doneAt: { type: Date, default: null },
  unscheduledMinutes: { type: Number, min: 1 }, // unfinished minutes that could not fit a rebuild
  completedStudyDay: { type: String, default: null },
  lastReviewAt: { type: Date, default: null },
  reviewWindowEndsAt: { type: Date, default: null },
  reviewNeedsPractice: { type: Boolean, default: undefined },
});

const planSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goalType: {
      type: String,
      required: true,
      enum: ["placements", "role", "bigtech"],
    },
    style: { type: String, required: true, enum: ["one-topic", "mixed"] },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: PLAN_TITLE_MAX,
    },
    targetRole: {
      type: String,
      default: "",
      trim: true,
      maxlength: PLAN_TITLE_MAX,
    },
    status: {
      type: String,
      enum: ["active", "paused", "finished"],
      default: "active",
    },
    pausedAt: { type: Date, default: null },
    pausedAtDay: { type: String, default: null },
    pauseCalendar: {
      type: { timeZone: String, dayStartHour: Number },
      default: null,
      _id: false,
    },
    totalPausedDays: { type: Number, default: 0 },
    originReport: { type: String, default: null }, // report-only plans refit their own tasks on rebuild
    // Missing/old records use the original generator. New saves set version 2
    // explicitly and retain their roadmap so later edits cannot change task identities.
    generationVersion: { type: Number, enum: [1, 2], default: 1 },
    roadmapSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    sheetSlug: { type: String, default: null },
    roadmapSlug: { type: String, default: null },
    subjects: { type: [String], default: [] },
    pace: {
      type: String,
      enum: ["faster", "standard", "slower"],
      default: "standard",
    }, // multiplies the minutes of DSA problems
    // Bounded optional self-reports stay with the plan and its account deletion.
    startingChecks: { type: [{ _id: false, id: String, outcome: String, quizScore: Number, ref: String, at: Date }], default: [] },
    learningAttempts: {
      type: [{
        _id: false,
        key: String,
        topic: String,
        type: { type: String }, // Wrapping this field keeps Mongoose from treating the whole entry as a string.
        kind: String,
        day: String,
        at: Date,
        outcome: String,
        effort: String,
        complete: Boolean,
        familiar: Boolean,
        independent: Boolean,
        explained: Boolean,
        tested: Boolean,
      }],
      default: [],
      validate: (entries) => entries.length <= 200,
    },
    estimateFactors: { type: { dsa: { type: Number, min: 0.5, max: 2 }, notes: { type: Number, min: 0.5, max: 2 }, roadmap: { type: Number, min: 0.5, max: 2 } }, default: () => ({}), _id: false },
    estimateUpdatedAt: { type: { dsa: Date, notes: Date, roadmap: Date }, default: () => ({}), _id: false },
    knownTopics: { type: [String], default: [] },
    solvedLinks: { type: [String], default: [] }, // solved when the plan was made or last rebuilt, so a rebuild does not bring them back
    weeks: { type: Number, required: true, min: 1, max: 52 },
    startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    deadline: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    hoursByWeekday: {
      type: [Number],
      required: true,
      validate: (v) => v.length === 7,
    },
    restDay: { type: Number, default: null, min: 0, max: 6 },
    lighterDays: {
      type: [{ _id: false, from: String, to: String, hours: Number }],
      default: [],
    },
    coverage: { type: mongoose.Schema.Types.Mixed, default: {} }, // { syllabusMinutes, plannedMinutes, extraMinutes, leftOut[], ... } from the generator
    notices: { type: [String], default: [] },
    items: {
      type: [itemSchema],
      default: [],
      validate: {
        validator: (v) => v.length <= PLAN_MAX_ITEMS,
        message: `A plan can have at most ${PLAN_MAX_ITEMS} items`,
      },
    },
  },
  { timestamps: true },
);

// One active plan per user; finished plans are kept as history (at most a few, see the controller).
planSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { status: "active" } },
);
planSchema.index({ user: 1, status: 1, createdAt: -1 });

// One paused main plan can coexist with one active interview sprint.
planSchema.index(
  { user: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "paused" },
    name: "one_paused_plan_per_user",
  },
);

module.exports = mongoose.model("Plan", planSchema);
