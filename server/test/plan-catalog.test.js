// The data the goal planner ("My plan") reads on the server: the two catalog files, the NeetCode 150 sheet it plans from, and its limits.
// If someone changes a roadmap, adds a sheet topic or edits the NeetCode seed, these tests say what to update.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const roadmapCatalog = require('../src/data/roadmapCatalog.json');
const planCatalog = require('../src/data/planCatalog.json');
const { buildRoadmapCatalog, buildPlanCatalog } = require('../scripts/build-plan-catalogs');
const limits = require('../src/config/limits');

const SHEETS = { 'blind-75': 'blind75', 'neetcode-150': 'neetCodeSeed', 'striver-sde': 'striverSDESeed', 'striver-a2z': 'striverA2ZSeed', 'love-babbar': 'loveBabbarSeed' };
const sheet = (slug) => require(`../src/seed/sheetSeeds/${SHEETS[slug]}`).data;

describe('roadmapCatalog.json (a server copy of client/src/data/roadmaps.js)', () => {
  it('equals what the build script makes from the client roadmaps (run `npm run build:plan-catalogs` after changing a roadmap)', async () => {
    assert.deepEqual(roadmapCatalog, JSON.parse(JSON.stringify(await buildRoadmapCatalog())));
  });
  it('has the 9 roadmaps, every step with a time range, a project and its practice links', () => {
    assert.equal(roadmapCatalog.length, 9);
    for (const r of roadmapCatalog) for (const s of r.steps) {
      assert.ok(s.id && s.title, `${r.slug} has a step without id or title`);
      assert.ok(s.from > 0 && s.to >= s.from && ['hours', 'days', 'weeks', 'months'].includes(s.unit), `${r.slug}/${s.id} time`);
      assert.ok(s.project.brief && s.project.stack, `${r.slug}/${s.id} project`);
    }
    assert.equal(roadmapCatalog.reduce((n, r) => n + r.steps.length, 0), 83);
  });
});

describe('planCatalog.json (order and core or extra for every DSA sheet topic)', () => {
  it('equals what the build script makes (run `npm run build:plan-catalogs` after changing a sheet topic)', async () => {
    assert.deepEqual(planCatalog, JSON.parse(JSON.stringify(buildPlanCatalog(await buildRoadmapCatalog()))));
  });
  it('has an entry for every topic of every sheet, and none for a topic that does not exist', () => {
    for (const slug of Object.keys(SHEETS)) {
      const ids = sheet(slug).topics.map((t) => t.id);
      assert.deepEqual(Object.keys(planCatalog.sheets[slug]).sort(), [...ids].sort(), slug);
    }
    assert.equal(Object.values(planCatalog.sheets).reduce((n, s) => n + Object.keys(s).length, 0), 134);
  });
  it('puts every topic on a step of our DSA roadmap, and the order is that step\'s place in the roadmap', () => {
    const dsa = roadmapCatalog.find((r) => r.slug === 'dsa').steps.map((s) => s.id);
    assert.deepEqual(planCatalog.steps, dsa);
    for (const topics of Object.values(planCatalog.sheets)) for (const [id, e] of Object.entries(topics)) {
      assert.ok(dsa.includes(e.step), `${id}: step ${e.step}`);
      assert.equal(e.order, dsa.indexOf(e.step) + 1, id);
      assert.equal(typeof e.core, 'boolean', id);
    }
  });
  it('every topic of the Blind 75 sheet is core (core means the idea has its own place in that sheet), and each sheet has some extra topics except Blind 75', () => {
    assert.ok(Object.values(planCatalog.sheets['blind-75']).every((e) => e.core));
    for (const slug of ['neetcode-150', 'striver-sde', 'striver-a2z', 'love-babbar']) {
      const list = Object.values(planCatalog.sheets[slug]);
      assert.ok(list.some((e) => e.core) && list.some((e) => !e.core), `${slug} should have core and extra topics`);
    }
  });
});

describe('the NeetCode 150 sheet the planner plans from', () => {
  const topics = sheet('neetcode-150').topics;
  const problems = topics.flatMap((t) => t.problems.map((p) => ({ ...p, topic: t.id })));
  it('has exactly 150 problems and no link twice (Word Search II and Longest Common Subsequence were once listed twice)', () => {
    assert.equal(problems.length, 150);
    assert.equal(new Set(problems.map((p) => p.link)).size, 150);
  });
  it('has the counts neetcode.io lists per topic, Subsets II in Backtracking and the name N-Queens', () => {
    const count = (id) => topics.find((t) => t.id === id).problems.length;
    assert.deepEqual([count('backtracking'), count('trie'), count('1d-dynamic-programming'), count('2d-dynamic-programming')], [10, 3, 12, 11]);
    assert.ok(problems.some((p) => p.topic === 'backtracking' && p.title === 'Subsets II' && p.link === 'https://leetcode.com/problems/subsets-ii/'));
    assert.ok(problems.some((p) => p.title === 'N-Queens') && !problems.some((p) => p.title === 'N Queens'));
    assert.equal(problems.filter((p) => p.title === 'Word Search II').length, 1);
    assert.equal(problems.filter((p) => p.title === 'Longest Common Subsequence').length, 1);
  });
});

describe('the plan limits in limits.js', () => {
  it('are whole numbers above 0, and the ranges make sense', () => {
    for (const k of ['PLAN_PREVIEWS_PER_MINUTE', 'PLAN_GENERATES_PER_HOUR', 'PLAN_MAX_ITEMS', 'PLAN_TITLE_MAX', 'PLAN_CUSTOM_ITEM_MAX', 'PLAN_MIN_WEEKS', 'PLAN_MAX_WEEKS']) {
      assert.ok(Number.isInteger(limits[k]) && limits[k] > 0, k);
    }
    assert.ok(limits.PLAN_MIN_WEEKS < limits.PLAN_MAX_WEEKS && limits.PLAN_MIN_DAILY_HOURS < limits.PLAN_MAX_DAILY_HOURS);
    assert.ok(limits.PLAN_CUSTOM_ITEM_MAX >= limits.PLAN_TITLE_MAX);
  });
});
