// What happens to a plan after it exists (src/services/planAdjust.js): the review ladder, skip and move, carried over, the Today list,
// and changes with a preview (rebuild, new hours, lighter days). Pure functions on plain items, so small made-up data is enough.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const gen = require('../src/services/planGenerator');
const adj = require('../src/services/planAdjust');

const { generatePlan, dayNumber, ymdOf } = gen;
const sum = (items) => items.reduce((s, it) => s + it.plannedMinutes, 0);
const problems = (prefix, difficulties) => difficulties.map((d, i) => ({ title: `${prefix} ${i + 1}`, link: `https://x.test/${prefix}-${i + 1}`, difficulty: d }));
const data = {
  sheets: { 'blind-75': { topics: [
    { id: 'early', title: 'Early topic', problems: problems('e', Array(40).fill('Medium')) },
    { id: 'late', title: 'Late topic', problems: problems('l', Array(30).fill('Easy')) },
    { id: 'last', title: 'Last topic', problems: problems('z', Array(10).fill('Hard')) },
  ] } },
  planCatalog: { steps: ['s1', 's2', 's3'], sheets: { 'blind-75': { early: { step: 's1', order: 1, core: true }, late: { step: 's2', order: 2, core: true }, last: { step: 's3', order: 3, core: false } } } },
  notes: { os: [{ id: 'os-a', title: 'OS A', readMinutes: 10 }, { id: 'os-b', title: 'OS B', readMinutes: 12 }] },
  roadmapCatalog: [], behavioral: [{ id: 1, question: 'Q1' }, { id: 2, question: 'Q2' }, { id: 3, question: 'Q3' }],
};
const base = { goalType: 'placements', style: 'one-topic', startDate: '2026-11-16', weeks: 12, hoursByWeekday: [3, 3, 3, 3, 3, 5, 0], restDay: 6, sheetSlug: 'blind-75', subjects: ['os'] };
const makeStored = (over = {}, d = data) => { const p = generatePlan({ ...base, ...over }, d); return { input: p.input, startDate: p.startDate, deadline: p.deadline, items: p.items }; };
const tick = (items, key, day, extra = {}) => { const r = adj.markDone(items, key, { doneAt: `${day}T08:00:00Z`, doneDay: day, result: 'alone', ...extra }); assert.ok(!r.error, r.error); return r.items; };
const dsaItems = (items) => items.filter((i) => i.type === 'dsa');

describe('the review ladder (decisions 20 to 22)', () => {
  const stored = makeStored();
  const first = dsaItems(stored.items)[0];
  it('starts a ladder when an item is ticked: alone 7 days, hints 3, solution 1, a notes section 3', () => {
    const at = (result) => adj.markDone(stored.items, first.key, { doneAt: 'x', doneDay: '2026-11-16', result }).items.find((i) => i.key === first.key);
    assert.equal(at('alone').nextReviewDay, '2026-11-23');
    assert.equal(at('hints').nextReviewDay, '2026-11-19');
    assert.equal(at('solution').nextReviewDay, '2026-11-17');
    const note = stored.items.find((i) => i.type === 'notes');
    const done = adj.markDone(stored.items, note.key, { doneAt: 'x', doneDay: '2026-11-16', quizScore: 3 }).items.find((i) => i.key === note.key);
    assert.deepEqual([done.nextReviewDay, done.reviewLadder, done.quizScore, done.result], ['2026-11-19', 'notes', 3, null]);
  });
  it('needs one of the three results for a problem, a quiz score from 0 to 5 for notes, and refuses a second tick or a skipped item', () => {
    assert.equal(adj.markDone(stored.items, first.key, { doneAt: 'x', doneDay: '2026-11-16' }).error, 'result-required');
    assert.equal(adj.markDone(stored.items, first.key, { doneAt: 'x', doneDay: '2026-11-16', result: 'maybe' }).error, 'result-required');
    const note = stored.items.find((i) => i.type === 'notes');
    assert.equal(adj.markDone(stored.items, note.key, { doneAt: 'x', doneDay: '2026-11-16', quizScore: 6 }).error, 'bad-quiz-score');
    const items = tick(stored.items, first.key, '2026-11-16');
    assert.equal(adj.markDone(items, first.key, { doneAt: 'y', doneDay: '2026-11-17', result: 'alone' }).error, 'already-done');
    assert.equal(adj.markDone(adj.skipItem(stored.items, dsaItems(stored.items)[1].key, data).items, dsaItems(stored.items)[1].key, { doneAt: 'x', doneDay: '2026-11-16', result: 'alone' }).error, 'skipped');
    assert.equal(adj.markDone(stored.items, 'nope', { doneAt: 'x', doneDay: '2026-11-16', result: 'alone' }).error, 'not-found');
  });
  it('a split item starts its ladder only when its last part is ticked', () => {
    const s = makeStored({ hoursByWeekday: [1, 1, 1, 1, 1, 0, 0], restDay: null }); // 42 new minutes a day: a Medium (70) is split
    const parts = s.items.filter((i) => i.part && i.ref === 'dsa:blind-75:early');
    assert.ok(parts.length >= 2);
    const firstPart = adj.markDone(s.items, parts[0].key, { doneAt: 'x', doneDay: '2026-11-16', result: 'alone' });
    assert.equal(firstPart.started, false);
    assert.equal(firstPart.items.some((i) => i.nextReviewDay), false);
    const last = parts.filter((p) => p.link === parts[0].link);
    let items = s.items;
    last.forEach((p, k) => { const r = adj.markDone(items, p.key, { doneAt: 'x', doneDay: '2026-11-17', result: 'alone' }); items = r.items; assert.equal(r.started, k === last.length - 1); });
  });
  it('a passed review moves to the next gap, counted from the first solve, and the item is retired after the last gap', () => {
    let items = tick(stored.items, first.key, '2026-11-16', { result: 'hints' }); // days 3, 14, 45
    let r = adj.recordReview(items, first.key, true, '2026-11-19');
    assert.equal(r.items.find((i) => i.key === first.key).nextReviewDay, '2026-11-30');
    r = adj.recordReview(r.items, first.key, true, '2026-11-30');
    assert.equal(r.items.find((i) => i.key === first.key).nextReviewDay, '2026-12-31');
    r = adj.recordReview(r.items, first.key, true, '2026-12-31');
    assert.equal(r.retired, true);
    assert.equal(r.items.find((i) => i.key === first.key).nextReviewDay, null);
    assert.equal(adj.recordReview(r.items, first.key, true, '2027-01-02').error, 'no-review-due');
  });
  it('a failed review goes back to the first gap, counted from the day of the failure, and a problem offers a full re-code', () => {
    let items = tick(stored.items, first.key, '2026-11-16', { result: 'alone' });
    items = adj.recordReview(items, first.key, true, '2026-11-23').items; // now waiting for day 30
    const r = adj.recordReview(items, first.key, false, '2026-12-16');
    const it = r.items.find((i) => i.key === first.key);
    assert.deepEqual([it.reviewStage, it.nextReviewDay, it.lastFailedDay], [0, '2026-12-23', '2026-12-16']);
    assert.equal(r.offerRecode, true);
    const again = adj.recordReview(r.items, first.key, true, '2026-12-23').items.find((i) => i.key === first.key);
    assert.equal(again.nextReviewDay, '2027-01-15'); // 30 days after the failure day
  });
  it('lists what is due with failed first, then starred, then the oldest', () => {
    const [a, b, c, d] = dsaItems(stored.items);
    let items = stored.items;
    items = tick(items, a.key, '2026-11-10');       // due 11-17
    items = tick(items, b.key, '2026-11-11');       // due 11-18
    items = tick(items, c.key, '2026-11-12');       // due 11-19
    items = tick(items, d.key, '2026-11-13');       // due 11-20
    items = items.map((i) => (i.key === c.key ? { ...i, starred: true } : i));
    items = adj.recordReview(items, d.key, false, '2026-11-14').items; // failed: due 11-21
    const due = adj.dueReviews(items, '2026-11-25');
    assert.deepEqual(due.map((r) => r.originalKey), [d.key, c.key, a.key, b.key]);
    assert.deepEqual([due[0].failed, due[1].starred, due[2].failed], [true, true, false]);
    assert.equal(due[0].plannedMinutes, 3);
    assert.deepEqual(adj.dueReviews(items, '2026-11-16'), []);
  });
  it('shows only as many reviews as the day\'s room holds (15 percent of the hours); the rest wait and are never deleted', () => {
    assert.equal(adj.reviewRoom(3), 27);
    let items = stored.items;
    dsaItems(stored.items).slice(0, 12).forEach((i) => { items = tick(items, i.key, '2026-11-01'); });
    const day = adj.reviewsForDay(items, '2026-11-10', 27);
    assert.equal(day.shown.length, 9);
    assert.equal(day.waiting.length, 3);
    assert.equal(day.minutes, 27);
    assert.equal(adj.reviewsForDay(items, '2026-11-10', 5).shown.length, 1);
    assert.equal(adj.reviewsForDay(items, '2026-11-10', 0).shown.length, 0);
    assert.equal(items.filter((i) => i.nextReviewDay).length, 12);
  });
  it('knows when the overdue reviews are more than one day\'s room', () => {
    let items = stored.items;
    dsaItems(stored.items).slice(0, 10).forEach((i) => { items = tick(items, i.key, '2026-11-01'); });
    assert.deepEqual(adj.reviewBacklog(items, '2026-11-10', 27), { count: 10, minutes: 30, blocked: true });
    assert.equal(adj.reviewBacklog(items, '2026-11-10', 30).blocked, false);
  });
  it('the starred items are the revision list', () => {
    const items = stored.items.map((i, k) => (k < 2 ? { ...i, starred: true } : i));
    assert.equal(adj.revisionList(items).length, 2);
    assert.equal(adj.revisionList(adj.skipItem(items, items[0].key, data).items).length, 1);
  });
});

describe('skip and move (decisions 23 and 26)', () => {
  const stored = makeStored();
  it('skip puts the item on the skipped list and warns about the later topics that build on it', () => {
    const early = dsaItems(stored.items).find((i) => i.topicId === 'early');
    const r = adj.skipItem(stored.items, early.key, data);
    assert.equal(r.items.find((i) => i.key === early.key).skipped, true);
    assert.deepEqual(r.warning, { laterTopics: ['Late topic', 'Last topic'], count: 2 });
    const lastTopic = dsaItems(stored.items).find((i) => i.topicId === 'last');
    assert.equal(adj.skipItem(stored.items, lastTopic.key, data).warning, null, 'nothing builds on the last topic');
    const note = stored.items.find((i) => i.type === 'notes');
    assert.equal(adj.skipItem(stored.items, note.key, data).warning, null);
  });
  it('skip refuses a done item, skips every part of a split item, and unskip brings it back', () => {
    const early = dsaItems(stored.items)[0];
    const items = tick(stored.items, early.key, early.day);
    assert.equal(adj.skipItem(items, early.key, data).error, 'already-done');
    const s = makeStored({ hoursByWeekday: [1, 1, 1, 1, 1, 0, 0], restDay: null });
    const part = s.items.find((i) => i.part);
    const skipped = adj.skipItem(s.items, part.key, data).items;
    assert.ok(skipped.filter((i) => i.link === part.link).every((i) => i.skipped));
    assert.ok(adj.unskipItem(skipped, part.key).items.filter((i) => i.link === part.link).every((i) => !i.skipped));
  });
  it('move changes the day by at most 3 days from where the planner put it, and locks the item', () => {
    const item = dsaItems(stored.items).find((i) => i.day === '2026-11-17');
    const r = adj.moveItem(stored, item.key, '2026-11-19');
    const moved = r.items.find((i) => i.key === item.key);
    assert.deepEqual([moved.day, moved.locked, moved.plannedDay], ['2026-11-19', true, '2026-11-17']);
    assert.equal(adj.moveItem({ ...stored, items: r.items }, item.key, '2026-11-20').ok, undefined);
    assert.equal(adj.moveItem({ ...stored, items: r.items }, item.key, '2026-11-21').error, 'too-far', 'measured from the planned day, so moving twice cannot go further');
    assert.equal(adj.moveItem(stored, item.key, '2026-11-21').error, 'too-far');
  });
  it('move refuses a day outside the plan, a day with no hours, a mock day, a done item, a skipped item and a dated item', () => {
    const item = dsaItems(stored.items).find((i) => i.day === '2026-11-17');
    assert.equal(adj.moveItem(stored, item.key, '2026-11-14').error, 'outside-plan');
    const sunday = ymdOf(dayNumber('2026-11-22')); // the rest day
    const near = dsaItems(stored.items).find((i) => i.day === '2026-11-20');
    assert.equal(adj.moveItem(stored, near.key, sunday).error, 'no-hours');
    const mock = stored.items.find((i) => i.type === 'mock');
    assert.ok(mock, 'the plan has mock blocks');
    const nearMock = dsaItems(stored.items).find((i) => Math.abs(dayNumber(i.day) - dayNumber(mock.day)) === 1);
    assert.equal(adj.moveItem(stored, nearMock.key, mock.day).error, 'mock-day');
    assert.equal(adj.moveItem(stored, mock.key, '2026-12-04').error, 'dated-item');
    assert.equal(adj.moveItem({ ...stored, items: tick(stored.items, item.key, item.day) }, item.key, '2026-11-18').error, 'already-done');
    assert.equal(adj.moveItem({ ...stored, items: adj.skipItem(stored.items, item.key, data).items }, item.key, '2026-11-18').error, 'skipped');
    assert.equal(adj.moveItem(stored, 'nope', '2026-11-18').error, 'not-found');
  });
});

describe('carried over and the calm Today list (decisions 24, 27, 33)', () => {
  const stored = makeStored();
  it('carried over lists planned items from earlier days that are not done or skipped, oldest first, without mock blocks', () => {
    const early = stored.items.filter((i) => i.day < '2026-11-20' && i.type === 'dsa');
    let items = tick(stored.items, early[0].key, early[0].day);
    items = adj.skipItem(items, early[1].key, data).items;
    const carried = adj.carriedOver(items, '2026-11-20');
    assert.ok(carried.length > 0 && carried.every((i) => i.day < '2026-11-20' && !i.doneAt && !i.skipped));
    assert.deepEqual(carried.map((i) => i.day), [...carried.map((i) => i.day)].sort());
    assert.ok(!carried.some((i) => i.key === early[0].key || i.key === early[1].key));
  });
  it('Today shows carried over items first, then today\'s, then the reviews that fit, with the time needed and the smallest item to start with', () => {
    let items = stored.items;
    const old = dsaItems(items).filter((i) => i.day < '2026-11-18');
    tick(items, old[0].key, old[0].day); // (ticked on a copy only to check the call works)
    items = tick(items, old[0].key, old[0].day);
    const todayKey = '2026-11-18';
    const v = adj.todayView({ ...stored, items }, todayKey);
    assert.equal(v.date, todayKey);
    assert.equal(v.isToday, true);
    const kinds = v.items.map((i) => (i.type === 'review' ? 'review' : i.day < todayKey ? 'carried' : 'today'));
    assert.deepEqual(kinds, [...kinds].sort((a, b) => ['carried', 'today', 'review'].indexOf(a) - ['carried', 'today', 'review'].indexOf(b)));
    assert.equal(v.minutes, sum(v.items));
    assert.equal(v.startItem.plannedMinutes, Math.min(...v.items.map((i) => i.plannedMinutes)));
    assert.deepEqual(Object.keys(v).sort(), ['date', 'isToday', 'items', 'minutes', 'onTrack', 'startItem']);
  });
  it('Today includes the due reviews, and when nothing is planned for today it shows the next day that has items, labelled with its date', () => {
    const first = dsaItems(stored.items)[0];
    const items = tick(stored.items, first.key, '2026-11-05'); // due 2026-11-12
    const v = adj.todayView({ ...stored, items }, '2026-11-16');
    assert.ok(v.items.some((i) => i.type === 'review' && i.originalKey === first.key));
    const sundayView = adj.todayView(stored, '2026-11-22'); // the rest day
    assert.equal(sundayView.date, '2026-11-23');
    assert.equal(sundayView.isToday, false);
    assert.ok(sundayView.items.length > 0 && sundayView.items.every((i) => i.day === '2026-11-23'));
  });
});

describe('changes with a preview (decisions 16, 25, 42)', () => {
  const stored = makeStored();
  // the student did the first 6 problems on time and then missed a week; today is Monday 2026-11-30
  const early = dsaItems(stored.items).slice(0, 6);
  let worked = stored.items;
  for (const i of early) worked = tick(worked, i.key, i.day, { result: 'hints' });
  const today = '2026-11-30';
  const store2 = { ...stored, items: worked };
  const rebuilt = adj.previewChange(store2, data, today, { type: 'rebuild' });

  it('a rebuild plans only from today, leaves done items exactly as they are, and keeps every day within 85 percent', () => {
    const { plan } = rebuilt;
    assert.deepEqual(plan.items.filter((i) => i.doneAt).map((i) => [i.key, i.day, i.doneAt, i.nextReviewDay]), worked.filter((i) => i.doneAt).map((i) => [i.key, i.day, i.doneAt, i.nextReviewDay]));
    const planned = plan.items.filter((i) => !i.doneAt);
    assert.ok(planned.every((i) => i.day >= today), 'nothing planned before today');
    const byDay = {};
    for (const i of plan.items) if (i.day >= today) byDay[i.day] = (byDay[i.day] || 0) + i.plannedMinutes;
    const caps = Object.fromEntries(gen.generatePlan({ ...stored.input, startDate: today, weeks: 10 }, data).days.map((d) => [d.date, d.plannedCap]));
    for (const [d, m] of Object.entries(byDay)) assert.ok(m <= caps[d], d);
    assert.equal(plan.deadline, stored.deadline);
    assert.equal(plan.startDate, stored.startDate);
  });
  it('every minute is done, planned or left out, and the diff says what changes', () => {
    const { plan, diff } = rebuilt;
    const doneMinutes = sum(worked.filter((i) => i.doneAt && i.type === 'dsa'));
    const syllabus = sum(dsaItems(stored.items)) + sum(stored.items.filter((i) => i.type === 'notes'));
    const c = plan.coverage;
    assert.equal(doneMinutes + c.plannedMinutes + sum(c.leftOut), syllabus);
    assert.equal(diff.doneProtected, 6);
    assert.equal(diff.lockedKept, 0);
    assert.equal(typeof diff.movedItems, 'number');
    assert.ok(diff.movedItems > 0);
    assert.match(diff.finishText, /^(stays the same|\d+ days? (earlier|later))$/);
    assert.equal(diff.checksum.length, 16);
  });
  it('the checksum is the same for the same change and different for another one, and the preview does not touch what it was given', () => {
    const copy = JSON.stringify(store2);
    const again = adj.previewChange(store2, data, today, { type: 'rebuild' });
    assert.deepEqual(again, rebuilt);
    assert.equal(JSON.stringify(store2), copy);
    const other = adj.previewChange(store2, data, today, { type: 'hours', hoursByWeekday: [2, 2, 2, 2, 2, 4, 0] });
    assert.notEqual(other.diff.checksum, rebuilt.diff.checksum);
    assert.equal(adj.itemsChecksum(rebuilt.plan.items), rebuilt.diff.checksum);
  });
  it('a rebuild keeps locked items where the student put them (and their room), skipped items on the skipped list, and items the student added', () => {
    const open = dsaItems(stored.items).filter((i) => i.day === '2026-12-02');
    const moved = adj.moveItem({ ...store2 }, open[0].key, '2026-12-03');
    const skipped = adj.skipItem(moved.items, open[1].key, data).items;
    const custom = { key: 'custom|1', type: 'custom', ref: null, title: 'Write the resume', plannedMinutes: 60, day: '2026-12-04', source: 'student', part: null };
    const r = adj.previewChange({ ...store2, items: [...skipped, custom] }, data, today, { type: 'rebuild' });
    const lockedNow = r.plan.items.find((i) => i.key === open[0].key);
    assert.deepEqual([lockedNow.day, lockedNow.locked], ['2026-12-03', true]);
    assert.ok(r.plan.items.find((i) => i.key === open[1].key).skipped);
    assert.ok(!r.plan.items.some((i) => i.key !== open[1].key && i.skipped && i.link === open[1].link && !i.skipped));
    assert.ok(r.plan.items.some((i) => i.key === 'custom|1' && i.day === '2026-12-04'));
    assert.equal(r.plan.items.filter((i) => i.link === open[0].link).length, 1, 'the locked item is not planned a second time');
    assert.equal(r.plan.items.filter((i) => i.link === open[1].link && !i.skipped).length, 0, 'a skipped item is not planned again');
    const room = {};
    for (const i of r.plan.items) if (i.day === '2026-12-03' || i.day === '2026-12-04') room[i.day] = (room[i.day] || 0) + i.plannedMinutes;
    assert.ok(room['2026-12-03'] <= 153 && room['2026-12-04'] <= 153, 'locked and added items use up the day\'s room');
    assert.equal(r.diff.lockedKept, 1);
  });
  it('review items are not moved by a rebuild: their ladder fields stay as they were', () => {
    const doneBefore = worked.filter((i) => i.nextReviewDay).map((i) => [i.key, i.reviewStage, i.nextReviewDay, i.reviewBaseDay]);
    const after = rebuilt.plan.items.filter((i) => i.nextReviewDay).map((i) => [i.key, i.reviewStage, i.nextReviewDay, i.reviewBaseDay]);
    assert.deepEqual(after, doneBefore);
  });
  it('while the overdue reviews are more than one day\'s room, no new item is added', () => {
    let items = stored.items;
    const solved = dsaItems(stored.items).slice(0, 30);
    solved.forEach((i) => { items = tick(items, i.key, '2026-11-20'); }); // 30 reviews = 90 minutes due from 2026-11-27, today is 2026-12-01
    const r = adj.previewChange({ ...stored, items }, data, '2026-12-01', { type: 'rebuild' });
    assert.equal(r.diff.reviewBacklogMinutes, 90);
    const firstDay = (list) => list.filter((i) => !i.doneAt && i.type !== 'mock' && i.type !== 'behavioral').map((i) => i.day).sort()[0];
    // room 27 a day: 90 > 27, 63 > 27, 36 > 27 are blocked (Tue 1, Wed 2, Thu 3 Dec), then 9 is not: the first new item is on Fri 4 Dec
    assert.equal(firstDay(r.plan.items), '2026-12-04');
    const free = adj.previewChange({ ...stored, items: stored.items }, data, '2026-12-01', { type: 'rebuild' });
    assert.equal(firstDay(free.plan.items), '2026-12-01');
  });
  it('a part-done split item is planned again only for what is left', () => {
    const s = makeStored({ hoursByWeekday: [1, 1, 1, 1, 1, 0, 0], restDay: null });
    const parts = s.items.filter((i) => i.part && i.link === s.items.find((x) => x.part).link);
    const items = adj.markDone(s.items, parts[0].key, { doneAt: 'x', doneDay: parts[0].day, result: 'alone' }).items;
    const r = adj.previewChange({ ...s, items }, data, '2026-11-30', { type: 'rebuild' });
    const same = r.plan.items.filter((i) => i.link === parts[0].link);
    assert.equal(sum(same), sum(parts), 'the done part plus the rest add up to the whole item');
    assert.equal(same.filter((i) => i.doneAt).length, 1);
  });
  it('mock blocks keep counting weeks from the start of the plan, and behavioral questions already done are not planned again', () => {
    const bigData = { ...data, sheets: { 'neetcode-150': { topics: [{ id: 'early', title: 'E', problems: problems('e', Array(400).fill('Medium')) }] } }, planCatalog: { steps: ['s1'], sheets: { 'neetcode-150': { early: { step: 's1', order: 1, core: true } } } } };
    const big = makeStored({ goalType: 'bigtech', sheetSlug: 'neetcode-150', weeks: 12 }, bigData);
    const beh = big.items.filter((i) => i.type === 'behavioral');
    assert.ok(beh.length > 0);
    const items = big.items.map((i) => (i.key === beh[0].key ? { ...i, doneAt: 'x' } : i));
    const r = adj.previewChange({ ...big, items }, bigData, '2026-12-14', { type: 'rebuild' });
    const mocks = r.plan.items.filter((i) => i.type === 'mock' && !i.doneAt).map((m) => m.ref);
    assert.ok(mocks.length > 0 && mocks.every((m) => Number(m.split(':')[1]) >= 5), `mock weeks ${mocks}`);
    const again = r.plan.items.filter((i) => i.type === 'behavioral' && !i.doneAt);
    assert.ok(!again.some((b) => b.ref === beh[0].ref), 'the done question is not planned again');
  });
  it('a rebuild past the deadline says the plan is finished, and a start before the plan starts is treated as its first day', () => {
    assert.deepEqual(adj.previewChange(store2, data, '2027-03-01', { type: 'rebuild' }), { error: 'finished' });
    const early = adj.previewChange(stored, data, '2026-01-01', { type: 'rebuild' });
    assert.equal(early.plan.items.filter((i) => !i.doneAt)[0].day, '2026-11-16');
  });
});

describe('new hours and lighter days (decision 25)', () => {
  const stored = makeStored();
  const today = '2026-11-23';
  it('new hours move the finish date and are saved in the plan\'s input', () => {
    const r = adj.previewChange(stored, data, today, { type: 'hours', hoursByWeekday: [1, 1, 1, 1, 1, 2, 0] });
    assert.deepEqual(r.plan.input.hoursByWeekday, [1, 1, 1, 1, 1, 2, 0]);
    assert.ok(r.diff.movedItems > 0);
    assert.ok(r.plan.coverage.plannedMinutes < generatePlan(base, data).coverage.plannedMinutes);
    assert.throws(() => adj.previewChange(stored, data, today, { type: 'hours', hoursByWeekday: [1, 1] }), gen.PlanInputError);
    assert.throws(() => adj.previewChange(stored, data, today, { type: 'nope' }), gen.PlanInputError);
  });
  it('a lighter stretch of 1 to 14 days at fewer hours changes only those days, and 0 hours makes a day off', () => {
    const light = [{ from: '2026-11-24', to: '2026-11-26', hours: 1 }, { from: '2026-11-27', to: '2026-11-27', hours: 0 }];
    const r = adj.previewChange(stored, data, today, { type: 'lighter', lighterDays: light });
    const minutes = (d) => sum(r.plan.items.filter((i) => i.day === d && i.type !== 'mock' && i.type !== 'behavioral'));
    assert.ok(minutes('2026-11-24') <= 42 && minutes('2026-11-26') <= 42);
    assert.equal(minutes('2026-11-27'), 0);
    assert.ok(minutes('2026-11-30') > 42, 'the days after the stretch are back to normal');
    assert.deepEqual(r.plan.input.lighterDays, light);
    assert.ok(r.diff.finishChangeDays >= 0);
  });
  it('refuses a stretch that is too long, overlaps another, has bad hours or lies outside the plan', () => {
    const bad = (list, re) => assert.throws(() => adj.previewChange(stored, data, today, { type: 'lighter', lighterDays: list }), (e) => e instanceof gen.PlanInputError && re.test(e.message));
    bad([{ from: '2026-11-24', to: '2026-12-09', hours: 1 }], /at most 14 days/);
    bad([{ from: '2026-11-24', to: '2026-11-26', hours: 1 }, { from: '2026-11-26', to: '2026-11-28', hours: 1 }], /overlap/);
    bad([{ from: '2026-11-24', to: '2026-11-26', hours: 0.2 }], /hours/);
    bad([{ from: '2026-11-26', to: '2026-11-24', hours: 1 }], /real dates/);
    bad([{ from: '2026-11-01', to: '2026-11-03', hours: 1 }], /inside the plan/);
    bad([{ from: '2027-02-01', to: '2027-02-20', hours: 1 }], /at most 14|inside the plan/);
  });
  it('lighter days also work when a plan is made, and the rest day stays a rest day', () => {
    const p = generatePlan({ ...base, lighterDays: [{ from: '2026-11-21', to: '2026-11-23', hours: 1 }] }, data);
    const day = (d) => p.days.find((x) => x.date === d);
    assert.deepEqual([day('2026-11-21').hours, day('2026-11-22').hours, day('2026-11-23').hours, day('2026-11-24').hours], [1, 0, 1, 3]);
    assert.throws(() => generatePlan({ ...base, lighterDays: [{ from: '2026-11-21', to: '2026-11-22', hours: 99 }] }, data), gen.PlanInputError);
  });
});
