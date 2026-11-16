// The goal planner's brain ("My plan"): a pure module. It takes the student's answers and the content data and returns a plan.
// No database, no clock, no randomness: the same input always gives the same plan (a test checks this).
// The rules are decided in docs/plans/MY_PLAN_PLAN.md (decision numbers in the comments below). This file is Phase 1 (the core):
// the three goals, core first, dependency order, the two study styles, the 85 percent rule with the 70/15/15 day budget, no gaps in a day,
// dated mock and behavioral items, weeks, coverage numbers and the "on track" maths. Phase 2 adds what a rebuild needs (the optional
// `context`: items to keep, a fixed deadline, a review backlog) and lighter days; the review ladder, skip, move and the change preview are in planAdjust.js.
//
// Dates are plain "YYYY-MM-DD" strings (Indian time is decided by the caller: todayIst below). Weekdays are numbered Monday = 0 ... Sunday = 6.
const limits = require('../config/limits');
const { problemIdentity } = require('../utils/problemIdentity');

const MINUTES_BY_DIFFICULTY = { Basic: 30, Easy: 40, Medium: 70, Hard: 120 }; // solve and check the solution (decision 29)
const FALLBACK_DIFFICULTY = 'Medium';
// "My pace": a multiplier on the minutes of a DSA problem. (docs/plans/MY_PLAN_COVERAGE_PLAN.md, phase D).
const PACES = { faster: 0.6, standard: 1, slower: 1.4 };
const DEFAULT_PACE = 'standard';
// Floors when time is short (owner decision, 15 Nov 2026): a chosen CS subject keeps at least 3 sections and a DSA topic group at least 1 problem.
const FLOOR_SECTIONS = 3;
const FLOOR_PROBLEMS = 1;
const SUBJECT_LABELS = { os: 'Operating Systems', dbms: 'DBMS', cn: 'Computer Networks', oops: 'OOP in Java', hld: 'System Design', lld: 'Low-level design' };
const NOTES_READING_FACTOR = 3; // a notes section = 3 times its reading time ...
const NOTES_QUIZ_MINUTES = 5; // ... plus the 5-question quiz (decisions 6 and 29)
const ROADMAP_PROJECT_MINUTES = 120; // a roadmap step's project brief (decision 39: a roadmap ref counts 120)
const PLANNED_PERCENT = 85; // a day is planned to 85 percent of the stated hours (decision 11) ...
const NEW_PERCENT = 70; // ... and new items take up to 70 percent of the hours; the other 15 percent is kept for due reviews (decision 37)
const MOCK_MINUTES = 90; // decision 38
const MOCK_FIRST_WEEK = 4;
const MOCK_MIN_DAY_HOURS = 2;
const SATURDAY = 5;
const BEHAVIORAL_MINUTES = 10;
const BEHAVIORAL_LAST_DAYS = 14; // behavioral questions in the last two weeks (bigtech goal)
const BEHAVIORAL_MIN_WEEKS = 4;
const MIN_PART_MINUTES = 30; // an item longer than a day is split; a part is never shorter than this unless it is the last one
const MIN_SPLIT_LEFT = 30; // an item that fits no gap is split over two days only if the rest of today is at least this long ...
const MIN_SPLIT_REST = 10; // ... and what remains for tomorrow is at least this long
const LOOKAHEAD = 40; // how far ahead the same topic is searched for a smaller item that fits the rest of a day (decision 30)
const NOTES_PER_TOPICS = 2; // one notes section after every two DSA topics (decision 40)
const MIXED_GROUP = 3; // the "mix from the start" style rotates over 3 neighbouring topics

const GOALS = ['placements', 'role', 'bigtech'];
const STYLES = ['one-topic', 'mixed'];
const DEFAULT_SUBJECTS = ['os', 'dbms', 'cn', 'oops', 'hld']; // the default order of CS subjects (decision 40); lld joins when it exists
const BIGTECH_SHEETS = ['neetcode-150', 'striver-sde'];

// ---------- dates ----------
const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const dayNumber = (ymd) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || '');
  if (!m) return NaN;
  const n = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / DAY_MS;
  return ymdOf(n) === ymd ? n : NaN; // refuses 2026-02-30
};
const ymdOf = (n) => new Date(n * DAY_MS).toISOString().slice(0, 10);
const weekdayOf = (n) => (new Date(n * DAY_MS).getUTCDay() + 6) % 7; // Monday = 0
const todayIst = (now = new Date()) => ymdOf(Math.floor((now.getTime() + IST_OFFSET_MS) / DAY_MS));

class PlanInputError extends Error {
  constructor(messages) {
    super(messages.join('; '));
    this.name = 'PlanInputError';
    this.messages = messages;
  }
}

// ---------- the day budget (decisions 11 and 37) ----------
const dayBudget = (hours) => ({ planned: Math.floor((hours * 60 * PLANNED_PERCENT) / 100), fresh: Math.floor((hours * 60 * NEW_PERCENT) / 100) }); // whole percents, so 3 hours is exactly 126 minutes

// A lighter stretch (exams, travel, illness): 1 to 14 days at fewer hours (decision 25). Whether it lies inside the plan is checked by the caller.
const lighterDaysErrors = (list) => {
  if (!Array.isArray(list)) return ['lighterDays must be a list'];
  const errors = [];
  const ranges = [];
  list.forEach((r, k) => {
    const from = dayNumber(r && r.from);
    const to = dayNumber(r && r.to);
    if (Number.isNaN(from) || Number.isNaN(to) || to < from) { errors.push(`lighterDays[${k}] needs real dates with from before or on to`); return; }
    if (to - from + 1 > 14) errors.push(`lighterDays[${k}] may last at most 14 days`);
    if (!(typeof r.hours === 'number' && (r.hours === 0 || (r.hours >= limits.PLAN_MIN_DAILY_HOURS && r.hours <= limits.PLAN_MAX_DAILY_HOURS)))) errors.push(`lighterDays[${k}] hours must be 0 or from ${limits.PLAN_MIN_DAILY_HOURS} to ${limits.PLAN_MAX_DAILY_HOURS}`);
    ranges.push([from, to]);
  });
  ranges.sort((a, b) => a[0] - b[0]);
  for (let k = 1; k < ranges.length; k += 1) if (ranges[k][0] <= ranges[k - 1][1]) errors.push('lighterDays must not overlap');
  return errors;
};

const validateInput = (input, data) => {
  const errors = [];
  const i = input || {};
  if (!GOALS.includes(i.goalType)) errors.push(`goalType must be one of ${GOALS.join(', ')}`);
  if (!STYLES.includes(i.style)) errors.push(`style must be one of ${STYLES.join(', ')}`);
  if (Number.isNaN(dayNumber(i.startDate))) errors.push('startDate must be a real date like 2026-11-13');
  if (!Number.isInteger(i.weeks) || i.weeks < limits.PLAN_MIN_WEEKS || i.weeks > limits.PLAN_MAX_WEEKS) errors.push(`weeks must be a whole number from ${limits.PLAN_MIN_WEEKS} to ${limits.PLAN_MAX_WEEKS}`);
  const hours = i.hoursByWeekday;
  const hoursOk = Array.isArray(hours) && hours.length === 7 && hours.every((h) => typeof h === 'number' && h >= 0 && h <= limits.PLAN_MAX_DAILY_HOURS && (h === 0 || h >= limits.PLAN_MIN_DAILY_HOURS));
  if (!hoursOk) errors.push(`hoursByWeekday must be 7 numbers (Monday to Sunday), each 0 or from ${limits.PLAN_MIN_DAILY_HOURS} to ${limits.PLAN_MAX_DAILY_HOURS}`);
  const rest = i.restDay ?? null;
  if (rest !== null && !(Number.isInteger(rest) && rest >= 0 && rest <= 6)) errors.push('restDay must be null or a weekday number from 0 (Monday) to 6 (Sunday)');
  if (hoursOk && rest !== undefined && (rest === null || Number.isInteger(rest))) {
    const study = hours.filter((h, d) => h > 0 && d !== rest).length;
    if (study < 1) errors.push('at least one day a week must have study hours');
  }
  if (i.goalType === 'placements' || i.goalType === 'bigtech') {
    if (!data.sheets[i.sheetSlug]) errors.push('sheetSlug must name one of the DSA sheets');
    else if (i.goalType === 'bigtech' && !BIGTECH_SHEETS.includes(i.sheetSlug)) errors.push(`the big-tech goal uses ${BIGTECH_SHEETS.join(' or ')}`);
  }
  if (i.goalType === 'role' && !data.roadmapCatalog.find((r) => r.slug === i.roadmapSlug)) errors.push('roadmapSlug must name one of the roadmaps');
  if (i.pace !== undefined && !Object.hasOwn(PACES, i.pace)) errors.push(`pace must be one of ${Object.keys(PACES).join(', ')}`);
  if (i.lighterDays !== undefined) errors.push(...lighterDaysErrors(i.lighterDays));
  if (i.subjects !== undefined && !(Array.isArray(i.subjects) && i.subjects.every((s) => data.notes[s]))) errors.push('subjects must be a list of notes subjects');
  return errors;
};

// ---------- content: items with their minutes (decision 29) ----------
const problemMinutes = (difficulty, pace = DEFAULT_PACE) => Math.round((MINUTES_BY_DIFFICULTY[difficulty] ?? MINUTES_BY_DIFFICULTY[FALLBACK_DIFFICULTY]) * PACES[pace]);
const notesMinutes = (readMinutes) => NOTES_READING_FACTOR * readMinutes + NOTES_QUIZ_MINUTES;
const orderedSubjects = (subjects, data) => DEFAULT_SUBJECTS.filter((s) => subjects.includes(s) && data.notes[s]).concat(subjects.filter((s) => !DEFAULT_SUBJECTS.includes(s) && data.notes[s]));

const notesUnit = (subject, section) => ({
  unitId: `notes:${subject}:${section.id}`, core: true,
  items: [{ type: 'notes', ref: `notes:${subject}:${section.id}`, title: section.title, plannedMinutes: notesMinutes(section.readMinutes), core: true, subject }],
});

const dsaItem = (sheetSlug, topic, problem, core, pace) => ({
  type: 'dsa', ref: `dsa:${sheetSlug}:${topic.id}`, link: problem.link, title: problem.title, difficulty: problem.difficulty || FALLBACK_DIFFICULTY,
  plannedMinutes: problemMinutes(problem.difficulty, pace), core, sheet: sheetSlug, topicId: topic.id, topicTitle: String(topic.title).trim(),
});

// The topics of a sheet in dependency order (the step of our DSA roadmap, then the sheet's own order), as units of items.
// Solved problems and "already know" topics are not scheduled; a problem listed in two topics is scheduled once (decision 32).
const dsaUnits = (sheetSlug, data, solved, known, seenLinks, pace) => {
  const catalog = data.planCatalog.sheets[sheetSlug];
  const topics = data.sheets[sheetSlug].topics.map((t, index) => ({ t, index, entry: catalog[t.id] }));
  const missing = topics.filter((x) => !x.entry).map((x) => x.t.id);
  if (missing.length) throw new Error(`planCatalog has no entry for ${sheetSlug}: ${missing.join(', ')}`);
  topics.sort((a, b) => a.entry.order - b.entry.order || a.index - b.index);
  const units = [];
  let alreadySolved = 0;
  const knownTopics = [];
  for (const { t, entry } of topics) {
    const items = [];
    for (const p of t.problems) {
      if (seenLinks.has(problemIdentity(p.link))) continue;
      seenLinks.add(problemIdentity(p.link));
      if (solved.has(problemIdentity(p.link))) { alreadySolved += 1; continue; }
      items.push(dsaItem(sheetSlug, t, p, entry.core, pace));
    }
    if (known.has(t.id)) { if (items.length) knownTopics.push({ topicId: t.id, title: String(t.title).trim(), problems: items.length }); continue; }
    if (items.length) units.push({ unitId: `topic:${sheetSlug}:${t.id}`, core: entry.core, items });
  }
  return { units, alreadySolved, knownTopics };
};

// Steps of a roadmap in order: the step's learning time (the middle of its range), its practice (notes and sheet topics), then its project.
const roadmapUnits = (input, data, solved, known, seenLinks, pace) => {
  const road = data.roadmapCatalog.find((r) => r.slug === input.roadmapSlug);
  const units = [];
  let alreadySolved = 0;
  const knownTopics = [];
  const seenNotes = new Set(); // a notes section linked from two steps is scheduled once, in the first
  for (const step of road.steps) {
    const items = [{ type: 'roadmap', ref: `roadmap:${road.slug}`, stepId: step.id, title: step.title, plannedMinutes: Math.round(((step.from + step.to) / 2) * 60), core: true }];
    for (const p of step.practice) {
      if (p.kind === 'notes') {
        const [subject, id] = p.target.split(':');
        const section = (data.notes[subject] || []).find((s) => s.id === id);
        if (section && !seenNotes.has(p.target)) { seenNotes.add(p.target); items.push(notesUnit(subject, section).items[0]); }
      } else if (p.kind === 'sheet') {
        const [sheetSlug, topicId] = p.target.split(':');
        const topic = data.sheets[sheetSlug]?.topics.find((t) => t.id === topicId);
        if (!topic) continue;
        if (known.has(topicId)) { knownTopics.push({ topicId, title: String(topic.title).trim() }); continue; }
        for (const prob of topic.problems) {
          if (seenLinks.has(problemIdentity(prob.link))) continue;
          seenLinks.add(problemIdentity(prob.link));
          if (solved.has(problemIdentity(prob.link))) { alreadySolved += 1; continue; }
          items.push(dsaItem(sheetSlug, topic, prob, true, pace));
        }
      }
    }
    items.push({ type: 'roadmap', ref: `project:${road.slug}:${step.id}`, stepId: step.id, title: `Project: ${step.title}`, plannedMinutes: ROADMAP_PROJECT_MINUTES, core: true });
    units.push({ unitId: `step:${road.slug}:${step.id}`, core: true, items });
  }
  return { units, alreadySolved, knownTopics };
};

// The order of the units: "one topic at a time" puts one notes section after every two DSA topics; "mix from the start" rotates over
// neighbouring topics and spreads the notes evenly. Items keep their unit id (the topic) so the day-filling can look for a smaller item of the same topic.
const sequenceItems = (dsa, notes, style) => {
  const tag = (u) => u.items.map((it) => ({ ...it, unitId: u.unitId }));
  const out = [];
  if (style === 'mixed') {
    for (let g = 0; g < dsa.length; g += MIXED_GROUP) {
      const group = dsa.slice(g, g + MIXED_GROUP).map(tag);
      for (let k = 0; group.some((list) => k < list.length); k += 1) for (const list of group) if (k < list.length) out.push(list[k]);
    }
    const length = out.length; // spread over the DSA items as they were before the notes went in
    notes.forEach((u, k) => out.splice(Math.floor(((k + 1) * length) / (notes.length + 1)) + k, 0, ...tag(u)));
    return out;
  }
  let n = 0;
  dsa.forEach((u, t) => {
    out.push(...tag(u));
    if ((t + 1) % NOTES_PER_TOPICS === 0 && n < notes.length) out.push(...tag(notes[n++]));
  });
  while (n < notes.length) out.push(...tag(notes[n++]));
  return out;
};

// ---------- the days ----------
const buildDays = (input, context) => {
  const start = dayNumber(input.startDate);
  const deadline = context.deadline ? dayNumber(context.deadline) : start + input.weeks * 7 - 1;
  const lighter = (input.lighterDays || []).map((r) => ({ from: dayNumber(r.from), to: dayNumber(r.to), hours: r.hours }));
  const rest = input.restDay ?? null;
  const days = [];
  for (let n = start; n <= deadline; n += 1) {
    const wd = weekdayOf(n);
    const light = lighter.find((r) => n >= r.from && n <= r.to);
    const hours = wd === rest ? 0 : light ? light.hours : input.hoursByWeekday[wd];
    days.push({ n, ymd: ymdOf(n), weekday: wd, hours, ...dayBudget(hours), reserved: [] });
  }
  return { days, start, deadline };
};
const weekIndex = (n, start) => Math.floor((n - weekdayOf(n) - (start - weekdayOf(start))) / 7) + 1; // week 1 is the Monday-to-Sunday week that holds the start date

// Dated items are kept first (decision 28): mock blocks from week 4 on Saturdays, behavioral questions in the last two weeks.
const datedItems = (input, days, start, deadline, data, mockDays, context) => {
  const reserved = new Map();
  const add = (d, item) => { if (!reserved.has(d.n)) reserved.set(d.n, []); reserved.get(d.n).push(item); };
  if (input.goalType !== 'role') {
    for (const d of days) {
      if (d.weekday === SATURDAY && d.hours >= MOCK_MIN_DAY_HOURS && weekIndex(d.n, start) >= MOCK_FIRST_WEEK && mockDays.has(d.n)) {
        add(d, { type: 'mock', ref: `mock:${weekIndex(d.n, start)}`, title: 'Mock interview: two problems you have not solved, timed', plannedMinutes: MOCK_MINUTES, core: true });
      }
    }
  }
  if (input.goalType === 'bigtech' && (context.planWeeks ?? input.weeks) >= BEHAVIORAL_MIN_WEEKS) {
    const doneIds = context.behavioralDone || new Set();
    const pool = (data.behavioral || []).filter((q) => !doneIds.has(q.id));
    const questions = pool.length ? pool : data.behavioral || [];
    const ids = questions.map((q) => q.id);
    let k = 0;
    for (const d of days) {
      if (d.n <= deadline - BEHAVIORAL_LAST_DAYS || d.hours === 0 || !ids.length) continue;
      const q = questions[k % ids.length];
      add(d, { type: 'behavioral', ref: `behavioral:${q.id}`, title: q.question, plannedMinutes: BEHAVIORAL_MINUTES, core: true });
      k += 1;
    }
  }
  return reserved;
};

// ---------- filling the days (decisions 30 and 37) ----------
// The minutes of new work each day can take (decision 37), after dated items, kept items and an overdue review backlog.
const dayCaps = (days, reserved, context) => {
  let backlog = context.backlogMinutes || 0; // overdue review minutes: while they are more than one day's review room, no new item is added
  const keptMinutes = context.keptMinutes || new Map(); // minutes already taken on a day by items a rebuild keeps (done, locked, added by the student)
  return days.map((d) => {
    const dated = (reserved.get(d.n) || []).reduce((s, it) => s + it.plannedMinutes, 0);
    const kept = keptMinutes.get(d.n) || 0;
    const reviewRoom = d.planned - d.fresh;
    const blocked = backlog > reviewRoom;
    backlog -= Math.min(backlog, reviewRoom);
    return blocked ? 0 : Math.max(0, Math.min(d.fresh - kept, d.planned - dated - kept));
  });
};

// keepPartial: when the days end inside a long item, keep the parts already placed and report the rest as left over
// (a roadmap step can be longer than the whole plan; dropping it would leave an empty plan while time is free).
const fillDays = (sequence, days, reserved, context, keepPartial = false) => {
  const caps = dayCaps(days, reserved, context);
  const used = new Array(sequence.length).fill(false);
  const placed = [];
  let head = 0;
  let carry = null; // an item longer than a day, being placed part by part
  const place = (item, d, minutes, part) => placed.push({ ...item, plannedMinutes: minutes, day: d.ymd, part });
  for (let di = 0; di < days.length; di += 1) {
    let left = caps[di];
    if (left <= 0) continue;
    if (carry) {
      const m = Math.min(carry.remaining, left);
      place(carry.item, days[di], m, { n: ++carry.n, of: 0 });
      carry.parts.push(placed.length - 1);
      carry.remaining -= m; left -= m;
      if (carry.remaining === 0) { for (const idx of carry.parts) placed[idx].part.of = carry.n; carry = null; } else continue;
    }
    const startSplit = (item) => {
      carry = { item, remaining: item.plannedMinutes, n: 1, parts: [] };
      const m = Math.min(carry.remaining, left);
      place(item, days[di], m, { n: 1, of: 0 });
      carry.parts.push(placed.length - 1); carry.remaining -= m; left -= m;
    };
    while (left > 0) {
      while (head < sequence.length && used[head]) head += 1;
      if (head >= sequence.length) break;
      const item = sequence[head];
      if (item.plannedMinutes <= left) { place(item, days[di], item.plannedMinutes, null); used[head] = true; left -= item.plannedMinutes; continue; }
      if (item.plannedMinutes > caps[di]) { // longer than a whole day: split it, starting now unless the rest of today is too small to be worth a part
        const partMin = caps[di] < MIN_SPLIT_LEFT ? Math.max(5, Math.floor(caps[di] / 2)) : MIN_PART_MINUTES; // a day of less than 30 minutes of room scales the minimum down
        if (left < partMin && left < caps[di]) break;
        used[head] = true; startSplit(item); break;
      }
      // does not fit the rest of the day: a smaller item of the same topic that does, else the next one that does (decision 30)
      let found = -1;
      let near = -1;
      for (let k = head + 1, seen = 0; k < sequence.length && seen < LOOKAHEAD; k += 1) {
        if (used[k]) continue;
        seen += 1;
        if (sequence[k].plannedMinutes > left) continue;
        if (sequence[k].unitId === item.unitId) { found = k; break; }
        if (near < 0) near = k;
      }
      if (found < 0) found = near;
      if (found >= 0) { place(sequence[found], days[di], sequence[found].plannedMinutes, null); used[found] = true; left -= sequence[found].plannedMinutes; continue; }
      // nothing fits: split the item over two days when both parts are worth having, so the day is not left half empty.
      // A day of less than 30 minutes of room (a 30 minute study day) could never meet these minimums, so for such a day they are scaled down.
      const tiny = caps[di] < MIN_SPLIT_LEFT;
      const splitLeft = tiny ? Math.max(5, Math.floor(caps[di] / 2)) : MIN_SPLIT_LEFT;
      const splitRest = tiny ? 3 : MIN_SPLIT_REST;
      if (left >= splitLeft && item.plannedMinutes - left >= splitRest) { used[head] = true; startSplit(item); }
      break;
    }
  }
  const leftover = [];
  if (carry && keepPartial) {
    for (const idx of carry.parts) placed[idx].part.of = carry.n + 1; // "part n of n+1": the last part is the unscheduled rest
    leftover.push({ ...carry.item, plannedMinutes: carry.remaining, partial: true });
  } else if (carry) { // ran out of days in the middle of a split: undo the parts and treat the whole item as left over
    const drop = new Set(carry.parts);
    for (let k = placed.length - 1; k >= 0; k -= 1) if (drop.has(k)) placed.splice(k, 1);
    leftover.push(carry.item);
  }
  sequence.forEach((it, k) => { if (!used[k]) leftover.push(it); });
  return { placed, leftover };
};

const sumMinutes = (items) => items.reduce((s, it) => s + it.plannedMinutes, 0);
// The identity of an item whatever its day or part: its ref plus its problem link (or its roadmap step).
const baseId = (it) => [it.ref, it.link ? problemIdentity(it.link) : it.stepId || ''].join('|');

// ---------- choosing what fits: a fair share for every topic and subject (phase B of docs/plans/MY_PLAN_COVERAGE_PLAN.md) ----------
// When the content is more than the days can hold, the old rule cut the tail of the list, so whole topics and subjects vanished.
// Now: every DSA topic group and every chosen CS subject keeps a floor (1 problem, 3 sections); the rest of the time is shared so that each
// group keeps about the same part of its own content, core topics and subjects first and extra (non-core) topics with what is left.
// Inside a group Hard problems are trimmed first, then the last ones. The order of the list (dependency order, notes between topics) is never changed.
// "Arrays - I", "Arrays - II" and so on are one group, as on the screens (the label is the topic title without its Roman numeral)
const groupKey = (it) => (it.type === 'notes' ? `notes:${it.subject}` : `dsa:${it.sheet}:${String(it.topicTitle || it.unitId).replace(/ - [IVX]+$/, '')}`);
const selectForCapacity = (sequence, capacity, keep) => {
  if (sumMinutes(sequence) <= capacity) return { chosen: sequence, dropped: [], trimmed: [], spread: false };
  const groups = new Map(); // first appearance order = the order of the list
  for (const it of sequence) { const k = groupKey(it); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); }
  const picked = new Set();
  let left = capacity;
  const take = (g, it) => { picked.add(it); left -= it.plannedMinutes; g.got += it.plannedMinutes; };
  const state = [...groups.entries()].map(([key, items]) => {
    const notes = items[0].type === 'notes';
    const floor = notes ? items.slice(0, FLOOR_SECTIONS) : [items.find((it) => it.difficulty !== 'Hard') || items[0]].slice(0, FLOOR_PROBLEMS);
    const keepOrder = notes ? items : [...items.filter((it) => it.difficulty !== 'Hard'), ...items.filter((it) => it.difficulty === 'Hard')];
    return { key, notes, core: items.some((it) => it.core), items, floor, keepOrder, total: sumMinutes(items), got: 0, cursor: 0 };
  });
  // a part-done item of a rebuild always stays
  for (const g of state) for (const it of g.items) if (keep.has(baseId(it)) && !picked.has(it)) take(g, it);
  // floors: core topic groups, then extra topic groups, then the subjects, each in list order; a floor that does not fit is kept as far as it goes
  const order = [...state.filter((g) => !g.notes && g.core), ...state.filter((g) => !g.notes && !g.core), ...state.filter((g) => g.notes)];
  for (const g of order) for (const it of g.floor) if (!picked.has(it) && it.plannedMinutes <= left) take(g, it);
  // the rest: always give the next item to the group that has the smallest part of its own content so far; core groups and subjects first, extras with what is left
  const share = (pool) => {
    for (;;) {
      let best = null;
      for (const g of pool) {
        while (g.cursor < g.keepOrder.length && picked.has(g.keepOrder[g.cursor])) g.cursor += 1; // the first item not taken yet
        let next = null;
        for (let k = g.cursor; k < g.keepOrder.length; k += 1) { const it = g.keepOrder[k]; if (!picked.has(it) && it.plannedMinutes <= left) { next = it; break; } }
        if (!next) continue;
        if (!best || g.got / g.total < best.g.got / best.g.total) best = { g, next };
      }
      if (!best) return;
      take(best.g, best.next);
    }
  };
  share(state.filter((g) => g.core));
  share(state.filter((g) => !g.core));
  const rest = sequence.filter((it) => !picked.has(it));
  return { chosen: sequence.filter((it) => picked.has(it)), dropped: rest.filter((it) => !it.core), trimmed: rest.filter((it) => it.core), spread: true };
};

// The coverage of every DSA topic group and chosen subject: what was asked for, what the plan holds. "Arrays - I" and "Arrays - II" count as one group.
const groupLabel = (it) => (it.type === 'notes' ? SUBJECT_LABELS[it.subject] || it.subject : String(it.topicTitle || '').replace(/ - [IVX]+$/, ''));
const coverageByGroup = (content, placed) => {
  const map = new Map();
  const kind = (it) => (it.type === 'notes' ? 'notes' : 'dsa');
  for (const it of content) {
    if (it.type !== 'notes' && it.type !== 'dsa') continue;
    const key = kind(it) + ':' + groupLabel(it);
    if (!map.has(key)) map.set(key, { label: groupLabel(it), kind: kind(it), total: 0, placed: 0, minutes: 0, placedMinutes: 0 });
    const g = map.get(key);
    g.total += 1; g.minutes += it.plannedMinutes;
  }
  const seen = new Set();
  for (const it of placed) {
    if (it.type !== 'notes' && it.type !== 'dsa') continue;
    const id = baseId(it);
    const g = map.get(kind(it) + ':' + groupLabel(it));
    if (!g) continue;
    g.placedMinutes += it.plannedMinutes;
    if (!seen.has(id)) { seen.add(id); g.placed += 1; }
  }
  return [...map.values()].map((g) => ({ ...g, state: g.placed === 0 ? 'none' : g.placed >= g.total ? 'all' : 'part' }));
};

// ---------- the plan ----------
const generatePlan = (input, data, context = {}) => {
  const errors = validateInput(input, data);
  if (errors.length) throw new PlanInputError(errors);

  const solved = new Set((input.solvedLinks || []).map(problemIdentity));
  const known = new Set(input.knownTopics || []);
  const seenLinks = new Set();
  const subjects = orderedSubjects(input.subjects || (input.goalType === 'role' ? [] : DEFAULT_SUBJECTS), data);
  const { days, start, deadline } = buildDays(input, context);
  const pace = input.pace || DEFAULT_PACE;
  const origin = context.weekOrigin ? dayNumber(context.weekOrigin) : start; // week numbers (for the mock blocks) count from the plan's own first day

  let units, alreadySolved = 0, knownTopics = [];
  if (input.goalType === 'role') {
    ({ units, alreadySolved, knownTopics } = roadmapUnits(input, data, solved, known, seenLinks, pace));
  } else {
    const dsa = dsaUnits(input.sheetSlug, data, solved, known, seenLinks, pace);
    ({ alreadySolved, knownTopics } = dsa);
    const notes = subjects.flatMap((s) => data.notes[s].map((section) => notesUnit(s, section)));
    units = sequenceItems(dsa.units, notes, input.style);
  }
  const allContent = input.goalType === 'role' ? units.flatMap((u) => u.items.map((it) => ({ ...it, unitId: u.unitId }))) : units;
  // a rebuild leaves out what is done, skipped, locked or added by the student, and plans only what is left of a part-done item
  const exclude = context.exclude || new Set();
  const remaining = context.remaining || new Map();
  const content = allContent.filter((it) => !exclude.has(baseId(it))).map((it) => (remaining.has(baseId(it)) ? { ...it, plannedMinutes: remaining.get(baseId(it)) } : it));
  const syllabusMinutes = sumMinutes(content);

  // find the plan: choose what fits (a fair share, see selectForCapacity), fill the days, and drop mock blocks that have no unsolved core problem after them.
  // Packing is never perfect, so when something is left over after filling, the capacity is lowered a little and the choice is made again.
  // A roadmap ("role") plan keeps the older rule: drop the last "extra" topic while things do not fit.
  const keep = new Set([...remaining.keys()]);
  let sequence = content.slice();
  let dropped = [];
  let trimmed = [];
  let spread = false;
  let shrink = 0;
  let mockDays = new Set(days.filter((d) => d.weekday === SATURDAY).map((d) => d.n));
  let result;
  for (let guard = 0; guard < 2000; guard += 1) {
    const reserved = content.length ? datedItems(input, days, origin, deadline, data, mockDays, context) : new Map(); // mock blocks and questions mean nothing without content
    if (input.goalType !== 'role') {
      const capacity = Math.max(0, dayCaps(days, reserved, context).reduce((s, c) => s + c, 0) - shrink);
      ({ chosen: sequence, dropped, trimmed, spread } = selectForCapacity(content, capacity, keep));
    }
    result = fillDays(sequence, days, reserved, context, input.goalType === 'role');
    result.reserved = reserved;
    const useless = [...mockDays].filter((n) => reserved.has(n) && reserved.get(n).some((it) => it.type === 'mock') && result.placed.filter((p) => p.type === 'dsa' && p.core && dayNumber(p.day) > n).length < 2);
    if (useless.length) { for (const n of useless) mockDays.delete(n); continue; }
    if (result.leftover.length) {
      if (input.goalType !== 'role') { shrink += Math.max(10, Math.floor(sumMinutes(result.leftover) / 2)); continue; } // lower the capacity a little and choose again
      const extras = [...new Set(sequence.filter((it) => !it.core).map((it) => it.unitId))];
      if (extras.length) {
        const last = extras[extras.length - 1];
        dropped.push(...sequence.filter((it) => it.unitId === last && !it.core));
        sequence = sequence.filter((it) => it.unitId !== last || it.core);
        continue;
      }
    }
    break;
  }

  const items = [];
  for (const d of days) {
    const datedHere = (result.reserved.get(d.n) || []).map((it) => ({ ...it, day: d.ymd, part: null }));
    const here = result.placed.filter((p) => p.day === d.ymd);
    items.push(...[...here, ...datedHere]);
  }
  let counter = 0;
  const offsets = context.partOffset || new Map();
  const numbered = items.map((it) => { const k = offsets.get(baseId(it)); return k ? { ...it, part: it.part ? { n: it.part.n + k, of: it.part.of + k } : { n: k + 1, of: k + 1 } } : it; });
  const finalItems = numbered.map((it) => ({ ...it, key: `${baseId(it)}|${it.part ? it.part.n : 0}`, source: 'planner', plannedDay: it.day, order: counter++ }));
  const content2 = finalItems.filter((it) => it.type !== 'mock' && it.type !== 'behavioral');
  const placedMinutes = sumMinutes(content2);
  const leftOut = [
    ...dropped.map((it) => ({ ref: it.ref, link: it.link || null, title: it.title, plannedMinutes: it.plannedMinutes, core: false, reason: 'extra', topicTitle: it.topicTitle || null })),
    ...[...trimmed, ...result.leftover].map((it) => ({
      ref: it.ref, link: it.link || null, title: it.title, plannedMinutes: it.plannedMinutes, core: it.core, reason: 'no-room', topicTitle: it.topicTitle || null,
      ...(it.stepId ? { stepId: it.stepId } : {}), ...(it.partial ? { partial: true } : {}),
    })),
  ];
  const lastDay = content2.reduce((m, it) => Math.max(m, dayNumber(it.day)), -1);
  const finishDate = lastDay >= 0 ? ymdOf(lastDay) : null;
  const earlyDays = lastDay >= 0 ? deadline - lastDay : days.length;

  const notices = ['planned-85'];
  if (dropped.length) notices.push('core-first');
  if (trimmed.length || result.leftover.length) notices.push('core-does-not-fit');
  if (spread) notices.push('spread');
  if (!content.length) notices.push('nothing-to-plan');
  if (content.length && !content2.length) notices.push('nothing-fits'); // there is content, but not one task fits these days and hours
  if (!trimmed.length && !result.leftover.length && earlyDays >= 7) notices.push('early-finish');

  // each day sorted shortest first (decision 27), dated items at the end of their day
  const byDay = new Map();
  for (const it of finalItems) { if (!byDay.has(it.day)) byDay.set(it.day, []); byDay.get(it.day).push(it); }
  const sorted = [];
  for (const d of days) {
    const list = byDay.get(d.ymd) || [];
    list.sort((a, b) => ((a.type === 'mock' || a.type === 'behavioral') - (b.type === 'mock' || b.type === 'behavioral')) || a.plannedMinutes - b.plannedMinutes || a.order - b.order);
    sorted.push(...list);
  }

  return {
    input: { lighterDays: input.lighterDays || [], goalType: input.goalType, style: input.style, startDate: input.startDate, weeks: input.weeks, hoursByWeekday: input.hoursByWeekday, restDay: input.restDay ?? null, sheetSlug: input.sheetSlug || null, roadmapSlug: input.roadmapSlug || null, subjects, knownTopics: input.knownTopics || [], solvedLinks: input.solvedLinks || [], pace },
    startDate: input.startDate,
    deadline: ymdOf(deadline),
    finishDate,
    earlyDays,
    items: sorted,
    days: days.map((d) => {
      const list = byDay.get(d.ymd) || [];
      return { date: d.ymd, weekday: d.weekday, hours: d.hours, plannedCap: d.planned, newCap: d.fresh, minutes: sumMinutes(list), items: list.length };
    }),
    coverage: {
      syllabusMinutes, plannedMinutes: placedMinutes, extraMinutes: sumMinutes(finalItems) - placedMinutes,
      syllabusItems: content.length, plannedItems: new Set(content2.map(baseId)).size, alreadySolved, knownTopics, leftOut,
      byGroup: coverageByGroup(content, finalItems),
    },
    notices,
  };
};

// ---------- weeks (Monday to Sunday) ----------
const groupByWeek = (plan) => {
  const start = dayNumber(plan.startDate);
  const weeks = new Map();
  for (const it of plan.items) {
    const w = weekIndex(dayNumber(it.day), start);
    if (!weeks.has(w)) weeks.set(w, { week: w, from: ymdOf(dayNumber(it.day) - weekdayOf(dayNumber(it.day))), items: [] });
    weeks.get(w).items.push(it);
  }
  return [...weeks.values()].sort((a, b) => a.week - b.week).map((w) => ({ ...w, to: ymdOf(dayNumber(w.from) + 6), minutes: sumMinutes(w.items) }));
};

// ---------- "on track" (decision 15 and plan step 9) ----------
// Planned minutes before today against the minutes of everything done. Days behind = the gap divided by an average study day, rounded down.
const isComplete = (it) => !!(it.doneAt || it.solvedOnSheet);
const onTrack = (items, todayYmd) => {
  const today = dayNumber(todayYmd);
  const live = items.filter((it) => !it.skipped);
  const before = live.filter((it) => dayNumber(it.day) < today);
  const plannedBefore = sumMinutes(before);
  const done = sumMinutes(live.filter(isComplete));
  const behindMinutes = Math.max(0, plannedBefore - done);
  const studyDays = new Set(live.map((it) => it.day)).size;
  const avgDay = studyDays ? sumMinutes(live) / studyDays : 0;
  const daysBehind = avgDay > 0 ? Math.floor(behindMinutes / avgDay) : 0;
  const missedItems = before.filter((it) => !isComplete(it)).length;
  const suggestRebuild = daysBehind >= 2 || missedItems >= 3;
  return { status: daysBehind > 0 ? 'behind' : 'on-track', daysBehind, behindMinutes, missedItems, suggestRebuild, text: daysBehind > 0 ? `${daysBehind} day${daysBehind === 1 ? '' : 's'} behind` : 'On track' };
};

// ---------- what a logged-out visitor may see (decision 9): the numbers and week 1 only ----------
// When would everything be done at these hours? Plan the same request over the longest plan allowed: with room for all of it,
// the days are filled in order, so the last task's day is the finish. Only needed when the real plan leaves something out.
const finishEverything = (input, plan, data) => {
  if (!plan.coverage.leftOut.length || plan.notices.includes('nothing-fits')) return null;
  const long = generatePlan({ ...input, weeks: limits.PLAN_MAX_WEEKS }, data);
  if (long.coverage.leftOut.length || !long.finishDate) return { tooLong: true };
  const days = dayNumber(long.finishDate) - dayNumber(plan.startDate) + 1;
  return { date: long.finishDate, weeks: Math.ceil(days / 7) };
};

const previewPlan = (input, data) => {
  const plan = generatePlan(input, data);
  const week1 = groupByWeek(plan)[0] || { // the first calendar week with tasks: a start on the rest day must not show an empty week
    week: 1, from: plan.startDate, to: plan.startDate, items: [], minutes: 0 };
  return {
    startDate: plan.startDate, deadline: plan.deadline, finishDate: plan.finishDate, earlyDays: plan.earlyDays, notices: plan.notices,
    pace: plan.input.pace,
    coverage: { syllabusMinutes: plan.coverage.syllabusMinutes, plannedMinutes: plan.coverage.plannedMinutes, extraMinutes: plan.coverage.extraMinutes, leftOutCount: plan.coverage.leftOut.length, leftOutMinutes: sumMinutes(plan.coverage.leftOut), alreadySolved: plan.coverage.alreadySolved, byGroup: plan.coverage.byGroup, finishAll: finishEverything(input, plan, data) },
    week1,
  };
};

module.exports = {
  generatePlan, previewPlan, groupByWeek, onTrack, isComplete, validateInput, lighterDaysErrors, baseId, dayBudget, todayIst, dayNumber, ymdOf, weekdayOf, PlanInputError,
  MINUTES_BY_DIFFICULTY, PACES, DEFAULT_PACE, FLOOR_SECTIONS, FLOOR_PROBLEMS, MOCK_MINUTES, BEHAVIORAL_MINUTES, GOALS, STYLES, DEFAULT_SUBJECTS, notesMinutes, problemMinutes,
};