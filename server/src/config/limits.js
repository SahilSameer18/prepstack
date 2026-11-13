// The ONE place that says how much a user may use the AI features. The real checks (the hourly rate limiters and the
// daily caps in the controllers) and the numbers shown on the page (GET /api/usage) all read from here, so they cannot disagree.
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const PROJECTS_PER_HOUR = 4;
const REPORTS_PER_HOUR = 3;
const PROBLEM_NOTE_WRITES_PER_MINUTE = 120; // autosave while typing (the page waits a moment between saves, so normal use is far lower)
const PROBLEM_NOTE_IMPORT_BATCH = 15; // notes per import request: express.json() allows 100 KB and a note can be about 5 KB
const PLAN_TICKS_PER_MINUTE = 60; // ticking study-plan items is not an AI call, so this only guards against a stuck script

// My plan (the goal planner). None of these are AI calls.
const PLAN_PREVIEWS_PER_MINUTE = 20; // the public preview (no login, no database write), counted per IP address
const PLAN_GENERATES_PER_HOUR = 10; // creating, replacing or rebuilding a saved plan, per user
const PLAN_MAX_ITEMS = 600; // items in one plan
const PLAN_TITLE_MAX = 120; // characters in a plan title or an item title
const PLAN_CUSTOM_ITEM_MAX = 200; // characters in a custom item the student adds
const PLAN_MIN_WEEKS = 1;
const PLAN_MAX_WEEKS = 52;
const PLAN_MIN_DAILY_HOURS = 0.5; // hours a student may give a study day
const PLAN_MAX_DAILY_HOURS = 12;

// The daily caps can be changed with an environment variable (a whole number above 0), otherwise the default applies.
const fromEnv = (name, fallback) => {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};
const projectsPerDay = () => fromEnv('AI_DAILY_LIMIT', 15);
const reportsPerDay = () => fromEnv('ANALYZER_DAILY_LIMIT', 5);

module.exports = { HOUR_MS, DAY_MS, PROJECTS_PER_HOUR, REPORTS_PER_HOUR, PLAN_TICKS_PER_MINUTE, PLAN_PREVIEWS_PER_MINUTE, PLAN_GENERATES_PER_HOUR, PLAN_MAX_ITEMS, PLAN_TITLE_MAX, PLAN_CUSTOM_ITEM_MAX, PLAN_MIN_WEEKS, PLAN_MAX_WEEKS, PLAN_MIN_DAILY_HOURS, PLAN_MAX_DAILY_HOURS, PROBLEM_NOTE_WRITES_PER_MINUTE, PROBLEM_NOTE_IMPORT_BATCH, projectsPerDay, reportsPerDay };
