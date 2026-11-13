// Gathers the real content data the plan generator reads (it takes the data as an argument so tests can use small made-up data).
// The sheets and the notes are read from the same source files the seeds use; the catalogs are the two files built by `npm run build:plan-catalogs`.
const path = require('path');
const { sectionStats } = require('../utils/notesStats');

const SHEET_FILES = { 'blind-75': 'blind75', 'neetcode-150': 'neetCodeSeed', 'striver-sde': 'striverSDESeed', 'striver-a2z': 'striverA2ZSeed', 'love-babbar': 'loveBabbarSeed' };
const SUBJECTS = ['os', 'dbms', 'cn', 'oops', 'hld'];

const loadPlanData = () => {
  const sheets = {};
  for (const [slug, file] of Object.entries(SHEET_FILES)) {
    const { data } = require(path.join('..', 'seed', 'sheetSeeds', file));
    sheets[slug] = { topics: data.topics.map((t) => ({ id: t.id, title: t.title, problems: (t.problems || t.questions || []).map((p) => ({ title: p.title, link: p.link, difficulty: p.difficulty })) })) };
  }
  const notes = {};
  for (const subject of SUBJECTS) {
    notes[subject] = require(path.join('..', 'data', 'notes', subject)).sections.map((s) => ({ id: s.id, title: s.title, readMinutes: sectionStats(s).readMinutes }));
  }
  return {
    sheets,
    notes,
    planCatalog: require('../data/planCatalog.json'),
    roadmapCatalog: require('../data/roadmapCatalog.json'),
    behavioral: require('../data/behavioralQuestions.json'),
  };
};

// Loading the notes and sheets takes a moment, so it is done once. Tests can replace `planClock.now` to play a plan on another day.
let cached = null;
const getPlanData = () => (cached ??= loadPlanData());
const planClock = { now: () => new Date() };

module.exports = { loadPlanData, getPlanData, planClock, SUBJECTS };
