// Builds the two files the goal planner ("My plan") reads on the server. Run: npm run build:plan-catalogs
//
//   src/shared/content/roadmapCatalog.json  a copy of what the planner needs from client/src/data/roadmaps.js (the roadmap content lives in the
//                                 client). test/plan-catalog.test.js fails when the copy and the client data differ.
//   src/modules/plan/planCatalog.json     for every topic of every DSA sheet: the step of our DSA roadmap it belongs to (this gives the order:
//                                 the planner follows the DSA roadmap) and whether it is "core" or "extra".
//
// "core" is our own judgement, not a count of what interviews ask: a topic is core when its idea has its own place in the Blind 75
// sheet (arrays and hashing, two pointers, linked lists, trees, graphs, dynamic programming, ...). Everything else is "extra".
// Core topics are planned first when time is short; no frequency claim is made anywhere.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const DATA = path.join(__dirname, '..', 'src', 'modules', 'plan');
const SHEETS = ['blind75', 'neetCodeSeed', 'striverSDESeed', 'striverA2ZSeed', 'loveBabbarSeed'];

const STEP = {
  hash: 'big-o-arrays-hashing', two: 'two-pointers-sliding-window', bs: 'sorting-binary-search', ll: 'linked-lists-stacks-queues',
  tree: 'trees-bst', heap: 'heaps-tries', rec: 'recursion-backtracking', graph: 'graphs-traversal', sp: 'graphs-shortest-paths-mst',
  greedy: 'greedy-intervals', dp: 'dynamic-programming', bit: 'bit-manipulation-math', practice: 'interview-practice',
};

// topic id -> [step, core]. A sheet-by-sheet table so a reviewer can read every judgement.
const MAP = {
  'blind-75': {
    'arrays-hashing': [STEP.hash, 1], 'two-pointers': [STEP.two, 1], 'sliding-window': [STEP.two, 1], stack: [STEP.ll, 1], 'binary-search': [STEP.bs, 1],
    'linked-list': [STEP.ll, 1], trees: [STEP.tree, 1], 'heap-priority-queue': [STEP.heap, 1], backtracking: [STEP.rec, 1], trie: [STEP.heap, 1],
    graph: [STEP.graph, 1], 'dynamic-programming': [STEP.dp, 1], '2-d-dynamic-programming': [STEP.dp, 1], greedy: [STEP.greedy, 1],
    intervals: [STEP.greedy, 1], 'math-geometry': [STEP.bit, 1], 'bit-manipulation': [STEP.bit, 1],
  },
  'neetcode-150': {
    'arrays-hashing': [STEP.hash, 1], 'two-pointers': [STEP.two, 1], 'sliding-window': [STEP.two, 1], stack: [STEP.ll, 1], 'binary-search': [STEP.bs, 1],
    'linked-list': [STEP.ll, 1], trees: [STEP.tree, 1], 'heap-priority-queue': [STEP.heap, 1], backtracking: [STEP.rec, 1], trie: [STEP.heap, 1],
    graph: [STEP.graph, 1], 'advanced-graphs': [STEP.sp, 0], '1d-dynamic-programming': [STEP.dp, 1], '2d-dynamic-programming': [STEP.dp, 1],
    greedy: [STEP.greedy, 1], intervals: [STEP.greedy, 1], 'math-geometry': [STEP.bit, 1], 'bit-manipulation': [STEP.bit, 1],
  },
  'striver-sde': {
    arrays: [STEP.hash, 1], hashing: [STEP.hash, 1], strings: [STEP.hash, 0],
    'binary-search': [STEP.bs, 1],
    'sliding-window-and-two-pointers': [STEP.two, 1],
    'recursion-and-backtracking': [STEP.rec, 1],
    'linked-list': [STEP.ll, 1], 'stack-and-queues': [STEP.ll, 1],
    'greedy-algorithms': [STEP.greedy, 1],
    heaps: [STEP.heap, 1], tries: [STEP.heap, 1],
    'binary-trees': [STEP.tree, 1], 'binary-search-trees': [STEP.tree, 1],
    graphs: [STEP.graph, 1],
    'dynamic-programming': [STEP.dp, 1],
    'bit-manipulation': [STEP.bit, 1], mathematics: [STEP.bit, 0],
  },
  'striver-a2z': {
    'beginner-problem': [STEP.hash, 0], sorting: [STEP.bs, 0],
    arrays: [STEP.hash, 1], hashing: [STEP.hash, 1],
    'binary-search': [STEP.bs, 1],
    'strings-basic-and-medium': [STEP.hash, 0], 'strings-advanced-algo': [STEP.hash, 0],
    recursion: [STEP.rec, 1],
    'linked-list': [STEP.ll, 1], 'stack-and-queues': [STEP.ll, 1],
    'bit-manipulation': [STEP.bit, 1], maths: [STEP.bit, 0],
    'greedy-algorithms': [STEP.greedy, 1],
    'sliding-window-and-2-pointer': [STEP.two, 1],
    'binary-trees': [STEP.tree, 1], 'binary-search-trees': [STEP.tree, 1],
    heaps: [STEP.heap, 1], tries: [STEP.heap, 1],
    graph: [STEP.graph, 1],
    'dynamic-programming': [STEP.dp, 1],
  },
  'love-babbar': {
    array: [STEP.hash, 1], string: [STEP.hash, 0], matrix: [STEP.bit, 1], 'searching-sorting': [STEP.bs, 1], 'linked-list': [STEP.ll, 1], 'stacks-queues': [STEP.ll, 1],
    'binary-tree': [STEP.tree, 1], 'binary-search-tree': [STEP.tree, 1], heap: [STEP.heap, 1], trie: [STEP.heap, 1], backtracking: [STEP.rec, 1],
    graph: [STEP.graph, 1], greedy: [STEP.greedy, 1], 'dynamic-programming': [STEP.dp, 1], 'bit-manipulation': [STEP.bit, 1],
  },
};

const parseTime = (time) => {
  const m = /^(\d+) to (\d+) (hours|days|weeks|months)$/.exec(time);
  if (!m) throw new Error(`roadmap time "${time}" is not "N to M hours/days/weeks/months"`);
  return { from: Number(m[1]), to: Number(m[2]), unit: m[3] };
};

const buildRoadmapCatalog = async () => {
  const { roadmaps } = await import(pathToFileURL(path.join(__dirname, '..', '..', 'client', 'src', 'data', 'roadmaps.js')).href);
  return roadmaps.map((r) => ({
    slug: r.slug,
    title: r.title,
    steps: r.steps.map((s) => ({
      id: s.id,
      title: s.title,
      goal: s.goal,
      topics: s.topics,
      checkpoint: s.checkpoint,
      time: s.time,
      ...parseTime(s.time),
      practice: (s.practice || []).map(({ kind, target, label }) => ({ kind, target, label })),
      project: { brief: s.project.brief, stack: s.project.stack },
    })),
  }));
};

const buildPlanCatalog = (roadmapCatalog) => {
  const dsa = roadmapCatalog.find((r) => r.slug === 'dsa');
  const stepOrder = Object.fromEntries(dsa.steps.map((s, i) => [s.id, i + 1]));
  const sheets = {};
  for (const file of SHEETS) {
    const sheet = require(path.join('..', 'src', 'modules', 'sheets', 'seeds', 'sheetSeeds', file)).data;
    const table = MAP[sheet.slug];
    if (!table) throw new Error(`no mapping for sheet ${sheet.slug}`);
    sheets[sheet.slug] = {};
    for (const topic of sheet.topics) {
      const entry = table[topic.id];
      if (!entry) throw new Error(`sheet ${sheet.slug}: topic "${topic.id}" has no entry in MAP`);
      if (!stepOrder[entry[0]]) throw new Error(`sheet ${sheet.slug}: topic "${topic.id}" points at unknown step ${entry[0]}`);
      sheets[sheet.slug][topic.id] = { step: entry[0], order: stepOrder[entry[0]], core: entry[1] === 1 };
    }
    const extra = Object.keys(table).filter((id) => !(id in sheets[sheet.slug]));
    if (extra.length) throw new Error(`sheet ${sheet.slug}: MAP has topics the sheet does not: ${extra.join(', ')}`);
  }
  return { steps: dsa.steps.map((s) => s.id), sheets };
};

module.exports = { buildRoadmapCatalog, buildPlanCatalog, MAP };

if (require.main === module) {
  (async () => {
    const roadmapCatalog = await buildRoadmapCatalog();
    const planCatalog = buildPlanCatalog(roadmapCatalog);
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'shared', 'content', 'roadmapCatalog.json'), JSON.stringify(roadmapCatalog, null, 1) + '\n');
    fs.writeFileSync(path.join(DATA, 'planCatalog.json'), JSON.stringify(planCatalog, null, 1) + '\n');
    console.log(`roadmapCatalog.json: ${roadmapCatalog.length} roadmaps, ${roadmapCatalog.reduce((n, r) => n + r.steps.length, 0)} steps`);
    console.log(`planCatalog.json: ${Object.entries(planCatalog.sheets).map(([s, t]) => `${s} ${Object.keys(t).length}`).join(', ')}`);
    process.exit(0);
  })().catch((e) => { console.error(e.message); process.exit(1); });
}
