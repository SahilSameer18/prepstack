// A role (roadmap) plan whose first step is longer than the whole plan, and Today when waiting work is larger than the day.
// Real data: the Full Stack roadmap starts with a 55 to 85 hour step.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadPlanData } = require('../src/services/planData');
const gen = require('../src/services/planGenerator');
const adj = require('../src/services/planAdjust');

const data = loadPlanData();
const role = (slug, weeks, hours, extra = {}) => gen.generatePlan({
  goalType: 'role', roadmapSlug: slug, style: 'one-topic', startDate: '2026-11-17', weeks, hoursByWeekday: Array(7).fill(hours), restDay: null, subjects: [], ...extra,
}, data);
const sum = (list) => list.reduce((s, i) => s + i.plannedMinutes, 0);

describe('role plans when the first step is longer than the plan', () => {
  it('plans the first step in parts and reports the rest, instead of an empty plan', () => {
    const p = role('fullstack', 8, 1.5);
    assert.ok(p.coverage.plannedItems >= 1, 'a plan with free time is never empty');
    const parts = p.items.filter((i) => i.stepId === 'frontend-development' && i.type === 'roadmap' && i.part);
    assert.ok(parts.length > 20);
    assert.ok(parts.every((i) => i.part.of === parts.length + 1), 'the unscheduled rest is the last part');
    const rest = p.coverage.leftOut.find((l) => l.partial);
    assert.ok(rest && rest.stepId === 'frontend-development');
    assert.equal(sum(parts) + rest.plannedMinutes, 4200, 'nothing lost: placed parts plus the rest are the whole step');
    assert.equal(p.coverage.syllabusMinutes, p.coverage.plannedMinutes + sum(p.coverage.leftOut));
    assert.ok(p.notices.includes('core-does-not-fit'));
  });
  it('plannedItems counts tasks, not parts', () => {
    const p = role('fullstack', 52, 2);
    assert.equal(p.coverage.plannedItems, p.coverage.syllabusItems);
    assert.equal(p.coverage.leftOut.length, 0);
  });
  it('no role is ever empty while there are study hours, from half an hour for a week to 4 hours for 16 weeks', () => {
    for (const road of data.roadmapCatalog) {
      for (const hours of [0.5, 1, 2, 4]) {
        for (const weeks of [1, 4, 16]) {
          const p = role(road.slug, weeks, hours);
          assert.ok(p.coverage.plannedItems > 0, `${road.slug} ${weeks}w ${hours}h`);
          for (const d of p.days) assert.ok(d.minutes <= d.plannedCap, `${road.slug} ${d.date}`);
        }
      }
    }
  });
  it('a rebuild with more time plans the rest of the step, and no minutes are lost or doubled', () => {
    const p = role('fullstack', 4, 2);
    const done = p.items.map((i) => ({ ...i, doneAt: `${i.day}T08:00:00Z` }));
    const stored = { input: p.input, startDate: p.startDate, deadline: p.deadline, items: done, coverage: p.coverage };
    const before = sum(done.filter((i) => i.stepId === 'frontend-development' && i.ref === 'roadmap:fullstack'));
    const out = adj.previewChange(stored, data, '2026-12-15', { type: 'rebuild', deadline: '2027-04-30' });
    const parts = out.plan.items.filter((i) => i.stepId === 'frontend-development' && i.ref === 'roadmap:fullstack');
    assert.equal(sum(parts), 4200, 'the step totals its planned time once');
    assert.ok(sum(parts) > before, 'the rest is planned');
  });
});

describe('Today when waiting work is larger than the day', () => {
  const input = { goalType: 'placements', startDate: '2026-11-16', hoursByWeekday: Array(7).fill(0.5), restDay: 6, lighterDays: [] };
  const stored = (items) => ({ input, startDate: '2026-11-16', deadline: '2026-12-31', items });
  it('offers the smallest waiting task instead of an empty screen', () => {
    const items = [
      { key: 'big', day: '2026-11-17', plannedMinutes: 252 },
      { key: 'smaller', day: '2026-11-18', plannedMinutes: 90 },
    ];
    const view = adj.todayView(stored(items), '2026-11-19');
    assert.deepEqual(view.items.map((i) => i.key), ['smaller']);
    assert.equal(view.startItem.key, 'smaller');
  });
  it('still shows nothing on the rest day, and keeps a fitting task as before', () => {
    const items = [{ key: 'big', day: '2026-11-17', plannedMinutes: 252 }];
    assert.deepEqual(adj.todayView(stored(items), '2026-11-22').items, []);
    const fits = [{ key: 'big', day: '2026-11-17', plannedMinutes: 252 }, { key: 'small', day: '2026-11-18', plannedMinutes: 20 }];
    assert.deepEqual(adj.todayView(stored(fits), '2026-11-19').items.map((i) => i.key), ['small']);
  });
});
