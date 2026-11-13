// The goal planner's generator (src/services/planGenerator.js), a pure module: small made-up data for each rule, then the acceptance example
// on the real data (decision 35 of docs/plans/MY_PLAN_PLAN.md).
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const gen = require('../src/services/planGenerator');
const { loadPlanData } = require('../src/services/planData');

const { generatePlan, previewPlan, groupByWeek, onTrack, validateInput, dayBudget, dayNumber, weekdayOf, todayIst, PlanInputError } = gen;
const sum = (items) => items.reduce((s, it) => s + it.plannedMinutes, 0);

// ---- made-up data ----
const problems = (prefix, difficulties) => difficulties.map((d, i) => ({ title: `${prefix} ${i + 1}`, link: `https://x.test/${prefix}-${i + 1}`, difficulty: d }));
const makeData = (over = {}) => ({
  sheets: {
    'blind-75': { topics: [
      { id: 'late', title: 'Late topic', problems: problems('late', ['Medium', 'Medium']) },
      { id: 'early', title: 'Early topic', problems: problems('early', ['Easy', 'Medium', 'Hard']) },
      { id: 'extra-topic', title: 'Extra topic', problems: problems('xtra', ['Medium', 'Medium']) },
    ] },
    'neetcode-150': { topics: [{ id: 'arrays', title: 'Arrays', problems: problems('arr', ['Easy', 'Easy']) }] },
  },
  planCatalog: { steps: ['s1', 's2', 's3'], sheets: {
    'blind-75': { late: { step: 's2', order: 2, core: true }, early: { step: 's1', order: 1, core: true }, 'extra-topic': { step: 's3', order: 3, core: false } },
    'neetcode-150': { arrays: { step: 's1', order: 1, core: true } },
  } },
  notes: { os: [{ id: 'os-a', title: 'OS A', readMinutes: 10 }, { id: 'os-b', title: 'OS B', readMinutes: 20 }], dbms: [{ id: 'dbms-a', title: 'DBMS A', readMinutes: 5 }] },
  roadmapCatalog: [{ slug: 'backend', title: 'Backend', steps: [
    { id: 'step-one', title: 'Step one', from: 10, to: 20, unit: 'hours', practice: [{ kind: 'notes', target: 'os:os-a', label: 'x' }, { kind: 'sheet', target: 'blind-75:early', label: 'y' }], project: { brief: 'b', stack: 's' } },
    { id: 'step-two', title: 'Step two', from: 2, to: 4, unit: 'hours', practice: [{ kind: 'sheet', target: 'blind-75:early', label: 'y' }], project: { brief: 'b', stack: 's' } },
  ] }],
  behavioral: [{ id: 1, question: 'Tell me about yourself.' }, { id: 2, question: 'Conflict?' }],
  ...over,
});
const base = { goalType: 'placements', style: 'one-topic', startDate: '2026-11-16', weeks: 4, hoursByWeekday: [3, 3, 3, 3, 3, 4, 0], restDay: 6, sheetSlug: 'blind-75', subjects: ['os'] };
const ymd = (n) => new Date(n * 86400000).toISOString().slice(0, 10);

describe('dates and the day budget', () => {
  it('works with plain dates: weekdays start on Monday, an impossible date is refused, and Indian time is used for today', () => {
    assert.equal(weekdayOf(dayNumber('2026-11-13')), 4); // a Friday
    assert.equal(weekdayOf(dayNumber('2026-11-16')), 0); // a Monday
    assert.ok(Number.isNaN(dayNumber('2026-02-30')));
    assert.equal(todayIst(new Date('2026-11-12T20:00:00Z')), '2026-11-13'); // 01:30 the next morning in India
    assert.equal(todayIst(new Date('2026-11-12T12:00:00Z')), '2026-11-12');
  });
  it('plans a day to 85 percent of the hours, of which new items take up to 70 percent', () => {
    assert.deepEqual(dayBudget(3), { planned: 153, fresh: 126 });
    assert.deepEqual(dayBudget(5), { planned: 255, fresh: 210 });
    assert.deepEqual(dayBudget(0), { planned: 0, fresh: 0 });
  });
});

describe('the form rules', () => {
  const data = makeData();
  const bad = (over, text) => assert.match(validateInput({ ...base, ...over }, data).join('\n'), text);
  it('accepts a good form', () => assert.deepEqual(validateInput(base, data), []));
  it('refuses a wrong goal, style, date, number of weeks, hours, rest day, sheet, roadmap and subjects', () => {
    bad({ goalType: 'x' }, /goalType/);
    bad({ style: 'x' }, /style/);
    bad({ startDate: '2026-02-30' }, /startDate/);
    bad({ weeks: 0 }, /weeks/);
    bad({ weeks: 53 }, /weeks/);
    bad({ weeks: 2.5 }, /weeks/);
    bad({ hoursByWeekday: [3, 3, 3] }, /hoursByWeekday/);
    bad({ hoursByWeekday: [13, 3, 3, 3, 3, 3, 3] }, /hoursByWeekday/);
    bad({ hoursByWeekday: [0.2, 3, 3, 3, 3, 3, 3] }, /hoursByWeekday/);
    bad({ restDay: 7 }, /restDay/);
    bad({ sheetSlug: 'nope' }, /sheetSlug/);
    bad({ goalType: 'role', roadmapSlug: 'nope' }, /roadmapSlug/);
    bad({ subjects: ['nope'] }, /subjects/);
    bad({ goalType: 'bigtech', sheetSlug: 'blind-75' }, /big-tech/);
  });
  it('needs at least one study day a week (hours on the rest day do not count)', () => {
    bad({ hoursByWeekday: [0, 0, 0, 0, 0, 0, 5], restDay: 6 }, /at least one day/);
    bad({ hoursByWeekday: [0, 0, 0, 0, 0, 0, 0], restDay: null }, /at least one day/);
    assert.deepEqual(validateInput({ ...base, hoursByWeekday: [0, 0, 0, 0, 0, 0, 5], restDay: null }, data), []);
  });
  it('generatePlan throws a PlanInputError that lists every problem', () => {
    assert.throws(() => generatePlan({ ...base, weeks: 0, style: 'x' }, data), (e) => e instanceof PlanInputError && e.messages.length === 2);
  });
});

describe('estimates (decision 29)', () => {
  it('counts Easy 40, Medium 70, Hard 120 minutes, an unknown difficulty as Medium, and a notes section as 3 times its reading plus 5', () => {
    assert.deepEqual([gen.problemMinutes('Easy'), gen.problemMinutes('Medium'), gen.problemMinutes('Hard'), gen.problemMinutes('Basic'), gen.problemMinutes(undefined)], [40, 70, 120, 30, 70]);
    assert.equal(gen.notesMinutes(10), 35);
    const plan = generatePlan({ ...base, weeks: 12 }, makeData());
    assert.equal(sum(plan.items.filter((i) => i.ref === 'notes:os:os-b')), 65); // 3 x 20 + 5 (it may be split over two days)
    assert.equal(sum(plan.items.filter((i) => i.title === 'early 1')), 40);
  });
});

describe('what goes into the plan', () => {
  it('follows the dependency order of the plan catalog, not the order of the sheet', () => {
    const plan = generatePlan({ ...base, subjects: [], weeks: 12 }, makeData());
    const topics = [...new Set(plan.items.filter((i) => i.type === 'dsa').map((i) => i.topicId))];
    assert.deepEqual(topics, ['early', 'late', 'extra-topic']);
  });
  it('leaves out solved problems (and counts them), "already know" topics (and lists them), and schedules a problem in two topics once', () => {
    const data = makeData();
    data.sheets['blind-75'].topics[0].problems.push({ title: 'shared', link: 'https://x.test/early-1', difficulty: 'Easy' }); // same link as early 1
    const plan = generatePlan({ ...base, subjects: [], weeks: 12, solvedLinks: ['https://x.test/early-2'], knownTopics: ['extra-topic'] }, data);
    const links = plan.items.filter((i) => i.type === 'dsa').map((i) => i.link);
    assert.equal(new Set(links).size, links.length);
    assert.ok(!links.includes('https://x.test/early-2'));
    assert.equal(plan.coverage.alreadySolved, 1);
    assert.ok(!plan.items.some((i) => i.topicId === 'extra-topic'));
    assert.deepEqual(plan.coverage.knownTopics, [{ topicId: 'extra-topic', title: 'Extra topic', problems: 2 }]);
  });
  it('plans nothing, without an error, when the sheet has nothing left', () => {
    const plan = generatePlan({ ...base, subjects: [], solvedLinks: Object.values(makeData().sheets['blind-75'].topics).flatMap((t) => t.problems.map((p) => p.link)) }, makeData());
    assert.equal(plan.items.length, 0);
    assert.ok(plan.notices.includes('nothing-to-plan'));
    assert.equal(plan.finishDate, null);
  });
});

describe('fitting the days', () => {
  const data = makeData();
  const plan = generatePlan({ ...base, weeks: 12 }, data);
  it('never plans a day above 85 percent of its hours or new items above 70 percent, and a rest day or a zero-hour day stays empty', () => {
    for (const d of plan.days) {
      const items = plan.items.filter((i) => i.day === d.date);
      assert.ok(sum(items) <= d.plannedCap, d.date);
      assert.ok(sum(items.filter((i) => i.type !== 'mock' && i.type !== 'behavioral')) <= d.newCap, d.date);
      if (d.hours === 0) assert.equal(items.length, 0, `${d.date} should be empty`);
    }
    assert.ok(plan.days.filter((d) => d.weekday === 6).every((d) => d.hours === 0));
  });
  it('puts the shortest item first in a day', () => {
    for (const d of plan.days) {
      const mins = plan.items.filter((i) => i.day === d.date && i.type !== 'mock' && i.type !== 'behavioral').map((i) => i.plannedMinutes);
      assert.deepEqual(mins, [...mins].sort((a, b) => a - b));
    }
  });
  it('finishes early when there is more time than content, and says so', () => {
    assert.equal(plan.coverage.leftOut.length, 0);
    assert.ok(plan.earlyDays >= 7 && plan.notices.includes('early-finish'));
    assert.ok(dayNumber(plan.finishDate) < dayNumber(plan.deadline));
  });
  it('uses a smaller item of the same topic to fill the rest of a day instead of leaving a gap (decision 30)', () => {
    const d = makeData({ sheets: { 'blind-75': { topics: [{ id: 'early', title: 'E', problems: problems('e', ['Hard', 'Hard', 'Easy']) }] } }, planCatalog: { steps: ['s1'], sheets: { 'blind-75': { early: { step: 's1', order: 1, core: true } } } } });
    // 4 hours a day: new items up to 168 minutes: Hard (120) then the next Hard does not fit, the Easy (40) does
    const p = generatePlan({ ...base, subjects: [], weeks: 1, hoursByWeekday: [4, 4, 4, 4, 4, 0, 0], restDay: null }, d);
    const firstDay = p.items.filter((i) => i.day === p.items[0].day).map((i) => i.plannedMinutes).sort((a, b) => a - b);
    assert.deepEqual(firstDay, [40, 120]);
  });
  it('splits an item that is longer than a whole day into parts that add up to its minutes', () => {
    const d = makeData({ sheets: { 'blind-75': { topics: [{ id: 'early', title: 'E', problems: problems('e', ['Hard']) }] } }, planCatalog: { steps: ['s1'], sheets: { 'blind-75': { early: { step: 's1', order: 1, core: true } } } } });
    const p = generatePlan({ ...base, subjects: [], weeks: 2, hoursByWeekday: [1, 1, 1, 1, 1, 0, 0], restDay: null }, d); // 1 hour: 42 new minutes a day
    const parts = p.items.filter((i) => i.type === 'dsa');
    assert.deepEqual(parts.map((i) => i.part), [{ n: 1, of: 3 }, { n: 2, of: 3 }, { n: 3, of: 3 }]);
    assert.equal(sum(parts), 120);
    assert.ok(parts.every((i) => i.plannedMinutes <= 42));
  });
});

describe('core first when time is short (decisions 10 and 28)', () => {
  const data = makeData();
  it('drops the extra topics first and says so', () => {
    // content: early 230 + late 140 + os-a 35 + os-b 65 = 470 core, extra 140; one week of 3 hours a day = 5 x 126 = 630 minus gaps: ask for less
    const p = generatePlan({ ...base, weeks: 1, hoursByWeekday: [2, 2, 2, 2, 2, 0, 0], restDay: null }, data); // 84 new minutes a day = 420 a week
    assert.ok(p.notices.includes('core-first'));
    assert.ok(p.coverage.leftOut.some((l) => l.reason === 'extra' && l.topicTitle === 'Extra topic'));
    assert.ok(!p.items.some((i) => i.topicId === 'extra-topic'));
  });
  it('then leaves out the tail of the core, in order, and says even the core does not fit', () => {
    const p = generatePlan({ ...base, weeks: 1, hoursByWeekday: [1, 0, 0, 0, 0, 0, 0], restDay: null }, data);
    assert.ok(p.notices.includes('core-does-not-fit'));
    const placedRefs = p.items.map((i) => i.link || i.ref);
    const firstLeft = p.coverage.leftOut.find((l) => l.reason === 'no-room');
    assert.ok(firstLeft && !placedRefs.includes(firstLeft.link || firstLeft.ref));
    assert.equal(p.coverage.syllabusMinutes, p.coverage.plannedMinutes + sum(p.coverage.leftOut));
  });
});

describe('the study styles (decisions 13 and 40)', () => {
  // every item is about one day's room (1 hour a day = 42 new minutes; Easy is 40, a notes section here is 3 x 12 + 5 = 41), so the order of the days is the order of the sequence
  const data = makeData({
    sheets: { 'blind-75': { topics: [
      { id: 'late', title: 'L', problems: problems('l', ['Easy', 'Easy']) },
      { id: 'early', title: 'E', problems: problems('e', ['Easy', 'Easy', 'Easy']) },
      { id: 'extra-topic', title: 'X', problems: problems('x', ['Easy', 'Easy']) },
    ] } },
    notes: { os: [{ id: 'a', title: 'A', readMinutes: 12 }, { id: 'b', title: 'B', readMinutes: 12 }, { id: 'c', title: 'C', readMinutes: 12 }] },
  });
  const order = (style) => generatePlan({ ...base, style, weeks: 12, hoursByWeekday: [1, 1, 1, 1, 1, 1, 1], restDay: null }, data).items.map((i) => (i.type === 'notes' ? i.title : i.title));
  it('"one topic at a time": one notes section after every two topics, the rest at the end', () => {
    assert.deepEqual(order('one-topic'), ['e 1', 'e 2', 'e 3', 'l 1', 'l 2', 'A', 'x 1', 'x 2', 'B', 'C']);
  });
  it('"mix from the start" rotates over neighbouring topics and spreads the notes along the plan, and both styles schedule the same things', () => {
    assert.deepEqual(order('mixed'), ['e 1', 'A', 'l 1', 'x 1', 'B', 'e 2', 'l 2', 'C', 'x 2', 'e 3']);
    assert.deepEqual([...order('mixed')].sort(), [...order('one-topic')].sort());
  });
});

describe('dated items: mock blocks and behavioral questions (decisions 28 and 38)', () => {
  // many weeks and many problems, so unsolved core problems remain after every mock
  const big = makeData({ sheets: { 'blind-75': { topics: [{ id: 'early', title: 'E', problems: problems('e', Array(200).fill('Medium')) }] } }, planCatalog: { steps: ['s1'], sheets: { 'blind-75': { early: { step: 's1', order: 1, core: true } } } } });
  const input = { ...base, subjects: [], weeks: 8, startDate: '2026-11-16' };
  it('plans one 90-minute mock on a Saturday from week 4 when Saturday has 2 hours or more', () => {
    const p = generatePlan(input, big);
    const mocks = p.items.filter((i) => i.type === 'mock');
    assert.deepEqual(mocks.map((m) => m.ref), ['mock:4', 'mock:5', 'mock:6', 'mock:7']); // the Saturday of week 8 is the last day with study hours, so no problem is left after it: no mock
    assert.ok(mocks.every((m) => m.plannedMinutes === 90 && weekdayOf(dayNumber(m.day)) === 5));
    assert.equal(mocks[0].day, '2026-12-12');
  });
  it('plans no mock when Saturday has less than 2 hours, for a role goal, or when no unsolved core problem is left after it', () => {
    assert.equal(generatePlan({ ...input, hoursByWeekday: [3, 3, 3, 3, 3, 1.5, 0] }, big).items.filter((i) => i.type === 'mock').length, 0);
    assert.equal(generatePlan({ ...input, goalType: 'role', roadmapSlug: 'backend' }, big).items.filter((i) => i.type === 'mock').length, 0);
    const small = generatePlan({ ...input, weeks: 12 }, makeData()); // the whole sheet is done in the first weeks
    assert.equal(small.items.filter((i) => i.type === 'mock').length, 0);
  });
  it('plans a behavioral question (10 minutes) on each study day of the last two weeks, for the big-tech goal only', () => {
    const bt = generatePlan({ ...input, goalType: 'bigtech', sheetSlug: 'neetcode-150', subjects: [] }, makeData({ sheets: { 'neetcode-150': { topics: [{ id: 'arrays', title: 'A', problems: problems('a', Array(200).fill('Medium')) }] } } }));
    const beh = bt.items.filter((i) => i.type === 'behavioral');
    assert.ok(beh.length > 0 && beh.every((b) => b.plannedMinutes === 10 && dayNumber(b.day) > dayNumber(bt.deadline) - 14));
    assert.deepEqual(beh.slice(0, 3).map((b) => b.ref), ['behavioral:1', 'behavioral:2', 'behavioral:1']);
    assert.equal(generatePlan(input, big).items.filter((i) => i.type === 'behavioral').length, 0);
    assert.equal(generatePlan({ ...input, goalType: 'bigtech', sheetSlug: 'neetcode-150', weeks: 3, subjects: [] }, makeData()).items.filter((i) => i.type === 'behavioral').length, 0);
  });
});

describe('the role goal', () => {
  const p = generatePlan({ ...base, goalType: 'role', roadmapSlug: 'backend', subjects: undefined, weeks: 12 }, makeData());
  it('goes through the roadmap steps in order: the step (the middle of its range), its practice, then its project', () => {
    const titles = p.items.map((i) => i.title);
    assert.ok(titles.indexOf('Step one') < titles.indexOf('Project: Step one') && titles.indexOf('Project: Step one') < titles.indexOf('Step two'));
    assert.equal(sum(p.items.filter((i) => i.title === 'Step one')), 15 * 60); // split over several days
    assert.equal(p.items.find((i) => i.title === 'Project: Step one').plannedMinutes, 120);
    assert.equal(p.items.find((i) => i.title === 'Project: Step one').ref, 'project:backend:step-one');
  });
  it('includes the linked notes, and a sheet topic used by two steps is scheduled once', () => {
    assert.equal(p.items.filter((i) => i.ref === 'notes:os:os-a').length, 1);
    assert.equal(new Set(p.items.filter((i) => i.type === 'dsa').map((i) => i.link)).size, 3);
  });
});

describe('weeks, on track and the preview', () => {
  const plan = generatePlan({ ...base, startDate: '2026-11-13', weeks: 4, hoursByWeekday: [3, 3, 3, 3, 3, 5, 0] }, makeData({ sheets: { 'blind-75': { topics: [{ id: 'early', title: 'E', problems: problems('e', Array(60).fill('Medium')) }] } }, planCatalog: { steps: ['s1'], sheets: { 'blind-75': { early: { step: 's1', order: 1, core: true } } } } }));
  it('groups days into Monday-to-Sunday weeks, week 1 being the week that holds the start date', () => {
    const weeks = groupByWeek(plan);
    assert.equal(weeks[0].week, 1);
    assert.equal(weeks[0].from, '2026-11-09');
    assert.equal(weeks[0].to, '2026-11-15');
    assert.deepEqual(weeks[0].items.map((i) => i.day).filter((d, k, a) => a.indexOf(d) === k), ['2026-11-13', '2026-11-14']);
    assert.equal(weeks.length, 5);
  });
  it('says "On track" when nothing is behind, and counts days behind from the missed minutes', () => {
    const items = plan.items.map((i) => ({ ...i }));
    assert.equal(onTrack(items, '2026-11-13').text, 'On track');
    const behind = onTrack(items, '2026-11-19');
    assert.ok(behind.daysBehind >= 2 && behind.status === 'behind' && behind.suggestRebuild);
    const avgDay = sum(items) / new Set(items.map((i) => i.day)).size;
    assert.equal(behind.daysBehind, Math.floor(behind.behindMinutes / avgDay));
  });
  it('done work, even ahead of schedule, lowers "behind", and skipped items do not count', () => {
    const items = plan.items.map((i) => ({ ...i }));
    const before = onTrack(items, '2026-11-19');
    const withDone = items.map((i) => (dayNumber(i.day) < dayNumber('2026-11-19') ? { ...i, doneAt: 'x' } : i));
    assert.equal(onTrack(withDone, '2026-11-19').daysBehind, 0);
    const skipped = items.map((i) => (dayNumber(i.day) < dayNumber('2026-11-19') ? { ...i, skipped: true } : i));
    assert.equal(onTrack(skipped, '2026-11-19').missedItems, 0);
    assert.ok(before.missedItems >= 3);
  });
  it('suggests a rebuild at 3 missed items even when the days behind are fewer than 2', () => {
    const items = [{ day: '2026-11-13', plannedMinutes: 10 }, { day: '2026-11-13', plannedMinutes: 10 }, { day: '2026-11-13', plannedMinutes: 10 }, { day: '2026-11-14', plannedMinutes: 600 }];
    const r = onTrack(items, '2026-11-14');
    assert.equal(r.daysBehind, 0);
    assert.equal(r.missedItems, 3);
    assert.equal(r.suggestRebuild, true);
  });
  it('the preview gives the numbers and week 1 only, never the other weeks', () => {
    const pv = previewPlan({ ...base, startDate: '2026-11-13', weeks: 4 }, makeData());
    assert.deepEqual(Object.keys(pv).sort(), ['coverage', 'deadline', 'earlyDays', 'finishDate', 'notices', 'startDate', 'week1']);
    assert.equal(pv.week1.week, 1);
    assert.ok(pv.week1.items.every((i) => i.day <= '2026-11-15'));
    assert.ok(!JSON.stringify(pv).includes('2026-11-23'));
  });
});

describe('determinism', () => {
  it('gives the same plan for the same input and does not change its input', () => {
    const data = makeData();
    const input = { ...base, weeks: 6 };
    const copy = JSON.stringify([input, data]);
    const a = generatePlan(input, data);
    const b = generatePlan(input, data);
    assert.deepEqual(a, b);
    assert.equal(JSON.stringify([input, data]), copy);
  });
});

// ---- the acceptance example on the real data (decision 35) ----
describe('acceptance example: big-tech SDE interview, Monday to Friday 3 hours, Saturday 5, Sunday rest, from Friday 13 Nov 2026, NeetCode 150 and the four CS notes', () => {
  const data = loadPlanData();
  const input = { goalType: 'bigtech', style: 'one-topic', startDate: '2026-11-13', hoursByWeekday: [3, 3, 3, 3, 3, 5, 0], restDay: 6, sheetSlug: 'neetcode-150', subjects: ['os', 'dbms', 'cn', 'oops'] };

  // worked out here without the generator: 150 problems by difficulty, and 3 x reading time + 5 for each of the 41 notes sections
  const problemsAll = data.sheets['neetcode-150'].topics.flatMap((t) => t.problems);
  const perDifficulty = (d) => problemsAll.filter((p) => p.difficulty === d).length;
  const dsaMinutes = perDifficulty('Easy') * 40 + perDifficulty('Medium') * 70 + perDifficulty('Hard') * 120;
  const notesMinutesAll = ['os', 'dbms', 'cn', 'oops'].flatMap((s) => data.notes[s]).reduce((n, s) => n + 3 * s.readMinutes + 5, 0);

  it('the syllabus is 150 problems and 41 notes sections, worked out by hand', () => {
    assert.deepEqual([perDifficulty('Easy'), perDifficulty('Medium'), perDifficulty('Hard')], [27, 102, 21]);
    assert.equal(dsaMinutes, 10740);
    assert.equal(['os', 'dbms', 'cn', 'oops'].flatMap((s) => data.notes[s]).length, 41);
    const plan = generatePlan({ ...input, weeks: 12 }, data);
    assert.equal(plan.coverage.syllabusMinutes, dsaMinutes + notesMinutesAll);
    assert.equal(plan.coverage.syllabusItems, 191);
  });
  it('a normal week is planned to 17 hours (85 percent of 20), and 12 weeks have 168 hours of room for new items (70 percent)', () => {
    const plan = generatePlan({ ...input, weeks: 12 }, data);
    assert.equal(plan.deadline, '2027-02-04');
    const week = plan.days.filter((d) => d.date >= '2026-11-16' && d.date <= '2026-11-22');
    assert.equal(sum(week.map((d) => ({ plannedMinutes: d.plannedCap }))), 17 * 60);
    assert.equal(sum(plan.days.map((d) => ({ plannedMinutes: d.newCap }))), 168 * 60);
  });
  // The planned minutes and the left-out count come from running the generator once; they were checked by hand: planned + left out = the syllabus (12,109),
  // planned is below the room for new items (weeks x 14 h), the first week (Friday 126 + Saturday 210 minutes of room) holds 330, and the mock and behavioral minutes are 90 and 10 each.
  for (const [weeks, mocks, behavioral, planned, leftOut] of [[12, 9, 12, 8718, 56], [8, 5, 12, 5865, 103], [6, 3, 12, 4380, 125]]) {
    it(`${weeks} weeks: core first, no day above 85 percent, ${mocks} mock blocks, ${behavioral} behavioral questions, nothing silently lost`, () => {
      const plan = generatePlan({ ...input, weeks }, data);
      const c = plan.coverage;
      assert.ok(plan.notices.includes('core-first') && plan.notices.includes('core-does-not-fit'));
      assert.equal(c.syllabusMinutes, c.plannedMinutes + sum(c.leftOut), 'every minute is either planned or listed as left out');
      assert.equal(c.plannedMinutes, planned);
      assert.equal(c.leftOut.length, leftOut);
      assert.equal(c.extraMinutes, mocks * 90 + behavioral * 10);
      assert.equal(sum(plan.items.filter((i) => i.day <= '2026-11-15')), 330);
      assert.ok(c.plannedMinutes <= weeks * 14 * 60, 'new items never use more than 70 percent of the hours');
      assert.ok(c.plannedMinutes >= weeks * 14 * 60 * 0.8, 'days are filled close to their limit');
      for (const d of plan.days) assert.ok(sum(plan.items.filter((i) => i.day === d.date)) <= d.plannedCap, d.date);
      assert.equal(plan.items.filter((i) => i.type === 'mock').length, mocks);
      assert.equal(plan.items.filter((i) => i.type === 'behavioral').length, behavioral);
      assert.equal(plan.finishDate, plan.deadline);
      assert.ok(c.leftOut.some((l) => l.reason === 'extra' && l.topicTitle === 'Advanced Graphs'), 'the extra topic goes first');
      const doneTopics = new Set(plan.items.filter((i) => i.type === 'dsa').map((i) => i.topicId));
      assert.ok(doneTopics.has('arrays-hashing') && !doneTopics.has('advanced-graphs'));
    });
  }
  it('more weeks plan more of the syllabus, and the 52-week plan fits everything with time to spare', () => {
    const planned = [6, 8, 12, 26].map((w) => generatePlan({ ...input, weeks: w }, data).coverage.plannedMinutes);
    assert.deepEqual(planned, [...planned].sort((a, b) => a - b));
    const all = generatePlan({ ...input, weeks: 52 }, data);
    assert.equal(all.coverage.leftOut.length, 0);
    assert.equal(all.coverage.plannedMinutes, all.coverage.syllabusMinutes);
    assert.ok(all.notices.includes('early-finish') && all.earlyDays > 0);
  });
  it('the other goals and styles run on the real data: placements on Striver A2Z, a role on every roadmap, mixed style', () => {
    const a2z = generatePlan({ ...input, goalType: 'placements', sheetSlug: 'striver-a2z', weeks: 20, subjects: ['os'] }, data);
    assert.ok(a2z.items.length > 0 && a2z.coverage.leftOut.some((l) => l.reason === 'extra'));
    for (const r of data.roadmapCatalog) {
      const role = generatePlan({ ...input, goalType: 'role', roadmapSlug: r.slug, weeks: 26 }, data);
      assert.ok(role.items.length >= r.steps.length * 2, r.slug);
    }
    const mixed = generatePlan({ ...input, style: 'mixed', weeks: 12 }, data);
    assert.equal(mixed.coverage.syllabusMinutes, generatePlan({ ...input, weeks: 12 }, data).coverage.syllabusMinutes);
  });
});
