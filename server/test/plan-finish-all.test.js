// "When would I finish everything at these hours?": the preview plans the same request over the longest plan allowed (real data).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadPlanData } = require('../src/services/planData');
const gen = require('../src/services/planGenerator');

const data = loadPlanData();
const ask = (over) => ({
  goalType: 'bigtech', style: 'mixed', startDate: '2026-11-16', sheetSlug: 'neetcode-150', subjects: ['os', 'dbms', 'cn'],
  weeks: 9, hoursByWeekday: Array(7).fill(2), restDay: null, ...over,
});

describe('finish date for the whole syllabus', () => {
  it('is after the deadline, and a plan that long really holds everything', () => {
    for (const over of [{}, { weeks: 4 }, { weeks: 12, hoursByWeekday: [2, 2, 2, 2, 2, 4, 4] }, { goalType: 'placements', sheetSlug: 'striver-sde', weeks: 8 }]) {
      const preview = gen.previewPlan(ask(over), data);
      const all = preview.coverage.finishAll;
      assert.ok(all && all.date && all.date > preview.deadline, JSON.stringify(over));
      assert.equal(all.weeks, Math.ceil((gen.dayNumber(all.date) - gen.dayNumber(preview.startDate) + 1) / 7));
      const whole = gen.generatePlan(ask({ ...over, weeks: all.weeks }), data);
      assert.equal(whole.coverage.leftOut.length, 0, 'a plan of that many weeks leaves nothing out: ' + JSON.stringify(over));
      assert.ok(whole.finishDate <= all.date);
    }
  });
  it('is absent when everything already fits or nothing fits', () => {
    assert.equal(gen.previewPlan(ask({ goalType: 'placements', sheetSlug: 'blind-75', weeks: 40, subjects: [] }), data).coverage.finishAll, null);
    const none = gen.previewPlan(ask({ goalType: 'placements', sheetSlug: 'striver-sde', weeks: 1, hoursByWeekday: [0, 0, 0, 0, 0, 0.1 * 5, 0] }), data);
    assert.ok(none.notices.includes('nothing-fits'), 'half an hour on one day, in one week: no task fits');
    assert.equal(none.coverage.finishAll, null);
  });
  it('says "more than a year" when even the longest plan cannot hold it', () => {
    const preview = gen.previewPlan(ask({ weeks: 52, hoursByWeekday: Array(7).fill(0.5), subjects: ['os', 'dbms', 'cn', 'oops', 'hld'] }), data);
    assert.deepEqual(preview.coverage.finishAll, { tooLong: true });
  });
});
