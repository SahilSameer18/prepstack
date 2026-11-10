// The ONE place that says how much a user may use the AI features. The real checks (the hourly rate limiters and the
// daily caps in the controllers) and the numbers shown on the page (GET /api/usage) all read from here, so they cannot disagree.
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const PROJECTS_PER_HOUR = 4;
const REPORTS_PER_HOUR = 3;
const PROBLEM_NOTE_WRITES_PER_MINUTE = 120; // autosave while typing (the page waits a moment between saves, so normal use is far lower)
const PROBLEM_NOTE_IMPORT_BATCH = 15; // notes per import request: express.json() allows 100 KB and a note can be about 5 KB
const PLAN_TICKS_PER_MINUTE = 60; // ticking study-plan items is not an AI call, so this only guards against a stuck script

// The daily caps can be changed with an environment variable (a whole number above 0), otherwise the default applies.
const fromEnv = (name, fallback) => {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};
const projectsPerDay = () => fromEnv('AI_DAILY_LIMIT', 15);
const reportsPerDay = () => fromEnv('ANALYZER_DAILY_LIMIT', 5);

module.exports = { HOUR_MS, DAY_MS, PROJECTS_PER_HOUR, REPORTS_PER_HOUR, PLAN_TICKS_PER_MINUTE, PROBLEM_NOTE_WRITES_PER_MINUTE, PROBLEM_NOTE_IMPORT_BATCH, projectsPerDay, reportsPerDay };
