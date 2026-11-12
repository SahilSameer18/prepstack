// What the Role Analyzer is allowed to point a student at. The AI may only choose from these lists, and the code drops
// anything else (see analyzer.service.js), so a report can never link to a page or a skill that does not exist.
//
//   skills       the catalog of skill names (src/data/skillCatalog.json)
//   dsa:<sheet>:<topicId>       topics of the Blind 75 sheet, by permanent topic id (read from the database)
//   notes:<subject>:<sectionId> sections of the CS notes, by permanent section id (read from the database)
//   titles       ref -> readable title, so a report can show "Deadlocks" for notes:os:os-deadlocks. Titles can change, ids never do.
//   roadmap:<slug>              the roadmaps. The roadmap content lives in the client, so the slugs are listed here;
//                               test/analyzer.context.test.js fails if they drift from client/src/data/roadmaps.js
//   behavioral   PrepStack's behavioral question bank (id and text), copied from the client for the same reason
const DSASheet = require('../models/sheets.model');
const Notes = require('../models/notes.model');
const catalog = require('../data/skillCatalog.json');
const behavioral = require('../data/behavioralQuestions.json');

const ROADMAP_SLUGS = ['frontend', 'backend', 'fullstack', 'android', 'data-analytics', 'machine-learning', 'dsa', 'java-spring', 'devops-cloud'];
// What each roadmap really teaches, in one line, so the AI links a plan task to a roadmap only when it fits (11 Nov 2026: it once
// sent "React Native" to the Android roadmap, which teaches Kotlin). test/analyzer.context.test.js fails if a roadmap has no line here.
const ROADMAP_ABOUT = {
  frontend: 'HTML, CSS, JavaScript, React, Tailwind CSS and Next.js for web pages (web only, not mobile apps)',
  backend: 'Node.js, Express, MongoDB, REST APIs, authentication, testing, Docker and deployment',
  fullstack: 'React with Node.js, Express and MongoDB together (MERN), authentication, file uploads, testing and deployment',
  android: 'Kotlin and Jetpack Compose for native Android apps, Room, Firebase and publishing (not React Native or Flutter)',
  'data-analytics': 'spreadsheets, Python with pandas, statistics, SQL, charts and dashboards',
  'machine-learning': 'Python, scikit-learn, PyTorch, model evaluation and deploying models',
  dsa: 'data structures and algorithms in a sensible order, with practice on the DSA sheets',
  'java-spring': 'Java and Spring Boot: REST APIs, JPA databases, Spring Security, testing and Docker',
  'devops-cloud': 'Git, Linux, Docker, GitHub Actions, AWS basics, Kubernetes, Terraform and monitoring',
};
const DSA_SHEET_SLUG = 'blind-75'; // the sheet whose topics the plan may point to (the others have 28 to 56 topics each)

const skillNames = catalog.map((s) => s.name);
const aliases = Object.fromEntries(catalog.map((s) => [s.name, s.aliases]));

const buildContext = async () => {
  const [sheet, notes] = await Promise.all([
    DSASheet.findOne({ slug: DSA_SHEET_SLUG }).select('topics.id topics.title').lean(),
    Notes.find({}).select('subjectSlug sections.id sections.title').lean(),
  ]);
  const dsaItems = (sheet?.topics || []).map((t) => [`dsa:${DSA_SHEET_SLUG}:${t.id}`, String(t.title).trim()]); // one Blind 75 title has a stray leading space
  const notesItems = notes.flatMap((n) => (n.sections || []).map((s) => [`notes:${n.subjectSlug}:${s.id}`, s.title]));
  const dsaRefs = dsaItems.map(([ref]) => ref);
  return {
    skillNames,
    aliases, // used to recognise a skill under another name ("ts" for TypeScript) when checking resume tips
    dsaRefs,
    refs: [...new Set([...dsaRefs, ...notesItems.map(([ref]) => ref), ...ROADMAP_SLUGS.map((slug) => `roadmap:${slug}`)])],
    titles: Object.fromEntries([...dsaItems, ...notesItems]),
    behavioral,
    roadmapAbout: ROADMAP_SLUGS.map((slug) => `roadmap:${slug} = ${ROADMAP_ABOUT[slug]}`),
  };
};

module.exports = { buildContext, ROADMAP_SLUGS, ROADMAP_ABOUT, DSA_SHEET_SLUG, skillNames };
