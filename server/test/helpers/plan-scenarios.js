// Many different plan requests, made from a fixed seed (the same list every run), and the rules every plan must keep.
// Used by test/plan-scenarios.test.js (800 of them) and scripts/plan-fuzz.js (as many as you ask for).
// "fresh" = a new plan from the generator; "rebuild" = a plan some days in, with work ticked off, changed through the adjust module (rebuild, hours, lighter days or pace).
const gen = require('../../src/services/planGenerator');
const adj = require('../../src/services/planAdjust');
const { problemIdentity } = require('../../src/utils/problemIdentity');

const { generatePlan, baseId, dayNumber, ymdOf, weekdayOf, problemMinutes, PACES } = gen;

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHEET_GOALS = [['bigtech', 'neetcode-150'], ['bigtech', 'striver-sde'], ['placements', 'striver-a2z'], ['placements', 'blind-75'], ['placements', 'love-babbar'], ['placements', 'neetcode-150'], ['placements', 'striver-sde']];
const WEEKS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 26, 40, 52];
const UNIFORM_HOURS = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12];
const SUBJECT_POOL = ['os', 'dbms', 'cn', 'oops', 'hld'];

// A list of scenarios. Each has a stable signature so that no two are the same.
function buildScenarios(count, data, seed = 20261115) {
  const next = rng(seed);
  const pick = (list) => list[Math.floor(next() * list.length)];
  const int = (a, b) => a + Math.floor(next() * (b - a + 1));
  const chance = (p) => next() < p;
  const seen = new Set();
  const out = [];
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard += 1;
    const roll = next();
    const goal = roll < 0.3 ? ['role', null] : pick(SHEET_GOALS);
    const [goalType, sheetSlug] = goal;
    const roadmapSlug = goalType === 'role' ? pick(data.roadmapCatalog).slug : null;
    const kind = chance(0.27) ? 'rebuild' : 'fresh';
    const profile = pick(['uniform', 'uniform', 'weekendOnly', 'weekdayOnly', 'uneven']);
    let hours;
    if (profile === 'uniform') { const h = pick(UNIFORM_HOURS); hours = [h, h, h, h, h, h, h]; }
    else if (profile === 'weekendOnly') { const h = pick([1, 2, 4, 8]); hours = [0, 0, 0, 0, 0, h, h]; }
    else if (profile === 'weekdayOnly') { const h = pick([1, 2, 3, 5]); hours = [h, h, h, h, h, 0, 0]; }
    else hours = Array.from({ length: 7 }, () => pick([0, 0.5, 1, 2, 3, 5]));
    const restDay = chance(0.5) ? null : int(0, 6);
    if (!hours.some((h, d) => h > 0 && d !== restDay)) hours[restDay === 0 ? 1 : 0] = 2; // at least one study day
    const sheet = sheetSlug ? data.sheets[sheetSlug] : null;
    const topicIds = sheet ? sheet.topics.map((t) => t.id) : [];
    const links = sheet ? sheet.topics.flatMap((t) => t.problems.map((p) => p.link)) : [];
    const known = topicIds.filter(() => chance(0.12));
    const solved = links.filter(() => chance(0.2));
    const subjectCount = int(0, SUBJECT_POOL.length);
    const subjects = SUBJECT_POOL.filter(() => chance(subjectCount / SUBJECT_POOL.length));
    const scenario = {
      kind, goalType, sheetSlug, roadmapSlug, weeks: pick(WEEKS), hours, restDay,
      style: pick(['one-topic', 'mixed']), pace: pick(['faster', 'standard', 'slower']),
      subjects, knownTopics: known.length > 0 && chance(0.5) ? known : [], solvedLinks: solved.length && chance(0.5) ? solved : [],
      startDate: ymdOf(dayNumber('2026-11-16') + int(0, 6)),
    };
    // lighter days: up to two stretches of 1 to 14 days inside the plan, that do not touch
    const lighter = [];
    let cursor = 0;
    const total = scenario.weeks * 7;
    for (let k = 0; k < int(0, 2); k += 1) {
      const length = int(1, Math.min(14, Math.max(1, Math.floor(total / 4))));
      const from = cursor + int(0, Math.max(0, Math.floor(total / 3)));
      if (from + length > total) break;
      lighter.push({ from: ymdOf(dayNumber(scenario.startDate) + from), to: ymdOf(dayNumber(scenario.startDate) + from + length - 1), hours: pick([0, 0.5, 1, 2]) });
      cursor = from + length + 1;
    }
    scenario.lighterDays = lighter;
    if (kind === 'rebuild') {
      scenario.todayOffset = int(1, Math.max(1, Math.min(total - 1, 100)));
      scenario.doneChance = pick([0.1, 0.3, 0.6, 0.9]);
      scenario.change = pick(['rebuild', 'rebuild', 'hours', 'lighter', 'pace']);
      scenario.deadlineExtra = chance(0.3) ? int(1, 21) : 0;
      scenario.newHours = pick(UNIFORM_HOURS);
      scenario.newPace = pick(['faster', 'standard', 'slower']);
    }
    const signature = JSON.stringify(scenario);
    if (seen.has(signature)) continue;
    seen.add(signature);
    out.push({ ...scenario, id: out.length + 1 });
  }
  return out;
}

const toInput = (s) => ({
  goalType: s.goalType, style: s.style, startDate: s.startDate, weeks: s.weeks, hoursByWeekday: s.hours, restDay: s.restDay,
  sheetSlug: s.sheetSlug || undefined, roadmapSlug: s.roadmapSlug || undefined, subjects: s.subjects, knownTopics: s.knownTopics,
  solvedLinks: s.solvedLinks, lighterDays: s.lighterDays, pace: s.pace,
});
const hoursOnDay = (input, ymd) => {
  const n = dayNumber(ymd);
  const light = (input.lighterDays || []).find((r) => n >= dayNumber(r.from) && n <= dayNumber(r.to));
  if (weekdayOf(n) === (input.restDay ?? null)) return 0;
  return light ? light.hours : input.hoursByWeekday[weekdayOf(n)];
};
const uniqueCount = (items) => new Set(items.map(baseId)).size;

// ---- the rules for a fresh plan: returns a list of problems (empty = fine) ----
function checkFresh(s, data) {
  const problems = [];
  const bad = (text) => problems.push(`#${s.id} ${text}`);
  let plan;
  try { plan = generatePlan(toInput(s), data); } catch (error) { bad(`threw: ${error.message}`); return { problems, plan: null }; }
  const input = toInput(s);
  const keys = plan.items.map((i) => i.key);
  if (new Set(keys).size !== keys.length) bad('duplicate keys');
  const start = dayNumber(s.startDate);
  const deadline = dayNumber(plan.deadline);
  for (const it of plan.items) {
    const n = dayNumber(it.day);
    if (n < start || n > deadline) bad(`an item on ${it.day} is outside the plan`);
    if (hoursOnDay(input, it.day) === 0) bad(`an item on ${it.day}, a day with no study hours`);
    if (!(it.plannedMinutes > 0)) bad('an item with no minutes');
  }
  for (const d of plan.days) if (d.minutes > d.plannedCap) bad(`${d.date} has ${d.minutes} minutes, over its limit of ${d.plannedCap}`);
  const content = plan.items.filter((i) => i.type !== 'mock' && i.type !== 'behavioral');
  // a partly planned long item is in both lists: its placed parts and its unscheduled rest
  if (plan.coverage.leftOut.filter((l) => !l.partial).length + uniqueCount(content) !== plan.coverage.syllabusItems) bad('planned + left out is not the syllabus');
  if (plan.coverage.plannedMinutes > plan.days.reduce((sum, d) => sum + d.newCap, 0)) bad('new work is over the room');
  if (plan.input.pace !== s.pace) bad('the plan lost its pace');
  for (const it of plan.items) { // an unsplit problem has exactly its pace minutes
    if (it.type === 'dsa' && !it.part && it.plannedMinutes !== problemMinutes(it.difficulty, s.pace)) bad(`a problem has ${it.plannedMinutes} minutes at pace ${s.pace}`);
  }
  if (s.goalType !== 'role') {
    const dsaSolved = new Set(s.solvedLinks.map(problemIdentity));
    for (const it of plan.items) if (it.type === 'dsa' && dsaSolved.has(problemIdentity(it.link))) bad('a solved problem is in the plan');
    const known = new Set(s.knownTopics);
    for (const it of plan.items) if (it.type === 'dsa' && known.has(it.topicId)) bad('a known topic is in the plan');
    const groups = plan.coverage.byGroup;
    if (groups.reduce((sum, g) => sum + g.placed, 0) !== uniqueCount(plan.items.filter((i) => i.type === 'dsa' || i.type === 'notes'))) bad('coverage groups do not add up');
    for (const g of groups) {
      if (g.placed > g.total) bad(`${g.label}: placed more than it has`);
      if ((g.state === 'all') !== (g.placed === g.total) || (g.state === 'none') !== (g.placed === 0)) bad(`${g.label}: wrong state`);
    }
    for (const subject of s.subjects) { // a subject asked for appears in the list (unless every section is... it has sections)
      if (data.notes[subject] && data.notes[subject].length && !groups.some((g) => g.kind === 'notes')) bad('notes asked for but no notes group');
    }
  }
  return { problems, plan };
}

// ---- the rules for a rebuild some days in ----
function checkRebuild(s, data) {
  const problems = [];
  const bad = (text) => problems.push(`#${s.id} ${text}`);
  let plan;
  try { plan = generatePlan(toInput(s), data); } catch (error) { bad(`threw while making the first plan: ${error.message}`); return { problems, outcome: 'error' }; }
  if (!plan.items.length) return { problems, outcome: 'empty' };
  const todayN = Math.min(dayNumber(plan.deadline), dayNumber(s.startDate) + s.todayOffset);
  const today = ymdOf(todayN);
  // tick some earlier planner work done, the way the app does
  const next = rng(s.id * 7919);
  let items = plan.items;
  for (const it of plan.items) {
    if ((it.type === 'dsa' || it.type === 'notes') && it.day < today && next() < s.doneChance && !it.part) {
      const r = adj.markDone(items, it.key, { doneAt: `${it.day}T08:00:00Z`, doneDay: it.day, result: 'alone', quizScore: it.type === 'notes' ? 4 : undefined });
      if (!r.error) items = r.items;
    }
  }
  const stored = { input: plan.input, startDate: plan.startDate, deadline: plan.deadline, items };
  const change = { type: s.change };
  if (s.change === 'hours') change.hoursByWeekday = [s.newHours, s.newHours, s.newHours, s.newHours, s.newHours, s.newHours, s.newHours];
  if (s.change === 'lighter') change.lighterDays = [{ from: today, to: ymdOf(Math.min(dayNumber(plan.deadline), todayN + 3)), hours: 1 }];
  if (s.change === 'pace') change.pace = s.newPace;
  if (s.change === 'rebuild' && s.deadlineExtra) change.deadline = ymdOf(dayNumber(plan.deadline) + s.deadlineExtra);
  let result;
  try {
    result = adj.previewChange(stored, data, today, change);
  } catch (error) {
    if (error instanceof gen.PlanInputError) return { problems, outcome: 'refused' }; // a clean refusal is allowed
    bad(`threw ${error.name}: ${error.message}`);
    return { problems, outcome: 'error' };
  }
  if (result.error) return { problems, outcome: result.error }; // 'finished' or 'no-hours' style answers
  const after = result.plan;
  const keys = after.items.map((i) => i.key);
  if (new Set(keys).size !== keys.length) bad('duplicate keys after the change');
  const before = new Map(items.filter((i) => i.doneAt).map((i) => [i.key, i]));
  for (const [key, it] of before) {
    const now = after.items.find((x) => x.key === key);
    if (!now) bad('a done item vanished'); else if (!now.doneAt || now.day !== it.day || now.plannedMinutes !== it.plannedMinutes) bad('a done item changed');
  }
  for (const it of after.items) {
    if (!it.doneAt && !it.skipped && it.source === 'planner' && it.day < today && it.type !== 'review') bad(`an open item on ${it.day}, before today ${today}`);
    if (it.day > after.deadline) bad(`an item on ${it.day} is past the deadline ${after.deadline}`);
  }
  const expectedPace = s.change === 'pace' ? s.newPace : s.pace;
  if (after.input.pace !== expectedPace) bad(`the pace is ${after.input.pace}, expected ${expectedPace}`);
  if (!result.diff || String(result.diff.checksum).length !== 16) bad('no checksum');
  return { problems, outcome: 'applied' };
}

function runScenarios(scenarios, data) {
  const stats = { fresh: 0, rebuild: 0, outcomes: {}, cut: 0, groupNone: 0, subjectNone: 0, roleCut: 0, violations: [] };
  for (const s of scenarios) {
    if (s.kind === 'fresh') {
      const { problems, plan } = checkFresh(s, data);
      stats.fresh += 1;
      stats.violations.push(...problems);
      if (plan && plan.coverage.leftOut.length) {
        if (s.goalType === 'role') stats.roleCut += 1;
        else {
          stats.cut += 1;
          if (plan.coverage.byGroup.some((g) => g.kind === 'dsa' && g.state === 'none')) stats.groupNone += 1;
          if (plan.coverage.byGroup.some((g) => g.kind === 'notes' && g.state === 'none')) stats.subjectNone += 1;
        }
      }
    } else {
      const { problems, outcome } = checkRebuild(s, data);
      stats.rebuild += 1;
      stats.outcomes[outcome] = (stats.outcomes[outcome] || 0) + 1;
      stats.violations.push(...problems);
    }
  }
  return stats;
}

module.exports = { buildScenarios, checkFresh, checkRebuild, runScenarios, rng, PACES };
