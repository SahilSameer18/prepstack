const { dayNumber, PlanInputError } = require('./planGenerator');
const { hoursOn, reviewRoom, REVIEW_MINUTES } = require('./planAdjust');
const { calendarSettings, studyDay, addStudyDays } = require('../utils/studyCalendar');
const { problemIdentity } = require('../utils/problemIdentity');

// Measure the break in the calendar captured at pause time. Changing timezone
// while away cannot add or remove paused days. Actual completion dates stay put.
function resumePlan(plan, user, now, extendDeadline, solved = new Set()) {
  const pauseCalendar = plan.pauseCalendar || calendarSettings(user);
  const shiftDays = Math.max(0, dayNumber(studyDay(now, pauseCalendar)) - dayNumber(plan.pausedAtDay));
  const deadline = extendDeadline ? addStudyDays(plan.deadline, shiftDays) : plan.deadline;
  if (deadline < studyDay(now, calendarSettings(user))) {
    throw new PlanInputError(['The fixed deadline has passed. Extend it when resuming.']);
  }
  let movedItems = 0;
  let reviews = 0;
  const items = plan.items.map((item) => {
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
    return next;
  });
  // Only the remaining portion of a lighter stretch is relevant after a break.
  const lighterDays = (plan.lighterDays || []).filter((range) => range.to >= plan.pausedAtDay).map((range) => ({
    from: addStudyDays(range.from < plan.pausedAtDay ? plan.pausedAtDay : range.from, shiftDays),
    to: addStudyDays(range.to, shiftDays), hours: range.hours,
  }));
  if (items.some((item) => !item.doneAt && !item.skipped && item.day > deadline)) {
    throw new PlanInputError(['The shifted tasks pass the fixed deadline. Extend it when resuming.']);
  }
  return {
    patch: {
      items, deadline, lighterDays, status: 'active',
      pausedAt: null, pausedAtDay: null, pauseCalendar: null,
      totalPausedDays: (plan.totalPausedDays || 0) + shiftDays,
    },
    shiftDays, movedItems, reviews,
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
