const { createHash } = require('node:crypto');
const { dayNumber, PlanInputError } = require('./planGenerator');
const { hoursOn, reviewRoom, reviewMinutes } = require('./planAdjust');
const { fitTasks } = require('./planTaskSchedule');
const { calendarSettings, studyDay, addStudyDays } = require('../../shared/calendar/studyCalendar');
const { problemIdentity } = require('../sheets/problemIdentity');
const { PLAN_MAX_WEEKS } = require('../../shared/config/limits');

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
  const result = fitTasks(pending, fixed, input, today, shiftedDeadline)
    || fitTasks(pending, fixed, input, today, lastDay, { preserveDates: false });
  if (!result) {
    if (pending.some(item => item.learningKind === 'rehearsal')) {
      throw new PlanInputError(['The remaining work, including an uninterrupted rehearsal, does not fit. Add study time or skip the rehearsal before resuming. Your plan is still paused.']);
    }
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
    const future = plan.items.filter((item) => !item.skipped && item.nextReviewDay === day && item.nextReviewDay > today).reduce((sum, item) => sum + reviewMinutes(item), 0);
    const room = Math.max(0, reviewRoom(hoursOn(input, day)) - future);
    slots.push({ day, room });
  }
  const changes = new Map();
  for (const item of due) {
    const alreadyReviewed = item.lastReviewDay === today || (item.lastReviewAt && studyDay(new Date(item.lastReviewAt), settings) === today);
    const guardedDay = item.reviewWindowEndsAt && new Date(item.reviewWindowEndsAt) > now
      ? studyDay(new Date(item.reviewWindowEndsAt), settings) : today;
    const slot = slots.find((entry) => entry.room >= reviewMinutes(item) && entry.day >= guardedDay && (!alreadyReviewed || entry.day > today));
    if (!slot) throw new PlanInputError(['The reviews do not fit this window. Choose more days, extend the deadline or increase your study hours.']);
    slot.room -= reviewMinutes(item);
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
