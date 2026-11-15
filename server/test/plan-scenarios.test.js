// 800 different plan requests (goals, sheets and roadmaps, lengths, hours, rest days, subjects, solved and known work, lighter days, paces), 
// made from a fixed seed, run on the real data. The rules are in test/helpers/plan-scenarios.js. `node scripts/plan-fuzz.js 3000` runs more.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadPlanData } = require('../src/services/planData');
const { buildScenarios, runScenarios } = require('./helpers/plan-scenarios');

describe('800 different plan requests on the real data', () => {
  const data = loadPlanData();
  const scenarios = buildScenarios(800, data);
  it('are 800 different requests, in every kind: all goals, all sheets, all roadmaps, all paces, both styles, fresh plans and changes mid-plan', () => {
    assert.equal(scenarios.length, 800);
    assert.equal(new Set(scenarios.map((s) => JSON.stringify({ ...s, id: 0 }))).size, 800);
    const has = (key) => new Set(scenarios.map((s) => s[key]));
    assert.deepEqual([...has('goalType')].sort(), ['bigtech', 'placements', 'role']);
    assert.equal(has('sheetSlug').size - 1, 5, 'all five sheets (plus none for roadmaps)');
    assert.equal(has('roadmapSlug').size - 1, 9, 'all nine roadmaps');
    assert.deepEqual([...has('pace')].sort(), ['faster', 'slower', 'standard']);
    assert.deepEqual([...has('style')].sort(), ['mixed', 'one-topic']);
    assert.deepEqual([...has('kind')].sort(), ['fresh', 'rebuild']);
    assert.deepEqual([...has('change')].filter(Boolean).sort(), ['hours', 'lighter', 'pace', 'rebuild']);
    assert.ok(scenarios.some((s) => s.lighterDays.length) && scenarios.some((s) => s.solvedLinks.length) && scenarios.some((s) => s.knownTopics.length));
    assert.ok(scenarios.some((s) => s.hours.slice(0, 5).every((h) => h === 0)), 'weekend-only plans');
    assert.ok(scenarios.some((s) => s.weeks === 1) && scenarios.some((s) => s.weeks === 52));
  });
  it('every plan keeps every rule: no crash, nothing lost, no day over its limit, no study on a free day, solved and known work out, the pace applied, done work untouched by a change', () => {
    const stats = runScenarios(scenarios, data);
    assert.deepEqual(stats.violations.slice(0, 10), []);
    assert.ok(stats.fresh >= 500 && stats.rebuild >= 150, `${stats.fresh} fresh, ${stats.rebuild} changes`);
    assert.ok((stats.outcomes.applied || 0) >= 100, 'most changes are applied: ' + JSON.stringify(stats.outcomes));
    assert.ok(stats.cut > 100, 'a good part of the sheet plans are tight, so the fair share is really exercised');
  });
});
