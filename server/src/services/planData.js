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
    roadmapCatalog: require('../shared/content/roadmapCatalog.json'),
    behavioral: require('../shared/content/behavioralQuestions.json'),
  };
};

// Loading the notes and sheets takes a moment, so it is done once.
let cached = null;
const getPlanData = () => (cached ??= loadPlanData());

// Only DSA practice topics can be excluded from a roadmap by the current generator.
function roadmapTopicChoices(roadmap, sheets) {
  const topics = new Map();
  for (const step of roadmap.steps) {
    for (const practice of step.practice) {
      if (practice.kind !== 'sheet') continue;
      const [sheetSlug, topicId] = practice.target.split(':');
      const topic = sheets[sheetSlug]?.topics.find((item) => item.id === topicId);
      if (topic) {
        topics.set(topicId, { id: topic.id, title: String(topic.title).trim() });
      }
    }
  }
  return [...topics.values()];
}

// Build public form choices from the same data as the planner, without exposing problem lists.
function getPlanChoices() {
  const data = getPlanData();
  const sheetNames = {
    'blind-75': 'Blind 75', 'neetcode-150': 'NeetCode 150', 'striver-sde': 'Striver SDE',
    'striver-a2z': 'Striver A2Z', 'love-babbar': 'Love Babbar',
  };
  const subjectNames = {
    os: 'Operating Systems', dbms: 'DBMS', cn: 'Computer Networks',
    oops: 'OOP in Java', hld: 'System Design',
  };
  const sheets = Object.entries(data.sheets).map(([slug, sheet]) => ({
    slug,
    title: sheetNames[slug],
    topics: sheet.topics.map((topic) => ({ id: topic.id, title: String(topic.title).trim() })),
  }));
  const subjects = Object.keys(data.notes).map((id) => ({ id, title: subjectNames[id] }));
  const roadmaps = data.roadmapCatalog.map((roadmap) => ({
    slug: roadmap.slug,
    title: roadmap.title,
    topics: roadmapTopicChoices(roadmap, data.sheets),
  }));
  return { sheets, subjects, roadmaps };
}

module.exports = { loadPlanData, getPlanData, getPlanChoices, SUBJECTS };
