const crypto = require('node:crypto');
const { dayNumber, ymdOf, weekdayOf, dayBudget, notesMinutes, PlanInputError } = require('./planGenerator');

// A report's DSA ref describes a topic, not a solved problem. Keep it as a task
// so completing it cannot accidentally solve every problem in that topic.
function reportMaterial(ref, data) {
  const [kind, first, second] = (ref || '').split(':');
  if (kind === 'dsa' && data.sheets[first]?.topics.some((topic) => topic.id === second)) {
    return { type: 'custom', ref, plannedMinutes: 60 };
  }
  if (kind === 'notes') {
    const section = data.notes[first]?.find((entry) => entry.id === second);
    if (section) return { type: 'notes', ref, subject: first, plannedMinutes: notesMinutes(section.readMinutes) };
  }
  const roadmap = data.roadmapCatalog.find((entry) => entry.slug === first);
  if (kind === 'roadmap' && roadmap) return { type: 'roadmap', ref, plannedMinutes: 120 };
  if (kind === 'project' && roadmap?.steps.some((step) => step.id === second)) {
    return { type: 'roadmap', ref, stepId: second, plannedMinutes: 120 };
  }
  if (kind === 'behavioral' && data.behavioral.some((entry) => String(entry.id) === first)) {
    return { type: 'behavioral', ref, plannedMinutes: 10 };
  }
  // Removed or unknown references remain readable tasks, without a broken link.
  return { type: 'custom', ref: null, plannedMinutes: 30 };
}

function hoursOn(input, day) {
  const weekday = weekdayOf(dayNumber(day));
  if (weekday === input.restDay) return 0;
  const lighter = input.lighterDays?.find((range) => range.from <= day && range.to >= day);
  return lighter ? lighter.hours : input.hoursByWeekday[weekday];
}

// Preserve every existing item. Fill free room first; if it runs out, use the
// least-loaded study day and return the overload explicitly for confirmation.
function fitReportItems(tasks, kept, input, startDate, deadline, preserveDays = false) {
  const days = [];
  for (let number = dayNumber(startDate); number <= dayNumber(deadline); number += 1) {
    const day = ymdOf(number);
    const hours = hoursOn(input, day);
    if (!hours || kept.some((item) => item.day === day && item.type === 'mock')) continue;
    const budget = dayBudget(hours);
    const due = kept.filter((item) => !item.skipped && item.nextReviewDay && item.nextReviewDay <= day).length;
    // Reviews are three-minute recalls, capped at the existing 15% review share.
    const cap = budget.planned - Math.min(budget.planned - budget.fresh, due * 3);
    const used = kept.filter((item) => !item.skipped && item.day === day)
      .reduce((sum, item) => sum + item.plannedMinutes, 0);
    days.push({ day, cap, used });
  }
  if (!days.length) throw new PlanInputError(['No study days remain. Change your hours or replace the plan.']);
  const items = [];
  for (const task of tasks) {
    const preferred = preserveDays ? task.day : startDate;
    const fits = days.find((entry) => entry.day >= preferred && entry.cap - entry.used >= task.plannedMinutes);
    const target = fits || days.reduce((best, entry) => entry.used < best.used ? entry : best);
    target.used += task.plannedMinutes;
    items.push({ ...task, day: target.day, plannedDay: target.day });
  }
  const overloads = days.filter((entry) => entry.used > entry.cap)
    .map((entry) => ({ day: entry.day, minutes: entry.used - entry.cap }));
  return { items, overloads };
}

// Conversion uses saved report data only. Clients cannot submit task text, refs,
// dates or minutes to this endpoint. Stable occurrence keys make merges repeat-safe.
function prepareReportImport(report, current, mode, today, data) {
  const merging = !!current && mode === 'merge';
  const existing = current?.items || [];
  const seenKeys = new Set(merging ? existing.map((item) => item.key) : []);
  const coveredRefs = new Set(existing.filter((item) => merging || item.doneAt || item.solvedOnSheet)
    .filter((item) => ['notes', 'roadmap'].includes(item.type)).map((item) => item.ref));
  const startDate = merging && current.startDate > today ? current.startDate : today;
  const source = 'analyzer:' + report._id;
  const tasks = [];
  let omitted = 0;
  for (const day of report.plan || []) {
    if (!Number.isInteger(day.day) || day.day < 1 || day.day > report.days) continue;
    for (const [index, item] of day.items.entries()) {
      const key = `${source}:${day.day}:${index}`;
      const material = reportMaterial(item.ref, data);
      if (item.done || seenKeys.has(key) || (material.ref && coveredRefs.has(material.ref))) {
        omitted += 1;
        continue;
      }
      const title = String(item.task || '').trim().slice(0, 500);
      if (!title) continue;
      tasks.push({
        ...material, key, title, source, core: true, locked: false,
        day: ymdOf(dayNumber(startDate) + Math.max(0, day.day - 1)),
        order: existing.length + tasks.length,
      });
      seenKeys.add(key);
      if (['notes', 'roadmap'].includes(material.type) && material.ref) coveredRefs.add(material.ref);
    }
  }
  const defaults = {
    goalType: 'role', style: 'one-topic', originReport: String(report._id),
    title: ('Role prep: ' + report.title).slice(0, 120), targetRole: report.title.slice(0, 120),
    startDate, deadline: ymdOf(dayNumber(startDate) + report.days - 1),
    weeks: Math.ceil(report.days / 7), hoursByWeekday: current?.hoursByWeekday || [3, 3, 3, 3, 3, 5, 5],
    restDay: current?.restDay ?? null, lighterDays: [], subjects: [], knownTopics: [], solvedLinks: [],
  };
  const plan = merging ? { ...current } : defaults;
  const kept = merging ? existing : [];
  if (!tasks.length) return { plan, added: [], omitted, overloads: [] };
  const fitted = fitReportItems(tasks, kept, plan, startDate, plan.deadline, !merging);
  const minutes = fitted.items.reduce((sum, item) => sum + item.plannedMinutes, 0);
  plan.items = [...kept, ...fitted.items].sort((a, b) => a.day.localeCompare(b.day));
  plan.coverage = merging
    ? { ...current.coverage, extraMinutes: (current.coverage?.extraMinutes || 0) + minutes }
    : { syllabusMinutes: minutes, plannedMinutes: minutes, syllabusItems: tasks.length, plannedItems: tasks.length, leftOut: [] };
  plan.coverage.importOverloads = fitted.overloads;
  plan.notices = [...new Set([...(merging ? current.notices : []), 'report-import'])];
  return { plan, added: fitted.items, omitted, overloads: fitted.overloads };
}

// Report-only plans rebuild their own unfinished tasks, never an unrelated
// default sheet. Completed, skipped, moved and student-added items stay intact.
function previewReportChange(stored, input, today) {
  if (!input.hoursByWeekday.some((hours, index) => hours > 0 && index !== input.restDay)) {
    throw new PlanInputError(['Keep at least one study day.']);
  }
  const movable = stored.items.filter((item) => item.source.startsWith('analyzer:') && !item.doneAt && !item.skipped && !item.locked);
  const keys = new Set(movable.map((item) => item.key));
  const kept = stored.items.filter((item) => !keys.has(item.key));
  const fitted = movable.length ? fitReportItems(movable, kept, input, today, stored.deadline) : { items: [], overloads: [] };
  const items = [...kept, ...fitted.items].sort((a, b) => a.day.localeCompare(b.day));
  const finishBefore = movable.map((item) => item.day).sort().at(-1) || null;
  const finishAfter = fitted.items.map((item) => item.day).sort().at(-1) || null;
  const finishChangeDays = finishBefore && finishAfter ? dayNumber(finishAfter) - dayNumber(finishBefore) : 0;
  const plan = {
    ...stored, input: { ...stored.input, weeks: input.weeks, hoursByWeekday: input.hoursByWeekday, restDay: input.restDay, lighterDays: input.lighterDays || [] },
    items, finishDate: finishAfter,
    coverage: { ...stored.coverage, importOverloads: fitted.overloads }, notices: ['report-import'],
  };
  const checksum = crypto.createHash('sha256').update(JSON.stringify(plan)).digest('hex').slice(0, 16);
  return {
    plan,
    diff: {
      finishBefore, finishAfter, finishChangeDays,
      finishText: finishChangeDays === 0 ? 'stays the same' : `${Math.abs(finishChangeDays)} days ${finishChangeDays < 0 ? 'earlier' : 'later'}`,
      movedItems: fitted.items.filter((item) => movable.find((old) => old.key === item.key).day !== item.day).length,
      newlyLeftOut: 0, nowScheduled: 0, doneProtected: kept.filter((item) => item.doneAt).length,
      lockedKept: kept.filter((item) => item.locked).length, reviewBacklogMinutes: 0, checksum,
    },
  };
}

module.exports = { prepareReportImport, previewReportChange };
