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

// Fit work into the remaining calendar without losing minutes. Temporary hours
// and existing commitments both reduce the room available on each day.
function fitTasks(tasks, fixed, input, today, lastDay, { preserveDates = true, budget = 'planned' } = {}) {
  const used = new Map();
  for (const item of fixed) {
    if (item.skipped || item.day < today) continue;
    used.set(item.day, (used.get(item.day) || 0) + item.plannedMinutes);
  }
  const ordinals = new Map();
  const keys = new Set();
  for (const item of [...fixed, ...tasks]) {
    const id = baseId(item);
    ordinals.set(id, Math.max(ordinals.get(id) || 0, item.part?.n || 0));
    keys.add(item.key);
  }
  const fitted = [];
  const placementOrder = new Map();
  let cursor = today;
  let refitted = 0;
  let movedLocked = 0;
  for (const [taskIndex, item] of tasks.entries()) {
    if (preserveDates && item.day > cursor) cursor = item.day;
    let maxDay = 0;
    for (let day = cursor; day <= lastDay; day = addStudyDays(day, 1)) {
      const room = dayBudget(hoursOn(input, day))[budget] - (used.get(day) || 0);
      maxDay = Math.max(maxDay, room);
    }
    let remaining = item.plannedMinutes;
    if (item.learningKind === 'rehearsal' && remaining > maxDay) return null;
    // Ordinary learning parts can use short slots now rather than wasting them
    // while waiting for a whole slot that later parts may also need.
    const split = remaining > maxDay || (!!item.learningKind && item.learningKind !== 'rehearsal');
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
      if (cursor !== item.day || minutes !== item.plannedMinutes) {
        scheduled.plannedDay = cursor;
        changed = true;
      }
      if (hasParts && !item.part && parts === 0 && minutes < remaining) scheduled.part = { n: 1, of: 2 };
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
      // Same-day fragments stay in their original task order, even when new
      // occurrence ordinals were allocated after an existing later part.
      placementOrder.set(scheduled.key, [item.part?.n ?? taskIndex + 1, parts]);
      fitted.push(scheduled);
      used.set(cursor, (used.get(cursor) || 0) + minutes);
      parts += 1;
      remaining -= minutes;
    }
    if (changed) refitted += 1;
    if (changed && item.locked) movedLocked += 1;
  }
  // Locked future parts belong in the pending sequence, not the history prefix.
  // Copy them before relabelling: dates, keys and completed history stay intact.
  const kept = fixed.map(item => ({ ...item }));
  const learningGroups = new Map();
  for (const item of [...kept, ...fitted]) {
    if (!item.learningKind || item.doneAt || item.skipped) continue;
    const id = baseId(item);
    if (!learningGroups.has(id)) learningGroups.set(id, []);
    learningGroups.get(id).push(item);
  }
  for (const [id, parts] of learningGroups) {
    const preserved = kept.filter(item => baseId(item) === id && (item.doneAt || item.skipped));
    if (parts.length + preserved.length <= 1 && !parts[0].part) continue;
    const offset = Math.max(0, ...preserved.map(item => item.part?.n || 0));
    parts.sort((a, b) => {
      const aOrder = placementOrder.get(a.key) || [a.part?.n || 0, 0];
      const bOrder = placementOrder.get(b.key) || [b.part?.n || 0, 0];
      return a.day.localeCompare(b.day) || aOrder[0] - bOrder[0] || aOrder[1] - bOrder[1];
    });
    parts.forEach((item, index) => { item.part = { n: offset + index + 1, of: offset + parts.length }; });
  }
  return { fixed: kept, fitted, refitted, movedLocked };
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
  // Prefer existing dates, but check earlier remaining room before declaring
  // the deadline impossible. Locked dates are reserved in either attempt.
  const fitted = fitTasks(pending, fixed, input, today, deadline, { budget: 'fresh' })
    || fitTasks(pending, fixed, input, today, deadline, { budget: 'fresh', preserveDates: false });
  if (!fitted) throw new PlanInputError(['Optional practice does not fit these hours before the deadline. Add time, extend the deadline or skip it first. Rehearsals need one uninterrupted slot.']);
  return [...fitted.fixed, ...fitted.fitted];
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
