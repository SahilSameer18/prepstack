// The fair share and the pace of the goal planner (docs/plans/MY_PLAN_COVERAGE_PLAN.md, phases A, B and D1): when time is short every DSA topic and every chosen
// CS subject keeps a floor (1 problem, 3 sections) instead of the tail of the list being cut; the screens get a coverage list; a "pace" multiplies problem minutes.
// Part 1 uses small made-up data whose numbers are worked out in the comments. Part 2 runs the real data over many goals, lengths and hours.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const gen = require('../src/services/planGenerator');
const { loadPlanData } = require('../src/services/planData');

const { generatePlan, previewPlan, baseId, PlanInputError } = gen;
const problems = (prefix, difficulties) => difficulties.map((d, i) => ({ title: `${prefix}${i + 1}`, link: `https://x.test/${prefix}-${i + 1}`, difficulty: d }));
const entry = (order, core = true) => ({ step: 's1', order, core });
// topics: { id, title, problems, core?, order? }
const makeData = (topics, notes = {}) => ({
  sheets: { 'blind-75': { topics: topics.map((t) => ({ id: t.id, title: t.title || t.id, problems: t.problems })) } },
  planCatalog: { steps: ['s1'], sheets: { 'blind-75': Object.fromEntries(topics.map((t, k) => [t.id, entry(t.order ?? k + 1, t.core ?? true)])) } },
  notes,
  roadmapCatalog: [],
  behavioral: [{ id: 1, question: 'Tell me about yourself.' }],
});
const sections = (n, prefix = 's', readMinutes = 5) => Array.from({ length: n }, (_, k) => ({ id: `${prefix}${k + 1}`, title: `${prefix.toUpperCase()}${k + 1}`, readMinutes })); // 3 x 5 + 5 = 20 minutes each
const easy = (n) => Array.from({ length: n }, () => 'Easy'); // 40 minutes each

// Monday 16 Nov 2026; 2 hours a day = 84 new minutes (70 percent of 120), so two Easy problems (80) fit a day and a third does not.
const base = { goalType: 'placements', style: 'one-topic', startDate: '2026-11-16', weeks: 1, hoursByWeekday: [2, 2, 2, 0, 0, 0, 0], restDay: null, sheetSlug: 'blind-75', subjects: [] };
const count = (plan, topicId) => plan.items.filter((i) => i.type === 'dsa' && i.topicId === topicId).length;
const uniq = (items) => new Set(items.map(baseId)).size;

describe('a plan that fits is not changed', () => {
  it('keeps every item in order and does not say it spread anything', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(3)) }, { id: 'b', problems: problems('b', easy(3)) }]); // 240 minutes in a room of 3 x 84 = 252
    const p = generatePlan(base, data);
    assert.equal(p.items.length, 6);
    assert.equal(p.coverage.leftOut.length, 0);
    assert.ok(!p.notices.includes('spread') && !p.notices.includes('core-does-not-fit'));
    assert.deepEqual(p.coverage.byGroup.map((g) => [g.label, g.placed, g.total, g.state]), [['a', 3, 3, 'all'], ['b', 3, 3, 'all']]);
  });
});

describe('a fair share when time is short', () => {
  it('two equal topics share the room instead of the first one taking it all', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(6)) }, { id: 'b', problems: problems('b', easy(6)) }]); // 480 minutes, room 252 = 6 problems
    const p = generatePlan(base, data);
    assert.deepEqual([count(p, 'a'), count(p, 'b')], [3, 3]);
    assert.ok(p.notices.includes('spread') && p.notices.includes('core-does-not-fit'));
    assert.equal(p.coverage.leftOut.length, 6);
    assert.ok(p.coverage.leftOut.every((l) => l.reason === 'no-room'));
    assert.equal(p.coverage.syllabusMinutes, p.coverage.plannedMinutes + p.coverage.leftOut.reduce((s, l) => s + l.plannedMinutes, 0));
  });
  it('a bigger topic keeps about the same share of its own content, not the same number of problems', () => {
    const data = makeData([{ id: 'big', problems: problems('g', easy(8)) }, { id: 'small', problems: problems('s', easy(2)) }]); // 400 minutes, room 252 = 6 problems
    const p = generatePlan(base, data);
    assert.deepEqual([count(p, 'big'), count(p, 'small')], [5, 1]); // 5 of 8 and 1 of 2: a floor of one each, then the group with the smaller share so far
  });
  it('trims Hard problems first, even when a Hard problem would fit, then the last ones', () => {
    const data = makeData([{ id: 'a', problems: [...problems('m', ['Medium']), ...problems('h', ['Hard']).map((x) => ({ ...x, title: 'H' })), ...problems('e', ['Easy']), ...problems('n', ['Medium']).map((x) => ({ ...x, title: 'N', link: 'https://x.test/n-2' }))] }]);
    // 300 minutes of content in a room of 3 x 84 = 252: the floor is the first Medium (70); then in order Easy 40 and the second Medium 70; the Hard 120 would fit before them in sheet order, but it goes last
    const p = generatePlan({ ...base, hoursByWeekday: [2, 2, 2, 0, 0, 0, 0] }, data);
    assert.deepEqual([...new Set(p.items.map((i) => i.title))].sort(), ['N', 'e1', 'm1']); // a problem split over two days is still one problem
    assert.deepEqual(p.coverage.leftOut.map((l) => l.title), ['H']);
  });
  it('a topic whose first problem is Hard keeps an easier one as its floor', () => {
    const data = makeData([{ id: 'a', problems: [{ title: 'Hardfirst', link: 'https://x.test/h', difficulty: 'Hard' }, { title: 'Easylater', link: 'https://x.test/e', difficulty: 'Easy' }] }, { id: 'b', problems: problems('b', easy(8)) }]);
    const p = generatePlan({ ...base, hoursByWeekday: [1, 0, 0, 0, 0, 0, 0] }, data); // room 42: one Easy only
    assert.deepEqual(p.items.map((i) => i.title), ['Easylater']);
  });
  it('when even the floors do not fit, the topics come in list order and the later ones are named as not included', () => {
    const data = makeData(Array.from({ length: 5 }, (_, k) => ({ id: `t${k + 1}`, problems: problems(`t${k + 1}-`, easy(2)) })));
    const p = generatePlan({ ...base, hoursByWeekday: [2, 2, 0, 0, 0, 0, 0] }, data); // room 168 = 4 problems for 5 topics
    assert.deepEqual([1, 2, 3, 4, 5].map((k) => count(p, `t${k}`)), [1, 1, 1, 1, 0]);
    assert.deepEqual(p.coverage.byGroup.filter((g) => g.state === 'none').map((g) => g.label), ['t5']);
  });
  it('the order of the topics (dependency order) is kept, and the same input gives the same plan', () => {
    const data = makeData(Array.from({ length: 4 }, (_, k) => ({ id: `t${k + 1}`, problems: problems(`t${k + 1}-`, easy(6)) })));
    const input = { ...base, weeks: 2, hoursByWeekday: [2, 2, 2, 2, 2, 0, 0] };
    const p = generatePlan(input, data);
    const firstDay = (id) => p.items.filter((i) => i.topicId === id).map((i) => i.day).sort()[0];
    assert.ok(firstDay('t1') <= firstDay('t2') && firstDay('t2') <= firstDay('t3') && firstDay('t3') <= firstDay('t4'));
    assert.deepEqual(generatePlan(input, data), p);
  });
  it('the mixed style keeps the floors too', () => {
    const data = makeData(Array.from({ length: 4 }, (_, k) => ({ id: `t${k + 1}`, problems: problems(`t${k + 1}-`, easy(6)) })));
    const p = generatePlan({ ...base, style: 'mixed', weeks: 2, hoursByWeekday: [2, 2, 2, 2, 2, 0, 0] }, data);
    for (const id of ['t1', 't2', 't3', 't4']) assert.ok(count(p, id) >= 1, id);
  });
  it('a part-done item of a rebuild always stays, even when it is last in the list', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(6)) }, { id: 'b', problems: problems('b', easy(6)) }]);
    const last = { ref: 'dsa:blind-75:b', link: 'https://x.test/b-6' };
    const p = generatePlan(base, data, { remaining: new Map([[baseId(last), 25]]) });
    const kept = p.items.find((i) => i.link === 'https://x.test/b-6');
    assert.ok(kept, 'the part-done problem is in the plan');
    assert.equal(kept.plannedMinutes, 25);
  });
});

describe('extra topics', () => {
  const data = makeData([{ id: 'core', problems: problems('c', easy(6)) }, { id: 'extra', core: false, problems: problems('x', easy(6)) }]);
  it('keep a floor of one problem, and take more only after the core topics are complete', () => {
    const tight = generatePlan({ ...base, hoursByWeekday: [2, 2, 0, 0, 0, 0, 0] }, data); // room 4 problems
    assert.deepEqual([count(tight, 'core'), count(tight, 'extra')], [3, 1]);
    assert.ok(tight.notices.includes('core-first'));
    assert.ok(tight.coverage.leftOut.some((l) => l.reason === 'extra'));
    const roomy = generatePlan({ ...base, weeks: 2, hoursByWeekday: [2, 2, 2, 2, 2, 0, 0] }, data); // room 20 problems for 12
    assert.deepEqual([count(roomy, 'core'), count(roomy, 'extra')], [6, 6]);
    const middle = generatePlan({ ...base, hoursByWeekday: [2, 2, 2, 2, 0, 0, 0] }, data); // room 8 problems: all 6 core, then the 2 left over go to the extra topic
    assert.deepEqual([count(middle, 'core'), count(middle, 'extra')], [6, 2]);
  });
});

describe('CS subjects', () => {
  const data = makeData([{ id: 'a', problems: problems('a', easy(8)) }], { os: sections(6), dbms: sections(6, 'd') });
  it('each chosen subject keeps at least 3 sections when time is short', () => {
    const p = generatePlan({ ...base, subjects: ['os', 'dbms'] }, data); // 320 + 240 = 560 minutes in a room of 252
    const notes = (s) => p.items.filter((i) => i.type === 'notes' && i.subject === s).length;
    assert.ok(notes('os') >= 3 && notes('dbms') >= 3, `os ${notes('os')} dbms ${notes('dbms')}`);
    assert.ok(count(p, 'a') >= 1);
    assert.deepEqual(p.coverage.byGroup.filter((g) => g.kind === 'notes').map((g) => g.label), ['Operating Systems', 'DBMS']);
  });
  it('a subject with fewer than 3 sections keeps all of them', () => {
    const small = makeData([{ id: 'a', problems: problems('a', easy(8)) }], { os: sections(2) });
    const p = generatePlan({ ...base, subjects: ['os'] }, small);
    assert.equal(p.items.filter((i) => i.type === 'notes').length, 2);
  });
  it('no chosen subjects means no notes and no notes group', () => {
    const p = generatePlan(base, data);
    assert.equal(p.items.filter((i) => i.type === 'notes').length, 0);
    assert.ok(p.coverage.byGroup.every((g) => g.kind === 'dsa'));
  });
});

describe('what the plan says about coverage', () => {
  it('names every group with how many were planned, and merges "Arrays - I" and "Arrays - II"', () => {
    const data = makeData([{ id: 'a1', title: 'Arrays - I', problems: problems('a', easy(4)) }, { id: 'a2', title: 'Arrays - II', problems: problems('b', easy(4)) }, { id: 'g', title: 'Graph', problems: problems('g', easy(2)) }], { os: sections(4) });
    const p = generatePlan({ ...base, subjects: ['os'] }, data);
    const by = Object.fromEntries(p.coverage.byGroup.map((g) => [g.label, g]));
    assert.deepEqual(Object.keys(by).sort(), ['Arrays', 'Graph', 'Operating Systems']);
    assert.equal(by.Arrays.total, 8);
    assert.equal(by.Arrays.state, 'part');
    for (const g of p.coverage.byGroup) {
      assert.ok(g.placed <= g.total && g.placedMinutes <= g.minutes);
      assert.equal(g.state, g.placed === 0 ? 'none' : g.placed === g.total ? 'all' : 'part');
    }
    assert.equal(p.coverage.byGroup.reduce((s, g) => s + g.placed, 0), uniq(p.items.filter((i) => i.type === 'dsa' || i.type === 'notes')));
  });
  it('the public preview carries the groups but no problem names', () => {
    const data = makeData([{ id: 'a', problems: problems('secret', easy(8)) }]);
    const pv = previewPlan(base, data);
    assert.ok(Array.isArray(pv.coverage.byGroup) && pv.coverage.byGroup.length === 1);
    assert.ok(!JSON.stringify(pv.coverage).includes('secret'));
  });
  it('known topics and solved problems are not in the groups', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(3)) }, { id: 'b', problems: problems('b', easy(3)) }]);
    const p = generatePlan({ ...base, knownTopics: ['a'], solvedLinks: ['https://x.test/b-1'] }, data);
    assert.deepEqual(p.coverage.byGroup.map((g) => [g.label, g.total]), [['b', 2]]);
  });
});

describe('edge cases of the fair share', () => {
  it('no room at all (an overdue review backlog blocks every day) plans nothing, says so and does not hang', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(4)) }]);
    const p = generatePlan(base, data, { backlogMinutes: 1000000 });
    assert.equal(p.items.length, 0);
    assert.equal(p.coverage.leftOut.length, 4);
    assert.ok(p.notices.includes('core-does-not-fit'));
  });
  it('a lighter day takes room away', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(8)) }]);
    const normal = generatePlan(base, data);
    const lighter = generatePlan({ ...base, lighterDays: [{ from: '2026-11-17', to: '2026-11-17', hours: 0 }] }, data);
    assert.equal(normal.items.length, 6);
    assert.equal(lighter.items.length, 4);
    assert.ok(lighter.items.every((i) => i.day !== '2026-11-17'));
  });
  it('study only on weekends works', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(8)) }]);
    const p = generatePlan({ ...base, weeks: 2, hoursByWeekday: [0, 0, 0, 0, 0, 2, 2] }, data);
    assert.ok(p.items.length > 0 && p.items.every((i) => ['2026-11-21', '2026-11-22', '2026-11-28', '2026-11-29'].includes(i.day)));
  });
  it('a single study day in the whole plan works', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(8)) }, { id: 'b', problems: problems('b', easy(8)) }]);
    const p = generatePlan({ ...base, hoursByWeekday: [0, 0, 0, 0, 0, 2, 0] }, data);
    assert.equal(p.items.length, 2);
    assert.deepEqual([count(p, 'a'), count(p, 'b')], [1, 1]);
  });
  it('the room equal to the content is not a spread', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(6)) }]);
    const p = generatePlan(base, data); // 240 in a room of 252
    assert.ok(!p.notices.includes('spread'));
  });
  it('a roadmap (role) plan is not changed by the fair share', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(3)) }], {});
    data.roadmapCatalog = [{ slug: 'r', title: 'R', steps: [{ id: 'one', title: 'One', from: 1, to: 1, unit: 'hours', practice: [{ kind: 'sheet', target: 'blind-75:a', label: 'x' }], project: { brief: 'b', stack: 's' } }] }];
    const p = generatePlan({ ...base, goalType: 'role', roadmapSlug: 'r', weeks: 4, hoursByWeekday: [3, 3, 3, 3, 3, 0, 0] }, data);
    assert.ok(!p.notices.includes('spread'));
    assert.equal(p.coverage.leftOut.length, 0);
  });
});

describe('my pace (phase D1)', () => {
  const data = makeData([{ id: 'a', problems: [{ title: 'B', link: 'https://x.test/1', difficulty: 'Basic' }, { title: 'E', link: 'https://x.test/2', difficulty: 'Easy' }, { title: 'M', link: 'https://x.test/3', difficulty: 'Medium' }, { title: 'H', link: 'https://x.test/4', difficulty: 'Hard' }] }], { os: sections(2) });
  // an item longer than a day is split into parts, so the minutes of a problem are the sum of its parts
  const minutes = (pace) => {
    const out = {};
    for (const i of generatePlan({ ...base, weeks: 8, hoursByWeekday: [1, 1, 1, 1, 1, 1, 1], pace, subjects: ['os'] }, data).items) out[i.title] = (out[i.title] || 0) + i.plannedMinutes;
    return out;
  };
  it('standard keeps today\'s minutes; faster is 0.6 and slower is 1.4 times, for problems only', () => {
    const standard = minutes('standard');
    assert.deepEqual([standard.B, standard.E, standard.M, standard.H], [30, 40, 70, 120]);
    assert.deepEqual(minutes(undefined), standard, 'no pace means standard');
    const faster = minutes('faster');
    assert.deepEqual([faster.B, faster.E, faster.M, faster.H], [18, 24, 42, 72]);
    const slower = minutes('slower');
    assert.deepEqual([slower.B, slower.E, slower.M, slower.H], [42, 56, 98, 168]);
    assert.deepEqual([faster.S1, slower.S1], [standard.S1, standard.S1], 'notes sections do not change');
  });
  it('a bad pace is refused, and the plan says which pace it used', () => {
    assert.throws(() => generatePlan({ ...base, pace: 'turbo' }, data), (error) => error instanceof PlanInputError && /pace/.test(error.message));
    assert.equal(generatePlan({ ...base, pace: 'slower' }, data).input.pace, 'slower');
    assert.equal(generatePlan(base, data).input.pace, 'standard');
  });
  it('a slower pace plans less of the same sheet in the same time', () => {
    const wide = makeData([{ id: 'a', problems: problems('a', Array.from({ length: 30 }, () => 'Medium')) }]);
    const at = (pace) => uniq(generatePlan({ ...base, weeks: 2, hoursByWeekday: [2, 2, 2, 2, 2, 0, 0], pace }, wide).items); // problems, not parts
    assert.ok(at('faster') > at('standard') && at('standard') > at('slower'), `${at('faster')} ${at('standard')} ${at('slower')}`);
  });
  it('an item longer than a day is split and still adds up at the slowest pace', () => {
    const hard = makeData([{ id: 'a', problems: problems('h', ['Hard']) }]);
    const p = generatePlan({ ...base, weeks: 6, hoursByWeekday: [1, 1, 1, 1, 1, 0, 0], pace: 'slower' }, hard); // 168 minutes over days of 42
    assert.equal(p.items.length, 4);
    assert.equal(p.items.reduce((s, i) => s + i.plannedMinutes, 0), 168);
    assert.deepEqual(p.items.map((i) => i.part), [{ n: 1, of: 4 }, { n: 2, of: 4 }, { n: 3, of: 4 }, { n: 4, of: 4 }]);
  });
  it('a roadmap plan also multiplies the problems of its practice topics', () => {
    const d = makeData([{ id: 'a', problems: problems('a', ['Medium']) }], {});
    d.roadmapCatalog = [{ slug: 'r', title: 'R', steps: [{ id: 'one', title: 'One', from: 1, to: 1, unit: 'hours', practice: [{ kind: 'sheet', target: 'blind-75:a', label: 'x' }], project: { brief: 'b', stack: 's' } }] }];
    const p = generatePlan({ ...base, goalType: 'role', roadmapSlug: 'r', weeks: 4, hoursByWeekday: [4, 4, 4, 4, 4, 0, 0], pace: 'faster' }, d);
    assert.equal(p.items.find((i) => i.type === 'dsa').plannedMinutes, 42);
    assert.equal(p.items.find((i) => i.type === 'roadmap').plannedMinutes, 60, 'the step itself is not scaled');
  });
});

// ---------- Part 2: the real sheets and notes, many requests ----------
describe('the real data over many goals, lengths and hours', () => {
  const data = loadPlanData();
  const PAIRS = [['bigtech', 'neetcode-150'], ['bigtech', 'striver-sde'], ['placements', 'striver-a2z'], ['placements', 'blind-75'], ['placements', 'love-babbar']];
  const SUBJECTS = ['os', 'dbms', 'cn', 'oops'];
  const run = (goalType, sheetSlug, weeks, h, over = {}) => generatePlan({ goalType, style: 'one-topic', startDate: '2026-11-16', weeks, hoursByWeekday: [h, h, h, h, h, h + 1, h + 1], restDay: 6, sheetSlug, subjects: SUBJECTS, knownTopics: [], solvedLinks: [], ...over }, data);
  const sum = (list, key) => list.reduce((s, x) => s + x[key], 0);

  it('every plan is valid: not empty, nothing lost, no day too full, no key twice, groups add up', () => {
    for (const [goal, sheet] of PAIRS) {
      for (const weeks of [1, 2, 4, 8, 16, 26]) {
        for (const h of [1, 2, 3, 5]) {
          const p = run(goal, sheet, weeks, h);
          const tag = `${sheet} ${weeks}w ${h}h`;
          assert.ok(p.items.length > 0, `${tag}: empty`);
          const content = p.items.filter((i) => i.type === 'dsa' || i.type === 'notes');
          assert.equal(p.coverage.leftOut.length + uniq(content), p.coverage.syllabusItems, `${tag}: planned + left out is not the syllabus`);
          assert.equal(new Set(p.items.map((i) => i.key)).size, p.items.length, `${tag}: duplicate keys`);
          for (const d of p.days) assert.ok(d.minutes <= d.plannedCap, `${tag}: ${d.date} is over its limit`);
          assert.ok(p.coverage.plannedMinutes <= sum(p.days, 'newCap'), `${tag}: new items over the room`);
          for (const g of p.coverage.byGroup) assert.ok(g.placed <= g.total, `${tag}: ${g.label}`);
          assert.equal(p.coverage.byGroup.reduce((s, g) => s + g.placed, 0), uniq(content), `${tag}: groups do not add up`);
        }
      }
    }
  });
  it('a longer plan never holds fewer minutes of the same request', () => {
    for (const [goal, sheet] of PAIRS) {
      for (const h of [1, 2, 3, 5]) {
        const planned = [1, 2, 4, 8, 16, 26].map((w) => run(goal, sheet, w, h).coverage.plannedMinutes);
        assert.deepEqual(planned, [...planned].sort((a, b) => a - b), `${sheet} ${h}h: ${planned}`);
      }
    }
  });
  it('the same request gives the same plan, in both styles', () => {
    for (const style of ['one-topic', 'mixed']) {
      const a = run('bigtech', 'striver-sde', 9, 3, { style });
      assert.deepEqual(run('bigtech', 'striver-sde', 9, 3, { style }), a);
    }
  });
  // Below 4 weeks the floors of 16 to 18 topic groups and 4 subjects do not all fit the room; those short plans wait for the owner's list of patterns (decision 8 in the plan file).
  it('big-tech plans of 4 weeks or more at 2 hours or more keep every subject (3 sections) and every topic group (1 problem)', () => {
    for (const sheet of ['neetcode-150', 'striver-sde']) {
      const groups = new Set(data.sheets[sheet].topics.map((t) => String(t.title).trim().replace(/ - [IVX]+$/, '')));
      for (const weeks of [4, 6, 8, 9, 12, 16]) {
        for (const h of [2, 3, 5]) {
          for (const style of ['one-topic', 'mixed']) {
            const p = run('bigtech', sheet, weeks, h, { style });
            const tag = `${sheet} ${weeks}w ${h}h ${style}`;
            for (const s of SUBJECTS) assert.ok(p.items.filter((i) => i.type === 'notes' && i.subject === s).length >= 3, `${tag}: ${s} below 3 sections`);
            const planned = new Set(p.items.filter((i) => i.type === 'dsa').map((i) => String(i.topicTitle).replace(/ - [IVX]+$/, '')));
            assert.deepEqual([...groups].filter((g) => !planned.has(g)), [], `${tag}: topic groups missing`);
          }
        }
      }
    }
  });
  it('the owner\'s comparison case (Striver SDE, 9 weeks, 23 hours a week, four subjects) now covers every group and subject', () => {
    const p = run('bigtech', 'striver-sde', 9, 3, { hoursByWeekday: [3, 3, 3, 3, 3, 4, 4], restDay: null });
    assert.ok(p.coverage.byGroup.every((g) => g.state !== 'none'), p.coverage.byGroup.filter((g) => g.state === 'none').map((g) => g.label).join(', '));
    assert.ok(p.notices.includes('spread'));
  });
  it('a rare setup works: everything known, everything solved, no subjects, one study day', () => {
    const sheet = data.sheets['neetcode-150'];
    const all = sheet.topics.flatMap((t) => t.problems.map((x) => x.link));
    assert.equal(run('bigtech', 'neetcode-150', 8, 3, { solvedLinks: all, subjects: [] }).items.length, 0);
    assert.equal(run('bigtech', 'neetcode-150', 8, 3, { knownTopics: sheet.topics.map((t) => t.id), subjects: [] }).items.length, 0);
    const lone = run('placements', 'blind-75', 3, 2, { subjects: [], hoursByWeekday: [0, 0, 0, 2, 0, 0, 0], restDay: null });
    assert.ok(lone.items.length > 0 && lone.items.every((i) => new Date(i.day).getUTCDay() === 4));
  });
});

describe('nothing fits', () => {
  it('says so when there is content but not one task fits the days and hours, and not otherwise', () => {
    const data = makeData([{ id: 'a', problems: problems('a', easy(4)) }]);
    const tight = generatePlan({ ...base, hoursByWeekday: [0, 0, 0, 0, 0, 0.5, 0] }, data); // one day of 21 minutes: a 40-minute problem needs two days
    assert.equal(tight.items.length, 0);
    assert.ok(tight.notices.includes('nothing-fits'));
    assert.ok(previewPlan({ ...base, hoursByWeekday: [0, 0, 0, 0, 0, 0.5, 0] }, data).notices.includes('nothing-fits'));
    assert.ok(!generatePlan(base, data).notices.includes('nothing-fits'));
    const empty = generatePlan({ ...base, knownTopics: ['a'] }, data);
    assert.ok(empty.notices.includes('nothing-to-plan') && !empty.notices.includes('nothing-fits'), 'an empty syllabus is a different message');
  });
});
