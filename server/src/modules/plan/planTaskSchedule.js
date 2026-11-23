// Shared capacity fitting for recovery and system-added learning activities.
// Pure helpers keep previews deterministic and leave saved tasks untouched.
const { createHash } = require('node:crypto');
const gen = require('./planGenerator');
const { baseId, dayBudget, dayNumber, PlanInputError } = gen;
const { addStudyDays } = require('../../shared/calendar/studyCalendar');
const { PLAN_MAX_ITEMS } = require('../../shared/config/limits');

function hoursOn(input, ymd) {
  const n = dayNumber(ymd);
  const weekday = gen.weekdayOf(n);
  if (weekday === (input.restDay ?? null)) return 0;
  const lighter = (input.lighterDays || []).find(range => n >= dayNumber(range.from) && n <= dayNumber(range.to));
  return lighter ? lighter.hours : input.hoursByWeekday[weekday];
}

// Keep whole tasks when a regular day can hold them. Previously moved tasks
// can be larger, so split those across available days without losing minutes.
function fitTasks(tasks, fixed, input, today, lastDay, { preserveDates = true, budget = 'planned' } = {}) {
  const used = new Map();
  for (const item of fixed) {
    if (item.skipped || item.day < today) continue;
    used.set(item.day, (used.get(item.day) || 0) + item.plannedMinutes);
  }
  const maxDay = Math.max(...input.hoursByWeekday.map((hours, index) =>
    index === input.restDay ? 0 : dayBudget(hours)[budget],
  ));
  const ordinals = new Map();
  const keys = new Set();
  for (const item of [...fixed, ...tasks]) {
    const id = baseId(item);
    ordinals.set(id, Math.max(ordinals.get(id) || 0, item.part?.n || 0));
    keys.add(item.key);
  }
  const fitted = [];
  let cursor = today;
  let refitted = 0;
  let movedLocked = 0;
  for (const item of tasks) {
    if (preserveDates && item.day > cursor) cursor = item.day;
    let remaining = item.plannedMinutes;
    if (item.learningKind === 'rehearsal' && remaining > maxDay) return null;
    const split = remaining > maxDay;
    const hasParts = ['dsa', 'notes', 'roadmap'].includes(item.type) || !!item.learningKind;
    let parts = 0;
    let changed = false;
    while (remaining > 0) {
      if (cursor > lastDay || fitted.length + fixed.length >= PLAN_MAX_ITEMS) return null;
      const room = dayBudget(hoursOn(input, cursor))[budget] - (used.get(cursor) || 0);
      if (room <= 0 || (!split && remaining > room)) {
        cursor = addStudyDays(cursor, 1);
        continue;
      }
      const minutes = Math.min(remaining, room);
      const scheduled = { ...item, day: cursor, plannedMinutes: minutes };
      if (cursor !== item.day || split) {
        scheduled.plannedDay = cursor;
        changed = true;
      }
      if (split && hasParts && !item.part && parts === 0) scheduled.part = { n: 1, of: 2 };
      if (parts > 0) {
        delete scheduled._id;
        const prefix = 'resume:' + createHash('sha256').update(item.key).digest('hex').slice(0, 24);
        let suffix = parts;
        while (keys.has(prefix + ':' + suffix)) suffix += 1;
        scheduled.key = prefix + ':' + suffix;
        keys.add(scheduled.key);
        if (hasParts) {
          const id = baseId(item);
          const n = Math.max(1, ordinals.get(id)) + 1;
          ordinals.set(id, n);
          scheduled.part = { n, of: n };
        } else {
          scheduled.title = scheduled.title.slice(0, 488) + ' (continued)';
        }
      }
      fitted.push(scheduled);
      used.set(cursor, (used.get(cursor) || 0) + minutes);
      parts += 1;
      remaining -= minutes;
    }
    if (changed) refitted += 1;
    if (changed && item.locked) movedLocked += 1;
  }
  // Re-splitting several pending parts can otherwise display part 3 before
  // part 2. Renumber only pending learning parts; saved history stays intact.
  const learningGroups = new Map();
  for (const item of fitted) {
    if (!item.learningKind) continue;
    const id = baseId(item);
    if (!learningGroups.has(id)) learningGroups.set(id, []);
    learningGroups.get(id).push(item);
  }
  for (const [id, parts] of learningGroups) {
    const preserved = fixed.filter(item => baseId(item) === id);
    if (parts.length + preserved.length <= 1 && !parts[0].part) continue;
    const offset = Math.max(0, ...preserved.map(item => item.part?.n || 0));
    parts.forEach((item, index) => { item.part = { n: offset + index + 1, of: offset + parts.length }; });
  }
  return { fitted, refitted, movedLocked };
}

// Learning work is scheduled by the system, unlike a student's personal task.
// Refit only its unfinished, unlocked parts; never rewrite completed history.
function refitLearning(items, input, today, deadline) {
  const movable = item => item.source === 'learning' && item.learningKind && !item.doneAt && !item.skipped && !item.locked;
  const pending = items.filter(movable).sort((a, b) => a.day.localeCompare(b.day));
  const fixed = items.filter(item => !movable(item));
  const lockedDays = new Set(fixed.filter(item => item.source === 'learning' && item.locked && !item.doneAt && !item.skipped).map(item => item.day));
  for (const day of lockedDays) {
    const minutes = fixed.filter(item => item.day === day && !item.doneAt && !item.skipped)
      .reduce((total, item) => total + item.plannedMinutes, 0);
    if (minutes > dayBudget(hoursOn(input, day)).planned) {
      throw new PlanInputError(['Locked practice no longer fits these hours. Move, unlock or skip it before changing your schedule.']);
    }
  }
  if (!pending.length) return items;
  const fitted = fitTasks(pending, fixed, input, today, deadline, { budget: 'fresh' });
  if (!fitted) throw new PlanInputError(['Optional practice does not fit these hours before the deadline. Add time, extend the deadline or skip it first. Rehearsals need one uninterrupted slot.']);
  return [...fixed, ...fitted.fitted];
}

// Dated mocks or personal commitments can take room after fitting. Never let
// their combination with pending learning work silently exceed the day.
function assertLearningCapacity(items, input) {
  const days = new Set(items.filter(item => item.learningKind && !item.doneAt && !item.skipped).map(item => item.day));
  for (const day of days) {
    const minutes = items.filter(item => item.day === day && !item.skipped).reduce((total, item) => total + item.plannedMinutes, 0);
    if (minutes > dayBudget(hoursOn(input, day)).planned) {
      throw new PlanInputError(['Practice conflicts with the other commitments on a study day. Move or skip it, or add study time, then preview again.']);
    }
  }
}

module.exports = { hoursOn, fitTasks, refitLearning, assertLearningCapacity };
