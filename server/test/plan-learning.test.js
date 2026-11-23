const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const learning = require('../src/modules/plan/planLearning');
const gen = require('../src/modules/plan/planGenerator');
const adj = require('../src/modules/plan/planAdjust');
const { getPlanData } = require('../src/modules/plan/planData');

const data = getPlanData();
const day = '2026-11-23';
const input = { goalType: 'placements', style: 'one-topic', startDate: day, weeks: 4,
  hoursByWeekday: [1, 1, 1, 1, 1, 0, 2], restDay: 5, sheetSlug: 'blind-75', subjects: ['os'], pace: 'standard' };
const event = (key, outcome = 'help', extra = {}) => ({ key, topic: 'arrays-hashing', type: 'dsa',
  kind: 'task', complete: true, day, at: new Date(`${day}T08:00:00Z`), outcome, ...extra });
const recovery = require('../src/modules/plan/planRecovery');

function finishExercise(plan, item) {
  for (const part of plan.items.filter(entry => gen.baseId(entry) === gen.baseId(item))) {
    const marked = adj.markDone(plan.items, part.key, { doneAt: new Date(day + 'T08:00:00Z'), doneDay: day, result: 'alone' });
    assert.ok(!marked.error, marked.error);
    plan.items = marked.items;
  }
}

describe('optional learning evidence and practice', () => {
  it('keeps skipped episodes intact while repeated foundation and rehearsal re-offers get unique keys', () => {
    for (const kind of ['foundation', 'rehearsal']) {
      let plan = gen.generatePlan(input, data);
      plan.startingChecks = [{ id: 'foundation', outcome: 'help' }];
      if (kind === 'rehearsal') {
        const exercises = [...new Map(plan.items.filter(item => item.type === 'dsa').map(item => [gen.baseId(item), item])).values()].slice(0, 2);
        exercises.forEach(item => finishExercise(plan, item));
      }
      for (let round = 0; round < 3; round += 1) {
        const offer = learning.recommendations({ ...plan.input, ...plan }, data).find(entry => entry.kind === kind);
        assert.ok(offer);
        const before = structuredClone(plan);
        const preview = learning.previewLearning(plan, data, day, offer);
        assert.deepEqual(plan, before, 'preview is read-only');
        assert.equal(new Set(preview.plan.items.map(item => item.key)).size, preview.plan.items.length);
        for (const old of plan.items.filter(item => item.skipped || item.doneAt)) {
          assert.deepEqual(preview.plan.items.find(item => item.key === old.key), old);
        }
        for (const task of preview.tasks) assert.deepEqual(preview.plan.items.find(item => item.key === task.key), task);
        const skipped = adj.skipItem(preview.plan.items, preview.tasks[0].key, data);
        plan = { ...preview.plan, items: skipped.items, startingChecks: plan.startingChecks };
      }
    }
  });

  it('applies every saved DSA effort factor to application-check estimates on all sheets and paces', () => {
    for (const sheetSlug of Object.keys(data.sheets)) {
      for (const pace of Object.keys(gen.PACES)) {
        for (const factor of [0.5, 1, 1.15, 2]) {
          const plan = gen.generatePlan({ ...input, sheetSlug, pace, restDay: null,
            hoursByWeekday: Array(7).fill(1), subjects: [], estimateFactors: { dsa: factor } }, data);
          const links = new Set(plan.items.map(item => item.link));
          const source = plan.items.find(item => item.type === 'dsa' && data.sheets[sheetSlug].topics.find(topic => topic.id === item.topicId)?.problems.some(problem => !links.has(problem.link)));
          assert.ok(source);
          finishExercise(plan, source);
          const offer = learning.recommendations({ ...plan.input, ...plan }, data).find(entry => entry.kind === 'transfer');
          assert.ok(offer);
          const problem = data.sheets[sheetSlug].topics.flatMap(topic => topic.problems).find(entry => entry.link === offer.link);
          assert.equal(offer.minutes, Math.round(gen.problemMinutes(problem.difficulty, pace) * factor));
        }
      }
    }
  });

  it('refits learning work after hours cuts without losing minutes, completed parts or preview identity', () => {
    for (const kind of ['repair', 'transfer']) {
      for (const minutes of [40, 70, 120]) {
        const original = gen.generatePlan({ ...input, hoursByWeekday: Array(7).fill(3), restDay: null }, data);
        const added = learning.previewLearning(original, data, day, { id: kind, kind, title: 'Practice', minutes });
        const before = structuredClone(added.plan);
        const change = { type: 'hours', hoursByWeekday: Array(7).fill(0.5), restDay: null };
        const changed = adj.previewChange(added.plan, data, day, change);
        assert.deepEqual(added.plan, before);
        assert.equal(changed.diff.checksum, adj.previewChange(added.plan, data, day, change).diff.checksum);
        const pending = changed.plan.items.filter(item => item.learningKind === kind);
        assert.equal(pending.reduce((total, item) => total + item.plannedMinutes, 0), minutes);
        assert.equal(new Set(changed.plan.items.map(item => item.key)).size, changed.plan.items.length);
        assert.deepEqual(pending.map(item => item.part.n), pending.map((_, index) => index + 1));
        for (const task of pending) {
          const used = changed.plan.items.filter(item => item.day === task.day && !item.skipped).reduce((total, item) => total + item.plannedMinutes, 0);
          assert.ok(used <= gen.dayBudget(0.5).planned);
        }
        pending[0].doneAt = new Date();
        const done = structuredClone(pending[0]);
        const rebuilt = adj.previewChange(changed.plan, data, day, { type: 'rebuild' });
        assert.deepEqual(rebuilt.plan.items.find(item => item.key === done.key), done);
        assert.equal(rebuilt.plan.items.filter(item => item.learningKind === kind).reduce((total, item) => total + item.plannedMinutes, 0), minutes);
      }
    }
  });

  it('refuses an impossible rehearsal or locked-practice change without changing the saved plan', () => {
    const original = gen.generatePlan({ ...input, hoursByWeekday: Array(7).fill(3), restDay: null }, data);
    const added = learning.previewLearning(original, data, day, { id: 'rehearsal', kind: 'rehearsal', title: 'Rehearsal', minutes: 30 });
    const before = structuredClone(added.plan);
    const change = { type: 'hours', hoursByWeekday: Array(7).fill(0.5), restDay: null };
    assert.throws(() => adj.previewChange(added.plan, data, day, change), /uninterrupted slot/);
    assert.deepEqual(added.plan, before);
    const paused = { ...added.plan.input, ...added.plan, hoursByWeekday: Array(7).fill(0.5), pausedAtDay: day,
      pauseCalendar: { timeZone: 'Asia/Kolkata', dayStartHour: 0 } };
    assert.throws(() => recovery.resumePlan(paused, {}, new Date('2026-11-24T08:00:00Z'), true), /uninterrupted rehearsal/);
    added.plan.items.find(item => item.learningKind).locked = true;
    assert.throws(() => adj.previewChange(added.plan, data, day, change), /Locked practice/);
  });

  it('refits learning work inside report plans and lighter days without dropping a remainder', () => {
    const item = { key: 'practice', ref: 'learning:example', source: 'learning', learningKind: 'repair',
      type: 'custom', title: 'Practice', day, plannedDay: day, plannedMinutes: 70 };
    const stored = { input: { ...input, originReport: 'report', restDay: null }, startDate: day,
      deadline: '2026-12-20', items: [item, { key: 'report', type: 'custom', source: 'analyzer:report', title: 'Report task', ref: null, day, plannedMinutes: 20 }], coverage: {} };
    const hours = adj.previewChange(stored, data, day, { type: 'hours', hoursByWeekday: Array(7).fill(0.5), restDay: null });
    assert.equal(hours.plan.items.filter(task => task.learningKind).reduce((sum, task) => sum + task.plannedMinutes, 0), 70);
    assert.deepEqual(hours.plan.coverage.importOverloads, []);
    const lighter = adj.previewChange(stored, data, day, { type: 'lighter', lighterDays: [{ from: day, to: '2026-11-26', hours: 0 }] });
    assert.ok(lighter.plan.items.filter(task => !task.doneAt && !task.skipped).every(task => task.day > '2026-11-26'));
    const tooLate = { ...stored, deadline: day, input: { ...stored.input, hoursByWeekday: Array(7).fill(0.5) } };
    assert.throws(() => adj.previewChange(tooLate, data, day, { type: 'rebuild' }), /Optional practice does not fit/);
    assert.equal(stored.items[0].plannedMinutes, 70);
  });

  it('keeps dated mocks inside the budget when practice is added during a later week', () => {
    const request = { ...input, startDate: '2026-11-02', weeks: 12, hoursByWeekday: Array(7).fill(3), restDay: null };
    const original = gen.generatePlan(request, data);
    const saturday = '2026-11-28';
    assert.ok(original.items.some(item => item.day === saturday && item.type === 'mock'));
    const preview = learning.previewLearning(original, data, saturday, { id: 'long-repair', kind: 'repair', title: 'Repair', minutes: 120 });
    for (const date of new Set(preview.tasks.map(task => task.day))) {
      assert.ok(preview.plan.items.filter(item => item.day === date && !item.skipped).reduce((total, item) => total + item.plannedMinutes, 0) <= gen.dayBudget(3).planned);
    }
    assert.equal(preview.tasks.reduce((sum, task) => sum + task.plannedMinutes, 0), 120);
  });
  it('does not call one difficult attempt a weak topic, and stops offering repair after two independent successes', () => {
    const plan = gen.generatePlan(input, data);
    const item = plan.items.find((entry) => entry.type === 'dsa');
    const topic = item.topicId;
    plan.learningAttempts = [event('one', 'help', { topic })];
    assert.equal(learning.recommendations({ ...plan.input, ...plan }, data).filter((entry) => entry.kind === 'repair').length, 0);
    plan.learningAttempts.push(event('two', 'help', { topic }));
    assert.equal(learning.recommendations({ ...plan.input, ...plan }, data).filter((entry) => entry.kind === 'repair').length, 1);
    plan.learningAttempts.push(event('three', 'independent', { topic }), event('four', 'independent', { topic }));
    assert.equal(learning.recommendations({ ...plan.input, ...plan }, data).filter((entry) => entry.kind === 'repair').length, 0);
  });

  it('deduplicates same-day retries and split parts and bounds stored attempt history', () => {
    const item = { key: 'a', ref: 'dsa:test', link: 'https://example.com/a', type: 'dsa', part: { n: 1, of: 2 }, doneAt: new Date() };
    const pending = { ...item, key: 'b', part: { n: 2, of: 2 }, doneAt: null };
    const plan = { items: [item, pending], learningAttempts: [] };
    plan.learningAttempts = learning.attemptLog(plan, item, { result: 'hints', effort: 'more' }, day, new Date());
    assert.equal(plan.learningAttempts[0].complete, false);
    pending.doneAt = new Date();
    const result = learning.attemptLog(plan, pending, { result: 'alone', effort: 'about' }, day, new Date());
    assert.equal(result.length, 1);
    assert.equal(result[0].complete, true);
    plan.learningAttempts = Array.from({ length: 200 }, (_, index) => event(String(index)));
    assert.equal(learning.attemptLog(plan, item, {}, day, new Date()).length, 200);
  });

  it('requires five distinct complete effort reports, ignores reviews, and bounds calibration', () => {
    const plan = gen.generatePlan(input, data);
    plan.learningAttempts = Array.from({ length: 4 }, (_, index) => event(String(index), 'independent', { effort: 'more', complete: true }));
    assert.ok(!learning.recommendations({ ...plan.input, ...plan }, data).some((offer) => offer.kind === 'estimate'));
    plan.learningAttempts.push(event('5', 'independent', { effort: 'more', complete: true }));
    assert.equal(learning.recommendations({ ...plan.input, ...plan }, data).find((offer) => offer.kind === 'estimate').factor, 1.15);
    plan.estimateFactors = { dsa: 2 };
    assert.ok(!learning.recommendations({ ...plan.input, ...plan }, data).some((offer) => offer.kind === 'estimate'));
    plan.learningAttempts.forEach((entry) => { entry.kind = 'review'; });
    assert.ok(!learning.recommendations({ ...plan.input, ...plan }, data).some((offer) => offer.kind === 'estimate'));
  });

  it('offers a check only outside planned and saved solves, including URL variants', () => {
    const plan = gen.generatePlan(input, data);
    const item = plan.items.find((entry) => entry.type === 'dsa');
    item.doneAt = new Date();
    item.result = 'alone';
    const offer = learning.recommendations({ ...plan.input, ...plan }, data).find((entry) => entry.kind === 'transfer');
    assert.ok(offer, 'the fixture must exercise a real unfamiliar candidate');
    if (offer) {
      assert.ok(!plan.items.some((entry) => entry.link === offer.link));
      const allSolved = data.sheets[input.sheetSlug].topics.flatMap((topic) => topic.problems.map((problem) => problem.link.replace(/\/$/, '')));
      assert.ok(!learning.recommendations({ ...plan.input, ...plan }, data, allSolved).some((entry) => entry.kind === 'transfer'));
    }
  });

  it('splits a full repair into honest study-day budgets and preserves completed and locked work', () => {
    const plan = gen.generatePlan(input, data);
    plan.items[0].doneAt = new Date();
    plan.items[1].locked = true;
    const before = structuredClone(plan);
    const result = learning.previewLearning(plan, data, day, { id: 'repair:test', kind: 'repair', title: 'Repair', minutes: 120, objective: 'Practise independently.' });
    assert.deepEqual(plan, before, 'preview must not mutate the stored plan');
    for (const item of before.items.filter((entry) => entry.doneAt || entry.locked)) {
      assert.deepEqual(result.plan.items.find((entry) => entry.key === item.key), item);
    }
    assert.equal(result.tasks.reduce((total, item) => total + item.plannedMinutes, 0), 120);
    assert.ok(result.tasks.length > 1);
    assert.equal(new Set(result.plan.items.map((item) => item.key)).size, result.plan.items.length);
    for (const date of new Set(result.plan.items.map((item) => item.day))) {
      const items = result.plan.items.filter((item) => item.day === date && !item.skipped);
      assert.ok(items.reduce((total, item) => total + item.plannedMinutes, 0) <= gen.dayBudget(adj.hoursOn(input, date)).planned);
      assert.notEqual(gen.weekdayOf(gen.dayNumber(date)), 5);
    }
    assert.equal(result.checksum.length, 32);
  });

  it('refuses impossible practice instead of overloading or extending the deadline silently', () => {
    const plan = gen.generatePlan(input, data);
    assert.throws(() => learning.previewLearning(plan, data, plan.deadline, { id: 'huge', kind: 'repair', title: 'Repair', minutes: 10000 }), /does not fit/);
  });

  it('uses different budgets for recall, quiz and full repair, including half-hour study days', () => {
    const items = ['dsa', 'notes'].map((type) => ({ type, key: type, title: type, nextReviewDay: day, ref: type }));
    const reviews = adj.dueReviews(items, day);
    assert.equal(reviews.find((item) => item.ref === 'dsa').plannedMinutes, 3);
    assert.equal(reviews.find((item) => item.ref === 'notes').plannedMinutes, 5);
    assert.equal(adj.reviewRoom(0), 0);
    assert.ok(adj.reviewsForDay([items[1]], day, adj.reviewRoom(0.5)).shown.length === 1);
  });

  it('calibrates only unstarted work; split remaining minutes and all existing identities survive', () => {
    const base = gen.generatePlan({ ...input, goalType: 'role', roadmapSlug: 'frontend', weeks: 12 }, data);
    const group = base.items.filter((item) => item.part && item.type === 'roadmap');
    const first = group[0];
    assert.ok(first);
    first.doneAt = new Date();
    const parts = base.items.filter((item) => gen.baseId(item) === gen.baseId(first));
    const remaining = parts.filter((item) => !item.doneAt).reduce((sum, item) => sum + item.plannedMinutes, 0);
    const result = learning.previewLearning(base, data, day, { id: 'estimate:roadmap', kind: 'estimate', type: 'roadmap', factor: 1.15 });
    assert.deepEqual(result.plan.items.find((item) => item.key === first.key), first);
    const after = result.plan.items.filter((item) => gen.baseId(item) === gen.baseId(first) && !item.doneAt).reduce((sum, item) => sum + item.plannedMinutes, 0);
    assert.equal(after, remaining);
    assert.equal(result.plan.input.estimateFactors.roadmap, 1.15);
  });

  it('checks 378 learning changes across every sheet and roadmap, short days and uneven calendars', () => {
    const curricula = [
      ...Object.keys(data.sheets).map((sheetSlug) => ({ goalType: 'placements', sheetSlug })),
      ...data.roadmapCatalog.map((roadmap) => ({ goalType: 'role', roadmapSlug: roadmap.slug })),
    ];
    let cases = 0;
    for (const curriculum of curricula) {
      for (const hours of [0.5, 1, 3]) {
        for (const weeks of [4, 12, 26]) {
          const request = { ...input, ...curriculum, weeks, hoursByWeekday: [hours, 0, hours, hours, hours, 0, hours * 2] };
          const original = gen.generatePlan(request, data);
          const first = original.items.find((item) => item.type === 'dsa' || item.type === 'roadmap');
          if (first) first.doneAt = new Date();
          for (const kind of ['repair', 'transfer', 'rehearsal']) {
            const result = learning.previewLearning(original, data, day, {
              id: `${kind}:test`, kind, title: 'Practice', objective: 'Explain, implement and test.', minutes: 30,
            });
            cases += 1;
            assert.equal(result.tasks.reduce((sum, item) => sum + item.plannedMinutes, 0), 30);
            assert.equal(new Set(result.plan.items.map((item) => item.key)).size, result.plan.items.length);
            if (first) assert.deepEqual(result.plan.items.find((item) => item.key === first.key), first);
            for (const task of result.tasks) {
              assert.ok(task.day >= day && task.day <= original.deadline);
              assert.ok(adj.hoursOn(request, task.day) > 0);
              const used = result.plan.items.filter((item) => item.day === task.day && !item.skipped).reduce((sum, item) => sum + item.plannedMinutes, 0);
              assert.ok(used <= gen.dayBudget(adj.hoursOn(request, task.day)).planned, `${curriculum.roadmapSlug || curriculum.sheetSlug}: ${used} min on ${task.day}`);
            }
          }
        }
      }
    }
    assert.equal(cases, 378);
  });

  it('keeps repair identities separate from the original and does not split an interview across days', () => {
    const original = gen.generatePlan(input, data);
    const item = original.items.find((entry) => entry.type === 'dsa');
    const repair = learning.previewLearning(original, data, day, {
      id: 'repair:example', kind: 'repair', title: 'Try again', minutes: 60, ref: item.ref, link: item.link,
    });
    assert.ok(repair.tasks.every((task) => gen.baseId(task) !== gen.baseId(item)));
    assert.equal(repair.tasks[0].materialRef, item.ref);
    const short = gen.generatePlan({ ...input, hoursByWeekday: Array(7).fill(0.5) }, data);
    assert.throws(() => learning.previewLearning(short, data, day,
      { id: 'rehearsal', kind: 'rehearsal', title: 'Interview', minutes: 30 }), /does not fit/);
  });

  it('offers role application and rehearsal only after completed practical work, not introductory split parts', () => {
    const original = gen.generatePlan({ ...input, goalType: 'role', roadmapSlug: 'frontend', weeks: 12 }, data);
    const plan = { ...original, ...original.input };
    plan.items.filter((item) => item.activity === 'learn').forEach((item) => { item.doneAt = new Date(); });
    assert.ok(!learning.recommendations({ ...plan.input, ...plan }, data).some((offer) => ['transfer', 'rehearsal'].includes(offer.kind)));
    const checkpoint = plan.items.find((item) => item.activity === 'checkpoint');
    assert.ok(checkpoint);
    plan.items.filter((item) => gen.baseId(item) === gen.baseId(checkpoint)).forEach((item) => { item.doneAt = new Date(); });
    const offers = learning.recommendations({ ...plan.input, ...plan }, data);
    assert.ok(offers.some((offer) => offer.kind === 'transfer'));
    assert.ok(offers.some((offer) => offer.kind === 'rehearsal'));
  });

  it('keeps roadmap topics separate and offers requested starting-check help for role switchers', () => {
    const original = gen.generatePlan({ ...input, goalType: 'role', roadmapSlug: 'frontend', weeks: 12 }, data);
    const plan = { ...original, ...original.input, learningAttempts: [] };
    const first = plan.items.find((item) => item.milestoneId === 'topic-1-practice');
    const second = plan.items.find((item) => item.stepId === first.stepId && item.milestoneId === 'topic-2-practice');
    assert.ok(first && second);
    for (const item of [first, second]) {
      plan.items.filter((part) => gen.baseId(part) === gen.baseId(item)).forEach((part) => { part.doneAt = new Date(); });
      plan.learningAttempts = learning.attemptLog(plan, item, { result: 'hints' }, day, new Date());
    }
    assert.ok(!learning.recommendations(plan, data).some((offer) => offer.kind === 'repair'));
    const nextDay = gen.ymdOf(gen.dayNumber(day) + 1);
    plan.learningAttempts = learning.attemptLog(plan, first, { result: 'hints' }, nextDay, new Date());
    const repair = learning.recommendations(plan, data).find((offer) => offer.kind === 'repair');
    assert.equal(repair.topicId, first.stepId + ':topic-1');
    assert.ok(!repair.title.includes(second.title.replace('Practise: ', '')));
    plan.learningAttempts = [];
    plan.startingChecks = [{ id: 'role', outcome: 'help' }];
    assert.ok(learning.recommendations(plan, data).some((offer) => offer.id === 'role-starting-check'));
    plan.startingChecks[0].outcome = 'skipped';
    assert.ok(!learning.recommendations(plan, data).some((offer) => offer.id === 'role-starting-check'));
  });
});
