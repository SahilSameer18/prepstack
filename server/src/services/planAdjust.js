// What happens to a plan after it exists ("My plan", Phase 2): a pure module on plain item lists, like the generator.
//   the review ladder (decisions 21 and 22): a result when an item is ticked, due reviews, a daily cap, the backlog rule
//   skip and move (decisions 23 and 26): a skipped list with a warning, a move of at most 3 days that locks the item
//   carried over (decision 24) and the calm "Today" list (decisions 7, 27 and 33)
//   changes with a preview (decisions 16, 25 and 42): rebuild from today, new hours or lighter days, returned with a diff and a checksum
// An item is what the generator makes ({ key, type, ref, title, plannedMinutes, day, part, source, core, ... }) plus what the student does to it:
// doneAt, result, starred, locked, skipped, and the ladder fields (reviewStage, reviewBaseDay, nextReviewDay, reviewLadder, lastFailedDay, quizScore).
// A stored plan is { input, startDate, deadline, items }, where input is the generator's input.
const crypto = require('crypto');
const gen = require('./planGenerator');

const { dayNumber, ymdOf, baseId, dayBudget } = gen;

// Days after the first solve (or after a failed review) at which an item comes back (decision 21). The gaps are our design, not a measured result.
const LADDERS = { alone: [7, 30], hints: [3, 14, 45], solution: [1, 4, 14, 45], notes: [3, 10, 30] };
const RESULTS = ['alone', 'hints', 'solution'];
const REVIEW_MINUTES = 3;
const QUIZ_PASS = 4; // a notes quiz of 4 questions out of 5 or more is a pass
const MAX_MOVE_DAYS = 3;
const CONTENT_TYPES = ['dsa', 'notes', 'roadmap'];
const SKIP_WARNING_TOPICS = 5;

const sum = (items) => items.reduce((s, it) => s + it.plannedMinutes, 0);
const addDays = (ymd, n) => ymdOf(dayNumber(ymd) + n);
const isReviewable = (it) => it.type === 'dsa' || it.type === 'notes';
const byKey = (items, key) => items.findIndex((it) => it.key === key);

// ---------- hours of a day, and the room for reviews (15 percent: 85 percent planned minus 70 percent for new items) ----------
const hoursOn = (input, ymd) => {
  const n = dayNumber(ymd);
  const wd = gen.weekdayOf(n);
  if (wd === (input.restDay ?? null)) return 0;
  const light = (input.lighterDays || []).find((r) => n >= dayNumber(r.from) && n <= dayNumber(r.to));
  return light ? light.hours : input.hoursByWeekday[wd];
};
const reviewRoom = (hours) => { const b = dayBudget(hours); return b.planned - b.fresh; };

// ---------- the review ladder ----------
// Ticking an item records how it went. A split item starts its ladder only when its last part is ticked.
const markDone = (items, key, info) => {
  const at = byKey(items, key);
  if (at < 0) return { error: 'not-found', items };
  const item = items[at];
  if (item.doneAt) return { error: 'already-done', items };
  if (item.skipped) return { error: 'skipped', items };
  const next = items.map((it) => ({ ...it }));
  next[at] = { ...item, doneAt: info.doneAt };
  const parts = next.filter((it) => baseId(it) === baseId(item));
  if (parts.some((p) => !p.doneAt)) return { items: next, started: false };
  if (!isReviewable(item)) return { items: next, started: false };
  let name;
  if (item.type === 'notes') {
    name = 'notes';
    if (info.quizScore !== undefined && !(Number.isInteger(info.quizScore) && info.quizScore >= 0 && info.quizScore <= 5)) return { error: 'bad-quiz-score', items };
  } else {
    if (!RESULTS.includes(info.result)) return { error: 'result-required', items };
    name = info.result;
  }
  next[at] = { ...next[at], result: item.type === 'notes' ? null : info.result, quizScore: item.type === 'notes' ? (info.quizScore ?? null) : null, reviewLadder: name, reviewStage: 0, reviewBaseDay: info.doneDay, nextReviewDay: addDays(info.doneDay, LADDERS[name][0]), lastFailedDay: null };
  return { items: next, started: true };
};

// A passed review moves to the next gap (and the item is retired after the last one); a failed review goes back to the first gap, counted from today.
const recordReview = (items, key, passed, day) => {
  const at = byKey(items, key);
  if (at < 0) return { error: 'not-found', items };
  const item = items[at];
  if (!item.reviewLadder || item.nextReviewDay == null) return { error: 'no-review-due', items };
  const ladder = LADDERS[item.reviewLadder];
  let changes;
  if (passed) {
    const stage = item.reviewStage + 1;
    changes = stage >= ladder.length ? { reviewStage: null, nextReviewDay: null } : { reviewStage: stage, nextReviewDay: addDays(item.reviewBaseDay, ladder[stage]) };
  } else {
    changes = { reviewStage: 0, reviewBaseDay: day, nextReviewDay: addDays(day, ladder[0]), lastFailedDay: day };
  }
  const next = items.slice();
  next[at] = { ...item, ...changes };
  return { items: next, retired: changes.nextReviewDay == null, offerRecode: !passed && item.type === 'dsa' };
};

const reviewView = (it, day) => ({
  type: 'review', ref: it.ref, link: it.link || null, title: `Review: ${it.title}`, plannedMinutes: REVIEW_MINUTES, originalKey: it.key,
  dueDay: it.nextReviewDay, overdueDays: dayNumber(day) - dayNumber(it.nextReviewDay), failed: !!it.lastFailedDay && it.reviewStage === 0 && it.reviewBaseDay === it.lastFailedDay, starred: !!it.starred,
});
// Everything due on or before a day: failed first, then starred, then the oldest (decision 22).
const dueReviews = (items, day) => items
  .filter((it) => it.nextReviewDay && it.nextReviewDay <= day && !it.skipped)
  .map((it) => reviewView(it, day))
  .sort((a, b) => (b.failed - a.failed) || (b.starred - a.starred) || a.dueDay.localeCompare(b.dueDay) || a.originalKey.localeCompare(b.originalKey));

// The reviews that fit a day's room; the rest wait (they are never deleted).
const reviewsForDay = (items, day, roomMinutes) => {
  const due = dueReviews(items, day);
  const shown = [];
  let left = roomMinutes;
  for (const r of due) { if (r.plannedMinutes > left) break; shown.push(r); left -= r.plannedMinutes; }
  return { shown, waiting: due.slice(shown.length), minutes: sum(shown) };
};

// Overdue and due reviews, and whether they are more than one day's room: then no new item is added (decisions 22 and 42).
const reviewBacklog = (items, day, roomMinutes) => {
  const due = dueReviews(items, day);
  return { count: due.length, minutes: sum(due), blocked: sum(due) > roomMinutes };
};

// The starred items (decision 18): the revision list.
const revisionList = (items) => items.filter((it) => it.starred && !it.skipped);

// ---------- carried over, skip, move ----------
const carriedOver = (items, today) => items
  .filter((it) => it.source === 'planner' && !it.doneAt && !it.skipped && it.day < today && it.type !== 'mock' && it.type !== 'behavioral')
  .sort((a, b) => a.day.localeCompare(b.day) || (a.order ?? 0) - (b.order ?? 0));

// Skip puts the item (all its parts) on the skipped list and warns when later topics build on it, in our dependency order.
const skipItem = (items, key, data) => {
  const at = byKey(items, key);
  if (at < 0) return { error: 'not-found', items };
  const item = items[at];
  if (item.doneAt) return { error: 'already-done', items };
  const id = baseId(item);
  const next = items.map((it) => (baseId(it) === id ? { ...it, skipped: true } : it));
  let warning = null;
  const entry = item.type === 'dsa' ? data.planCatalog.sheets[item.sheet]?.[item.topicId] : null;
  if (entry) {
    const later = new Map();
    for (const it of next) {
      if (it.type !== 'dsa' || it.skipped || it.doneAt || it.sheet !== item.sheet) continue;
      const e = data.planCatalog.sheets[it.sheet]?.[it.topicId];
      if (e && e.order > entry.order) later.set(it.topicId, it.topicTitle);
    }
    if (later.size) warning = { laterTopics: [...later.values()].slice(0, SKIP_WARNING_TOPICS), count: later.size };
  }
  return { items: next, warning };
};
const unskipItem = (items, key) => {
  const at = byKey(items, key);
  if (at < 0) return { error: 'not-found', items };
  const id = baseId(items[at]);
  return { items: items.map((it) => (baseId(it) === id ? { ...it, skipped: false } : it)) };
};

// Move changes the day by at most 3 days from where the planner put it, never onto a mock day or a day with no hours, and locks the item.
const moveItem = (stored, key, newDay) => {
  const items = stored.items;
  const at = byKey(items, key);
  if (at < 0) return { error: 'not-found', items };
  const item = items[at];
  if (item.doneAt) return { error: 'already-done', items };
  if (item.skipped) return { error: 'skipped', items };
  if (item.type === 'mock' || item.type === 'behavioral') return { error: 'dated-item', items };
  const target = dayNumber(newDay);
  if (Number.isNaN(target) || target < dayNumber(stored.startDate) || target > dayNumber(stored.deadline)) return { error: 'outside-plan', items };
  const planned = item.plannedDay ?? item.day;
  if (Math.abs(target - dayNumber(planned)) > MAX_MOVE_DAYS) return { error: 'too-far', items };
  if (hoursOn(stored.input, newDay) <= 0) return { error: 'no-hours', items };
  if (items.some((it) => it.day === newDay && it.type === 'mock')) return { error: 'mock-day', items };
  const next = items.slice();
  next[at] = { ...item, day: newDay, plannedDay: planned, locked: true };
  return { items: next };
};

// ---------- the calm Today list (decisions 7, 24, 27, 33) ----------
// What the student has to do today, the time it needs, and the item the Start button opens (the smallest first). Nothing else.
const todayView = (stored, today) => {
  const live = stored.items.filter((it) => !it.skipped);
  const open = live.filter((it) => !it.doneAt);
  let date = today;
  let todays = open.filter((it) => it.day === today);
  if (!todays.length) {
    const later = open.filter((it) => it.day > today).map((it) => it.day).sort()[0];
    if (later) { date = later; todays = open.filter((it) => it.day === later); }
  }
  const isToday = date === today;
  const carried = isToday ? carriedOver(live, today) : [];
  const room = isToday ? reviewRoom(hoursOn(stored.input, today)) : 0;
  const reviews = isToday ? reviewsForDay(live, today, room).shown : [];
  const ids = new Set(carried.map((c) => c.key));
  const list = [...carried, ...todays.filter((it) => !ids.has(it.key)), ...reviews];
  const start = [...list].sort((a, b) => a.plannedMinutes - b.plannedMinutes)[0] || null;
  return { date, isToday, items: list, minutes: sum(list), startItem: start, onTrack: gen.onTrack(live, today) };
};

// ---------- changes with a preview (decisions 16, 25, 42) ----------
const itemsChecksum = (items) => crypto.createHash('sha256').update(JSON.stringify(items.map((it) => [it.key, it.day, it.plannedMinutes, !!it.doneAt, !!it.skipped, !!it.locked]))).digest('hex').slice(0, 16);
const isPlannedContent = (it) => it.source === 'planner' && CONTENT_TYPES.includes(it.type);
const lastDay = (items) => items.reduce((m, it) => (it.day > m ? it.day : m), '');
const firstDayById = (items) => { const m = new Map(); for (const it of items) { const id = baseId(it); if (!m.has(id) || it.day < m.get(id)) m.set(id, it.day); } return m; };

// change: { type: 'rebuild' } | { type: 'hours', hoursByWeekday, restDay? } | { type: 'lighter', lighterDays }; any of them may carry solvedLinks (what the
// sheet now says is solved). Returns the new plan and a diff; nothing is saved. The caller applies it only if the diff's checksum still matches.
const previewChange = (stored, data, todayYmd, change) => {
  const t = Math.max(dayNumber(todayYmd), dayNumber(stored.startDate));
  const deadline = dayNumber(stored.deadline);
  if (t > deadline) return { error: 'finished' };
  const today = ymdOf(t);

  const input = { ...stored.input };
  if (change.type === 'hours') {
    input.hoursByWeekday = change.hoursByWeekday;
    if (change.restDay !== undefined) input.restDay = change.restDay;
  } else if (change.type === 'lighter') {
    const errors = gen.lighterDaysErrors(change.lighterDays);
    for (const r of Array.isArray(change.lighterDays) ? change.lighterDays : []) {
      if (dayNumber(r.from) < dayNumber(stored.startDate) || dayNumber(r.to) > deadline) errors.push('lighterDays must lie inside the plan');
    }
    if (errors.length) throw new gen.PlanInputError(errors);
    input.lighterDays = change.lighterDays;
  } else if (change.type !== 'rebuild') {
    throw new gen.PlanInputError(['change type must be rebuild, hours or lighter']);
  }
  if (change.solvedLinks) input.solvedLinks = change.solvedLinks;
  input.startDate = today;
  input.weeks = Math.min(52, Math.max(1, Math.ceil((deadline - t + 1) / 7)));

  // what a rebuild keeps: everything done, skipped, locked or added by the student (and mock or behavioral items already done); the rest is planned again
  const groups = new Map();
  for (const it of stored.items) if (isPlannedContent(it)) { const id = baseId(it); if (!groups.has(id)) groups.set(id, []); groups.get(id).push(it); }
  const kept = [];
  const exclude = new Set();
  const remaining = new Map();
  for (const it of stored.items) {
    if (!isPlannedContent(it)) { if (it.doneAt || it.source !== 'planner' || it.type === 'custom') kept.push(it); }
  }
  for (const [id, parts] of groups) {
    if (parts.some((p) => p.skipped || p.locked)) { exclude.add(id); kept.push(...parts); continue; }
    const done = parts.filter((p) => p.doneAt);
    if (done.length === parts.length) { exclude.add(id); kept.push(...parts); continue; }
    if (done.length) { kept.push(...done); remaining.set(id, sum(parts.filter((p) => !p.doneAt))); }
  }
  const keptMinutes = new Map();
  for (const it of kept) if (dayNumber(it.day) >= t) keptMinutes.set(dayNumber(it.day), (keptMinutes.get(dayNumber(it.day)) || 0) + it.plannedMinutes);
  const behavioralDone = new Set(stored.items.filter((it) => it.type === 'behavioral' && it.doneAt).map((it) => Number(it.ref.split(':')[1])));
  const backlogMinutes = sum(dueReviews(stored.items, today));

  const generated = gen.generatePlan(input, data, { deadline: stored.deadline, weekOrigin: stored.startDate, planWeeks: stored.input.weeks, exclude, remaining, keptMinutes, behavioralDone, backlogMinutes });
  const items = [...kept, ...generated.items].sort((a, b) => a.day.localeCompare(b.day));

  const before = stored.items.filter((it) => isPlannedContent(it) && !it.doneAt && !it.skipped);
  const after = items.filter((it) => isPlannedContent(it) && !it.doneAt && !it.skipped);
  const finishBefore = lastDay(before) || null;
  const finishAfter = lastDay(after) || null;
  const oldDays = firstDayById(before);
  const newDays = firstDayById(after);
  let movedItems = 0;
  for (const [id, day] of oldDays) if (newDays.has(id) && newDays.get(id) !== day) movedItems += 1;
  const finishChangeDays = finishBefore && finishAfter ? dayNumber(finishAfter) - dayNumber(finishBefore) : 0;
  const diff = {
    finishBefore, finishAfter, finishChangeDays,
    finishText: finishChangeDays === 0 ? 'stays the same' : `${Math.abs(finishChangeDays)} day${Math.abs(finishChangeDays) === 1 ? '' : 's'} ${finishChangeDays < 0 ? 'earlier' : 'later'}`,
    movedItems,
    newlyLeftOut: [...oldDays.keys()].filter((id) => !newDays.has(id)).length,
    nowScheduled: [...newDays.keys()].filter((id) => !oldDays.has(id)).length,
    doneProtected: stored.items.filter((it) => it.doneAt).length,
    lockedKept: kept.filter((it) => it.locked).length,
    reviewBacklogMinutes: backlogMinutes,
    checksum: itemsChecksum(items),
  };
  const plan = { ...stored, input: { ...stored.input, hoursByWeekday: input.hoursByWeekday, restDay: input.restDay ?? null, lighterDays: input.lighterDays || [], solvedLinks: input.solvedLinks || [] }, items, finishDate: finishAfter, coverage: generated.coverage, notices: generated.notices };
  return { plan, diff };
};

module.exports = {
  LADDERS, REVIEW_MINUTES, MAX_MOVE_DAYS, hoursOn, reviewRoom, markDone, recordReview, dueReviews, reviewsForDay, reviewBacklog, revisionList,
  carriedOver, skipItem, unskipItem, moveItem, todayView, previewChange, itemsChecksum,
};
