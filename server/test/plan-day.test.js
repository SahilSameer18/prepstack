// Which plan day is "today": pure rule, no database.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { todayPlanDay } = require('../src/utils/planDay');

const day = (n, ...done) => ({ day: n, items: done.map((d) => ({ done: d })) });
// IST is UTC+5:30, so 2026-11-10T18:29Z is still 10 Nov in IST and 18:30Z is already 11 Nov
const at = (iso) => new Date(iso);

describe('todayPlanDay', () => {
  const plan = [day(1, false), day(2, false), day(3, false)];

  it('day 1 is the day the report was created', () => {
    assert.equal(todayPlanDay(plan, at('2026-11-10T05:00:00Z'), at('2026-11-10T09:00:00Z')), 1);
  });
  it('moves to day 2 the next IST day, and day 3 after that', () => {
    assert.equal(todayPlanDay(plan, at('2026-11-10T05:00:00Z'), at('2026-11-11T05:00:00Z')), 2);
    assert.equal(todayPlanDay(plan, at('2026-11-10T05:00:00Z'), at('2026-11-12T05:00:00Z')), 3);
  });
  it('changes at midnight IST, not midnight UTC', () => {
    const created = at('2026-11-10T05:00:00Z');
    assert.equal(todayPlanDay(plan, created, at('2026-11-10T18:29:00Z')), 1); // 23:59 IST
    assert.equal(todayPlanDay(plan, created, at('2026-11-10T18:30:00Z')), 2); // 00:00 IST
  });
  it('a report made late at night IST counts that IST day as day 1', () => {
    assert.equal(todayPlanDay(plan, at('2026-11-10T18:00:00Z'), at('2026-11-10T18:20:00Z')), 1); // 23:30 and 23:50 IST
    assert.equal(todayPlanDay(plan, at('2026-11-10T18:00:00Z'), at('2026-11-10T18:40:00Z')), 2); // 00:10 IST next day
  });
  it('a plan that skips a day number: no exact match falls back to the first unfinished day', () => {
    const skipping = [day(1, true), day(3, false), day(4, false)];
    assert.equal(todayPlanDay(skipping, at('2026-11-10T05:00:00Z'), at('2026-11-11T05:00:00Z')), 3); // day 2 is missing
  });
  it('past the end of the plan: the first day with unfinished items', () => {
    const p = [day(1, true, true), day(2, true, false), day(3, false)];
    assert.equal(todayPlanDay(p, at('2026-11-01T05:00:00Z'), at('2026-11-30T05:00:00Z')), 2);
  });
  it('everything done and past the end: null', () => {
    const p = [day(1, true), day(2, true)];
    assert.equal(todayPlanDay(p, at('2026-11-01T05:00:00Z'), at('2026-11-30T05:00:00Z')), null);
  });
  it('an exact day stays "today" even when it is finished', () => {
    const p = [day(1, false), day(2, true)];
    assert.equal(todayPlanDay(p, at('2026-11-10T05:00:00Z'), at('2026-11-11T05:00:00Z')), 2);
  });
  it('items without a done field count as not done (reports saved before ticks)', () => {
    const p = [{ day: 1, items: [{}] }, { day: 2, items: [{}] }];
    assert.equal(todayPlanDay(p, at('2026-11-01T05:00:00Z'), at('2026-11-30T05:00:00Z')), 1);
  });
  it('an empty or missing plan gives null', () => {
    assert.equal(todayPlanDay([], at('2026-11-10T05:00:00Z'), at('2026-11-10T06:00:00Z')), null);
    assert.equal(todayPlanDay(undefined, at('2026-11-10T05:00:00Z'), at('2026-11-10T06:00:00Z')), null);
  });
  it('a report created in the future (clock skew) does not crash and still points at a real day', () => {
    assert.equal(todayPlanDay(plan, at('2026-11-12T05:00:00Z'), at('2026-11-10T05:00:00Z')), 1);
  });
});
