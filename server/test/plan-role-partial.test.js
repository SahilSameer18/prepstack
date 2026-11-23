// A role (roadmap) plan whose first step is longer than the whole plan, and Today when waiting work is larger than the day.
// Real data: the Full Stack roadmap starts with a 55 to 85 hour step.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadPlanData } = require('../src/modules/plan/planData');
const gen = require('../src/modules/plan/planGenerator');
const adj = require('../src/modules/plan/planAdjust');

const data = loadPlanData();
const role = (slug, weeks, hours, extra = {}) => gen.generatePlan({
  generationVersion: 1, goalType: 'role', roadmapSlug: slug, style: 'one-topic', startDate: '2026-11-17', weeks, hoursByWeekday: Array(7).fill(hours), restDay: null, subjects: [], ...extra,
}, data);
const sum = (list) => list.reduce((s, i) => s + i.plannedMinutes, 0);

describe('version 2 roadmap milestones', () => {
  it('does not turn Vite setup into an equal multi-hour share of the whole frontend course', () => {
    const p = role('fullstack',12,3,{generationVersion:2});
    const setup = p.items.filter(item=>item.milestoneId?.startsWith('topic-1-') && item.stepId==='frontend-development');
    assert.equal(sum(setup),90);
    assert.ok(!setup.some(item=>item.title.startsWith('Apply and review:')));
  });
  it('skipping an unfinished part preserves the completed part and its timestamp', () => {
    const done = {key:'a',ref:'roadmap:frontend',stepId:'html',milestoneId:'topic-1-learn',type:'roadmap',part:{n:1,of:2},doneAt:'2026-11-17T08:00:00Z'};
    const waiting = {...done,key:'b',part:{n:2,of:2},doneAt:null};
    const result = adj.skipItem([done,waiting],'b',data);
    assert.deepEqual(result.items[0],done);
    assert.equal(result.items[1].skipped,true);
  });
  it('keeps every estimated minute and topic order, with explicit practice during the first study week', () => {
    for (const road of data.roadmapCatalog) {
      const p = role(road.slug, 12, 1, { generationVersion: 2, hoursByWeekday: [1, 1, 1, 1, 1, 3, 3], restDay: 6 });
      const legacy = role(road.slug, 12, 1, { generationVersion: 1 });
      assert.equal(p.coverage.syllabusMinutes, legacy.coverage.syllabusMinutes, road.slug);
      assert.equal(p.coverage.syllabusMinutes, p.coverage.plannedMinutes + sum(p.coverage.leftOut));
      assert.equal(new Set(p.items.map((item) => item.key)).size, p.items.length);
      const practice = p.items.find((item) => item.activity === 'practice');
      assert.ok(practice && gen.dayNumber(practice.day) - gen.dayNumber(p.startDate) < 7, road.slug);
      assert.ok(p.items[0].title.startsWith('Learn:'));
      assert.ok(p.items.every((item) => item.type !== 'roadmap' || item.objective));
      for (const day of p.days) assert.ok(day.minutes <= day.plannedCap);
      const first = p.items.findIndex((item) => item.activity === 'practice');
      assert.ok(p.items.slice(0, first).every((item) => item.activity === 'learn'));
    }
  });
  it('freezes curriculum and preserves a completed milestone through repeated rebuilds', () => {
    const p = role('frontend', 12, 2, { generationVersion: 2 });
    const first = p.items[0];
    const stored = { input: p.input, startDate: p.startDate, deadline: p.deadline,
      coverage: p.coverage, items: p.items.map((item) => item.key === first.key ? { ...item, doneAt: '2026-11-17T08:00:00Z' } : item) };
    const edited = structuredClone(data);
    const road = edited.roadmapCatalog.find((item) => item.slug === 'frontend');
    road.steps[0].topics.unshift('A later content edit');
    const a = adj.previewChange(stored, edited, '2026-11-18', { type: 'rebuild' }).plan;
    const b = adj.previewChange(a, edited, '2026-11-19', { type: 'rebuild' }).plan;
    assert.equal(b.items.find((item) => item.key === first.key).doneAt, '2026-11-17T08:00:00Z');
    assert.ok(!b.items.some((item) => item.title.includes('A later content edit')));
    assert.equal(new Set(b.items.map((item) => item.key)).size, b.items.length);
  });
  it('keeps a separate durable remainder for a partly completed milestone', () => {
    const p = role('fullstack', 1, .5, { generationVersion: 2 });
    const omitted = p.coverage.leftOut.find((item) => item.partial);
    const first = p.items.find((item) => item.milestoneId === omitted.milestoneId);
    const group = p.items.filter((item) => gen.baseId(item) === gen.baseId(first));
    assert.ok(group[0].part.of > group.length);
    const done = p.items.map((item) => group.includes(item) ? { ...item, doneAt: item.day + 'T08:00:00Z' } : item);
    const stored = { input:p.input, startDate:p.startDate, deadline:p.deadline, items:done, coverage:p.coverage };
    const result = adj.previewChange(stored, data, p.deadline, {type:'rebuild',deadline:'2027-02-01'});
    assert.equal(result.plan.items.filter((item) => gen.baseId(item) === gen.baseId(first)).reduce((n,item)=>n+item.plannedMinutes,0), sum(group) + omitted.plannedMinutes);
  });
  it('Start follows the earliest unfinished lesson instead of a shorter future practice task', () => {
    const input = { goalType:'role', generationVersion:2, hoursByWeekday:Array(7).fill(1), restDay:null };
    const stored = { input, startDate:'2026-11-16', deadline:'2026-12-31', items:[
      {key:'learn',day:'2026-11-16',plannedMinutes:60,order:0},
      {key:'practice',day:'2026-11-17',plannedMinutes:30,order:1},
    ] };
    assert.equal(adj.todayView(stored,'2026-11-17').startItem.key,'learn');
    stored.items[0].plannedMinutes = 90;
    assert.equal(adj.todayView(stored,'2026-11-17').startItem.key,'learn','an oversized carried lesson cannot be bypassed by shorter practice');
  });
});

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
