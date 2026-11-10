// Which day of a report's study plan is "today". Day 1 is the IST calendar day the report was created (same IST days as the streak).
// Plan days can skip numbers or be fewer than asked for, and a student may be behind or past the end: in those cases
// "today" is the first day that still has unfinished items, and null when everything is done.
const { istDayNumber } = require('./istDay');

const hasOpenItem = (d) => (d.items || []).some((i) => !i.done);

const todayPlanDay = (plan, createdAt, now = new Date()) => {
  const days = plan || [];
  const offset = istDayNumber(now) - istDayNumber(createdAt) + 1;
  const exact = days.find((d) => d.day === offset);
  if (exact) return exact.day;
  return days.find(hasOpenItem)?.day ?? null;
};

module.exports = { todayPlanDay };
