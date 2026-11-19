// Scenario sweep for the plan generator: many goals, sheets, lengths and daily hours, on the real sheets and notes.
// It writes nothing. Run: cd server && node scripts/plan-scenarios.js
// It reports how often a plan cuts something and which parts of the request disappear completely
// (a chosen CS subject with 0 sections, fewer than half of the DSA topic groups). Used for docs/plans/MY_PLAN_COVERAGE_PLAN.md.
const path = require('node:path');
const gen = require(path.join(__dirname, '../src/modules/plan/planGenerator'));
const { loadPlanData } = require(path.join(__dirname, '../src/modules/plan/planData'));

const SUBJECTS = ['os', 'dbms', 'cn', 'oops'];
const GOALS = [['bigtech', 'neetcode-150'], ['bigtech', 'striver-sde'], ['placements', 'striver-a2z'], ['placements', 'blind-75'], ['placements', 'love-babbar']];
const group = (title) => String(title || '').replace(/ - [IVX]+$/, '');

(async () => {
  let data = loadPlanData();
  if (data.then) data = await data;
  const rows = [];
  for (const [goalType, sheetSlug] of GOALS) {
    for (const weeks of [1, 2, 4, 6, 8, 12, 16, 26]) {
      for (const h of [1, 2, 3, 5]) {
        for (const style of ['one-topic', 'mixed']) {
          const input = { goalType, style, startDate: '2026-11-16', weeks, hoursByWeekday: [h, h, h, h, h, h + 1, h + 1], restDay: 6, sheetSlug, subjects: SUBJECTS, knownTopics: [], solvedLinks: [] };
          let plan;
          try { plan = gen.generatePlan(input, data); } catch (error) { rows.push({ goalType, sheetSlug, weeks, h, style, error: (error.messages || [error.message])[0] }); continue; }
          const allGroups = new Set(data.sheets[sheetSlug].topics.map((t) => group(t.title)));
          const groups = new Set();
          const notes = {};
          for (const it of plan.items) {
            if (it.type === 'dsa') groups.add(group(it.topicTitle));
            if (it.type === 'notes') { const s = it.ref.split(':')[1].split('-')[0]; notes[s] = (notes[s] || 0) + 1; }
          }
          rows.push({ goalType, sheetSlug, weeks, h, style, items: plan.items.length, groups: groups.size, allGroups: allGroups.size, missing: SUBJECTS.filter((s) => !notes[s]), left: plan.coverage.leftOut.length });
        }
      }
    }
  }
  const ok = rows.filter((r) => !r.error);
  const cut = ok.filter((r) => r.left > 0);
  console.log('scenarios', rows.length, '| errors', rows.length - ok.length, '| empty plans', ok.filter((r) => !r.items).length);
  console.log('plans that cut something:', cut.length);
  console.log('  with a chosen CS subject at 0 sections:', cut.filter((r) => r.missing.length).length);
  console.log('  with fewer than half of the DSA topic groups:', cut.filter((r) => r.groups < 0.5 * r.allGroups).length);
  for (const r of ok.filter((x) => x.style === 'one-topic' && x.h === 2 && x.sheetSlug === 'striver-a2z')) {
    console.log(`placements, Striver A2Z, 2 h weekdays, ${r.weeks} w: ${r.items} items, DSA groups ${r.groups}/${r.allGroups}, subjects with 0 sections [${r.missing}], left out ${r.left}`);
  }
})();
