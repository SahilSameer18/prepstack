// The skill catalog: finding a skill in free text, and turning a skill into things a student can DO in PrepStack.
// The catalog (src/data/skillCatalog.json) is the one source of truth: names, aliases, a docs link and a video link, and a
// "prepstack" object saying which PrepStack content teaches the skill. Nothing here touches a database.
const catalog = require('../data/skillCatalog.json');

// ── finding a skill in text ──
const normalise = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

// A term counts only as a whole word: "java" is not in "javascript", "go" is not in "django", "ts" is not in "results".
const findBounded = (text, term) => {
  let from = 0;
  while (from <= text.length) {
    const i = text.indexOf(term, from);
    if (i === -1) return -1;
    const before = i > 0 ? text[i - 1] : '';
    const after = i + term.length < text.length ? text[i + term.length] : '';
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return i;
    from = i + 1;
  }
  return -1;
};

const editDistance = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
  return dp[a.length][b.length];
};

// Fuzzy matching is a SUGGESTION ("did you mean X?"), never a fact, and is deliberately strict: only long terms (7+ letters),
// one typo at most, the same first letter, and never a word that is itself the exact name of another skill. Short names such
// as "Flask", "Swift", "Redis" are never fuzzy-matched, because one wrong letter turns them into a different technology.
const FUZZY_MIN_TERM = 7;

/** Build a lookup from { "Skill name": ["alias", ...] }. Works with the real catalog or the small one the tests pass in. */
const makeIndex = (aliasesByName) => {
  const skills = Object.entries(aliasesByName).map(([name, aliases]) => ({ name, terms: [...new Set([normalise(name), ...aliases.map(normalise)])].filter(Boolean) }));
  const exactTerms = new Map();
  for (const s of skills) for (const t of s.terms) if (!exactTerms.has(t)) exactTerms.set(t, s.name);
  return { skills, exactTerms };
};
const catalogIndex = makeIndex(Object.fromEntries(catalog.map((s) => [s.name, s.aliases])));

/**
 * Which catalog skill does this text name? -> { name, how } with how = "exact" | "alias" | "fuzzy" | "none".
 *   exact  the whole text is a skill name or alias
 *   alias  a skill name or alias appears as a whole word (the one that appears EARLIEST wins; a longer term wins a tie)
 *   fuzzy  a close spelling of a long skill name: only a suggestion
 */
const matchSkillText = (text, index = catalogIndex) => {
  const t = normalise(text);
  if (!t) return { name: null, how: 'none' };
  if (index.exactTerms.has(t)) return { name: index.exactTerms.get(t), how: 'exact' };
  let best = null;
  for (const s of index.skills) {
    for (const term of s.terms) {
      const pos = findBounded(t, term);
      if (pos === -1) continue;
      if (!best || pos < best.pos || (pos === best.pos && term.length > best.len)) best = { name: s.name, pos, len: term.length };
    }
  }
  if (best) return { name: best.name, how: 'alias' };
  let fuzzy = null;
  for (const token of t.split(/[^a-z0-9+.#]+/).filter((x) => x.length >= 5)) {
    if (index.exactTerms.has(token)) continue; // a real name of another skill is never "corrected"
    for (const s of index.skills) {
      for (const term of s.terms) {
        if (term.length < FUZZY_MIN_TERM || token[0] !== term[0] || Math.abs(term.length - token.length) > 1) continue;
        if (editDistance(token, term) === 1 && (!fuzzy || term.length > fuzzy.len)) fuzzy = { name: s.name, len: term.length };
      }
    }
  }
  return fuzzy ? { name: fuzzy.name, how: 'fuzzy' } : { name: null, how: 'none' };
};

// ── what a student can do about a skill ──
const SUBJECTS = { os: 'Operating Systems', dbms: 'DBMS', cn: 'Computer Networks', oops: 'OOP' };
const ROADMAP_TITLES = { frontend: 'Frontend', backend: 'Backend', fullstack: 'Full Stack', android: 'Android', 'data-analytics': 'Data Analytics', 'machine-learning': 'Machine Learning', 'dsa': 'DSA & Problem Solving', 'java-spring': 'Java & Spring Boot', 'devops-cloud': 'DevOps & Cloud' };
const DSA_SHEET = { slug: 'blind-75', name: 'Blind 75' };
const bySkill = new Map(catalog.map((s) => [s.name, s]));
const byId = new Map(catalog.map((s) => [s.id, s]));
const skillById = (id) => byId.get(id) || null;

/**
 * One skill -> { id, name, category, resources, actions }. `titles` maps a ref ("notes:os:os-deadlocks", "dsa:blind-75:graph") to its readable
 * title (the context builds it from the database), because the catalog stores permanent ids and the labels need the titles.
 *   resources  the docs link and the video link (external, so they may go out of date)
 *   actions    what PrepStack itself offers: practise DSA topics, read CS notes, follow a roadmap, build a project.
 *              Each action has a `path` inside the PrepStack app. An empty list means PrepStack has nothing for this skill yet.
 */
const adviceFor = (skillName, titles) => {
  const s = bySkill.get(skillName);
  if (!s) return null;
  const actions = [];
  const p = s.prepstack;
  if (p.dsaTopics.length) {
    const topics = p.dsaTopics.map((id) => titles[`dsa:${DSA_SHEET.slug}:${id}`] || id);
    actions.push({ kind: 'dsa', label: `Practise ${topics.join(', ')}`, path: `/dsa/${DSA_SHEET.slug}`, topics, topicIds: p.dsaTopics });
  }
  const subjects = [...new Set(p.notes.map((n) => n.subject))];
  for (const subject of subjects) {
    const sectionIds = p.notes.filter((n) => n.subject === subject).map((n) => n.sectionId);
    const sections = sectionIds.map((id) => titles[`notes:${subject}:${id}`] || id);
    actions.push({ kind: 'notes', label: `Read ${SUBJECTS[subject]} notes: ${sections.join(', ')}`, path: `/notes/${subject}/${sectionIds[0]}`, sections, sectionIds }); // opens the first of the sections
  }
  if (p.roadmap) actions.push({ kind: 'roadmap', label: `Follow the ${ROADMAP_TITLES[p.roadmap]} roadmap`, path: `/roadmaps/${p.roadmap}` });
  // soft skills (communication, teamwork, leadership, problem solving) are practised on the Behavioral Prep page
  if (p.behavioral) actions.push({ kind: 'behavioral', label: 'Practise behavioral questions', path: '/behavioral' });
  if (p.projectStack) actions.push({ kind: 'project', label: `Build a project with ${p.projectStack}`, path: `/ai-projects?stack=${encodeURIComponent(p.projectStack)}`, stack: p.projectStack });
  return { id: s.id, name: s.name, category: s.category, resources: s.resources, actions };
};

/** Advice for every skill a report points at (the gaps and the plan), keyed by skill name. Computed on every read, so a better
 *  catalog improves old reports too and no link is ever stored. */
const adviceForReport = (report, titles) => {
  const names = new Set();
  for (const r of report.requirements || []) if (r.status !== 'met' && r.skillKey && r.skillKey !== 'none') names.add(r.skillKey);
  for (const d of report.plan || []) for (const i of d.items || []) if (i.skillKey && i.skillKey !== 'none') names.add(i.skillKey);
  return Object.fromEntries([...names].map((n) => [n, adviceFor(n, titles)]).filter(([, a]) => a));
};

module.exports = { matchSkillText, makeIndex, adviceFor, adviceForReport, skillById, editDistance, findBounded, catalog, DSA_SHEET, SUBJECTS, ROADMAP_TITLES };
