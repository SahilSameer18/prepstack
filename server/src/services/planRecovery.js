const { createHash } = require('node:crypto');
const { baseId, dayBudget, dayNumber, PlanInputError } = require('./planGenerator');
const { hoursOn, reviewRoom, REVIEW_MINUTES } = require('./planAdjust');
const { calendarSettings, studyDay, addStudyDays } = require('../utils/studyCalendar');
const { problemIdentity } = require('../utils/problemIdentity');
const { PLAN_MAX_ITEMS, PLAN_MAX_WEEKS } = require('../config/limits');

// Keep whole tasks when a regular day can hold them. Previously moved tasks
// can be larger, so split those across available days without losing minutes.
function fitResumedTasks(tasks, fixed, input, today, lastDay, preserveDates) {
  const used = new Map();
  for (const item of fixed) {
    if (item.skipped || item.day < today) continue;
    used.set(item.day, (used.get(item.day) || 0) + item.plannedMinutes);
  }
  const maxDay = Math.max(...input.hoursByWeekday.map((hours, index) =>
    index === input.restDay ? 0 : dayBudget(hours).planned,
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
    const split = remaining > maxDay;
    const hasParts = ['dsa', 'notes', 'roadmap'].includes(item.type);
    let parts = 0;
    let changed = false;
    while (remaining > 0) {
      if (cursor > lastDay || fitted.length + fixed.length >= PLAN_MAX_ITEMS) return null;
      const room = dayBudget(hoursOn(input, cursor)).planned - (used.get(cursor) || 0);
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
  return { fitted, refitted, movedLocked };
}

// Measure the break in the calendar captured at pause time. Changing timezone
// while away cannot add or remove paused days. Actual completion dates stay put.
function resumePlan(plan, user, now, extendDeadline, solved = new Set()) {
  const pauseCalendar = plan.pauseCalendar || calendarSettings(user);
  const shiftDays = Math.max(0, dayNumber(studyDay(now, pauseCalendar)) - dayNumber(plan.pausedAtDay));
  const shiftedDeadline = extendDeadline ? addStudyDays(plan.deadline, shiftDays) : plan.deadline;
  const today = studyDay(now, calendarSettings(user));
  if (shiftedDeadline < today && !extendDeadline) {
    throw new PlanInputError(['The fixed deadline has passed. Extend it when resuming.']);
  }
  let movedItems = 0;
  let reviews = 0;
  const fixed = [];
  const pending = [];
  for (const item of plan.items) {
    const next = { ...item };
    const complete = item.doneAt || (item.type === 'dsa' && solved.has(problemIdentity(item.link)));
    if (!complete) {
      next.day = addStudyDays(item.day, shiftDays);
      next.plannedDay = addStudyDays(item.plannedDay || item.day, shiftDays);
      movedItems += Number(shiftDays > 0);
    }
    if (item.nextReviewDay) {
      next.reviewNeedsPractice = needsPractice(item);
      next.nextReviewDay = addStudyDays(item.nextReviewDay, shiftDays);
      if (item.reviewBaseDay) next.reviewBaseDay = addStudyDays(item.reviewBaseDay, shiftDays);
      reviews += 1;
    }
    if (complete || item.skipped) fixed.push(next);
    else pending.push(next);
  }
  // Only the remaining portion of a lighter stretch is relevant after a break.
  const lighterDays = (plan.lighterDays || []).filter((range) => range.to >= plan.pausedAtDay).map((range) => ({
    from: addStudyDays(range.from < plan.pausedAtDay ? plan.pausedAtDay : range.from, shiftDays),
    to: addStudyDays(range.to, shiftDays), hours: range.hours,
  }));
  const totalPausedDays = (plan.totalPausedDays || 0) + shiftDays;
  const lastDay = extendDeadline
    ? addStudyDays(plan.startDate, PLAN_MAX_WEEKS * 7 + totalPausedDays - 1)
    : plan.deadline;
  pending.sort((a, b) => a.day.localeCompare(b.day));
  const input = { ...plan, lighterDays };
  // Prefer the original rhythm. If it needs a longer deadline, try the
  // earliest available days in study order before asking for extra time.
  const result = fitResumedTasks(pending, fixed, input, today, shiftedDeadline, true)
    || fitResumedTasks(pending, fixed, input, today, lastDay, false);
  if (!result) {
    const message = extendDeadline
      ? 'The remaining work exceeds the plan limit. Your plan is still paused.'
      : 'The remaining work cannot fit by the fixed deadline. Extend it when resuming.';
    throw new PlanInputError([message]);
  }
  const { fitted, refitted, movedLocked } = result;
  const finalTaskDay = fitted.at(-1)?.day || today;
  const deadline = finalTaskDay > shiftedDeadline ? finalTaskDay : shiftedDeadline;
  const items = [...fixed, ...fitted].sort((a, b) => a.day.localeCompare(b.day));
  const extraDays = dayNumber(deadline) - dayNumber(shiftedDeadline);
  const weeks = Math.max(1, Math.ceil((dayNumber(deadline) - dayNumber(plan.startDate) + 1 - totalPausedDays) / 7));
  return {
    patch: {
      items, deadline, weeks, lighterDays, status: 'active',
      pausedAt: null, pausedAtDay: null, pauseCalendar: null,
      totalPausedDays,
    },
    shiftDays, movedItems, reviews, refitted, movedLocked, extraDays,
  };
}

// Recovery changes review scheduling anchors, not completion records or stages.
// Every overdue review must fit the chosen window; none are silently discarded.
function recoverReviews(plan, user, now, days) {
  const settings = calendarSettings(user);
  const today = studyDay(now, settings);
  const due = plan.items.filter((item) => !item.skipped && item.nextReviewDay && item.nextReviewDay <= today)
    .sort((a, b) => Number(needsPractice(b)) - Number(needsPractice(a))
      || Number(b.starred) - Number(a.starred) || a.nextReviewDay.localeCompare(b.nextReviewDay));
  if (!due.length) throw new PlanInputError(['There are no overdue or due reviews to spread.']);
  const input = { hoursByWeekday: plan.hoursByWeekday, restDay: plan.restDay, lighterDays: plan.lighterDays };
  const slots = [];
  for (let offset = 0; offset < days; offset += 1) {
    const day = addStudyDays(today, offset);
    if (day > plan.deadline) break;
    const future = plan.items.filter((item) => !item.skipped && item.nextReviewDay === day && item.nextReviewDay > today).length;
    const room = Math.max(0, Math.floor(reviewRoom(hoursOn(input, day)) / REVIEW_MINUTES) - future);
    slots.push({ day, room });
  }
  const changes = new Map();
  for (const item of due) {
    const alreadyReviewed = item.lastReviewDay === today || (item.lastReviewAt && studyDay(new Date(item.lastReviewAt), settings) === today);
    const guardedDay = item.reviewWindowEndsAt && new Date(item.reviewWindowEndsAt) > now
      ? studyDay(new Date(item.reviewWindowEndsAt), settings) : today;
    const slot = slots.find((entry) => entry.room > 0 && entry.day >= guardedDay && (!alreadyReviewed || entry.day > today));
    if (!slot) throw new PlanInputError(['The reviews do not fit this window. Choose more days, extend the deadline or increase your study hours.']);
    slot.room -= 1;
    const shift = dayNumber(slot.day) - dayNumber(item.nextReviewDay);
    changes.set(item.key, {
      ...item, nextReviewDay: slot.day,
      reviewBaseDay: item.reviewBaseDay ? addStudyDays(item.reviewBaseDay, shift) : null,
      reviewNeedsPractice: needsPractice(item),
    });
  }
  return { items: plan.items.map((item) => changes.get(item.key) || item), reviewCount: due.length };
}

module.exports = { resumePlan, recoverReviews };

function needsPractice(item) {
  return item.reviewNeedsPractice ?? !!(item.lastFailedDay && item.reviewBaseDay === item.lastFailedDay && item.reviewStage === 0);
}
