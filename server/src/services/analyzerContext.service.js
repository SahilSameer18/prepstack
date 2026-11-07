// What the Role Analyzer is allowed to point a student at. The AI may only choose from these lists, and the code drops
// anything else (see analyzer.service.js), so a report can never link to a page or a skill that does not exist.
//
//   skills       the catalog of skill names (src/data/skillCatalog.json)
//   dsa:<topic>  topics of the Blind 75 sheet (read from the database, so a renamed topic is picked up on its own)
//   notes:<subject>:<section>   sections of the CS notes (read from the database)
//   roadmap:<slug>              the six roadmaps. The roadmap content lives in the client, so the slugs are listed here;
//                               test/analyzer.context.test.js fails if they drift from client/src/data/roadmaps.js
//   behavioral   PrepStack's behavioral question bank (id and text), copied from the client for the same reason
const DSASheet = require('../models/sheets.model');
const Notes = require('../models/notes.model');
const catalog = require('../data/skillCatalog.json');
const behavioral = require('../data/behavioralQuestions.json');

const ROADMAP_SLUGS = ['frontend', 'backend', 'fullstack', 'android', 'data-analytics', 'machine-learning'];
const DSA_SHEET_SLUG = 'blind-75'; // the sheet whose topics the plan may point to (the others have 28 to 56 topics each)

const skillNames = catalog.map((s) => s.name);
const aliases = Object.fromEntries(catalog.map((s) => [s.name, s.aliases]));

const buildContext = async () => {
  const [sheet, notes] = await Promise.all([
    DSASheet.findOne({ slug: DSA_SHEET_SLUG }).select('topics.title').lean(),
    Notes.find({}).select('subjectSlug sections.title').lean(),
  ]);
  const dsaRefs = [...new Set((sheet?.topics || []).map((t) => `dsa:${String(t.title).trim()}`))]; // one Blind 75 title has a stray leading space
  const notesRefs = notes.flatMap((n) => (n.sections || []).map((s) => `notes:${n.subjectSlug}:${s.title}`));
  return {
    skillNames,
    aliases, // used to recognise a skill under another name ("ts" for TypeScript) when checking resume tips
    dsaRefs,
    refs: [...new Set([...dsaRefs, ...notesRefs, ...ROADMAP_SLUGS.map((slug) => `roadmap:${slug}`)])],
    behavioral,
  };
};

module.exports = { buildContext, ROADMAP_SLUGS, DSA_SHEET_SLUG, skillNames };
