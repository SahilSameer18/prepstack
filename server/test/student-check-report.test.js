const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { summarize } = require('../scripts/student-check-report');

const now = new Date('2026-11-19T10:00:00Z');
const day = (n) => new Date(now.getTime() - n * 86400000);

describe('student check report counts', () => {
  const user = { username: 'asha', email: 'secret@example.com', refreshTokens: [{ lastActive: day(5) }, { lastActive: day(1) }] };
  const plan = {
    status: 'active', createdAt: day(10),
    items: [
      { day: '2026-11-10', doneAt: day(8), completedStudyDay: '2026-11-11' },
      { day: '2026-11-11', doneAt: day(8), completedStudyDay: '2026-11-11', lastReviewDay: '2026-11-18' },
      { day: '2026-11-12', doneAt: day(2) },
      { day: '2026-11-13', skipped: true },
      { day: '2026-11-14', locked: true, plannedDay: '2026-11-12' },
      { day: '2026-11-15' },
    ],
  };

  it('counts planned, done, recent, distinct days, reviews, skipped and moved tasks', () => {
    const r = summarize(user, [plan], now);
    assert.equal(r.tasksPlanned, 5, 'skipped tasks are not planned');
    assert.equal(r.tasksDone, 3);
    assert.equal(r.doneLast7Days, 1);
    assert.equal(r.daysWithATaskDone, 2, 'two tasks on the same study day count once');
    assert.equal(r.reviewsDone, 1);
    assert.equal(r.skipped, 1);
    assert.equal(r.moved, 1);
    assert.equal(r.lastSessionActive, '2026-11-18');
    assert.equal(r.planMade, '2026-11-09');
  });

  it('never includes an email or a password hash, and handles a person with no plan', () => {
    const r = summarize(user, [], now);
    assert.equal(r.tasksDone, 0);
    assert.equal(r.planMade, null);
    assert.ok(!JSON.stringify(r).includes('secret@example.com'));
  });

  it('counts paused and finished plans', () => {
    const r = summarize(user, [{ ...plan, status: 'paused' }, { ...plan, status: 'finished', createdAt: day(30), items: [] }], now);
    assert.deepEqual(r.plans, { active: 0, paused: 1, finished: 1 });
  });
});
