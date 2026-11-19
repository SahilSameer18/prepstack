// Streak days are counted in Indian Standard Time (UTC+5:30, no daylight saving), the same day the students live in.
// Dates are always stored as normal UTC dates; only the day number is worked out here.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Whole days since 1970-01-01 in IST: two times on the same IST calendar day give the same number.
const istDayNumber = (date) => Math.floor((new Date(date).getTime() + IST_OFFSET_MS) / DAY_MS);

// Days in a row with at least one solve, counting back from today (IST). If nothing was solved today yet,
// the streak is still alive as long as yesterday had a solve. dates: the solvedAt values; entries without a date are ignored.
const currentStreak = (dates, now = new Date()) => {
  const days = new Set(dates.filter(Boolean).map(istDayNumber));
  let day = istDayNumber(now);
  if (!days.has(day)) day -= 1;
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day -= 1;
  }
  return streak;
};

module.exports = { istDayNumber, currentStreak };
