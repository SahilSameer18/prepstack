const DAY_MS = 86400000;
const formatters = new Map();

function calendarSettings(user = {}) {
  return { timeZone: user.studyTimeZone || 'Asia/Kolkata', dayStartHour: user.studyDayStart ?? 0 };
}

function validTimeZone(value) {
  if (typeof value !== 'string' || value.length > 80) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return true;
  } catch { return false; }
}

function localParts(instant, timeZone) {
  if (!formatters.has(timeZone)) {
    if (formatters.size >= 128) formatters.clear();
    formatters.set(timeZone, new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }));
  }
  const parts = Object.fromEntries(formatters.get(timeZone).formatToParts(instant).map((part) => [part.type, part.value]));
  const day = `${parts.year}-${parts.month}-${parts.day}`;
  return { day, wallTime: Date.parse(`${day}T${parts.hour}:${parts.minute}:${parts.second}Z`) };
}

function addStudyDays(day, count) {
  return new Date(Date.parse(day + 'T00:00:00Z') + count * DAY_MS).toISOString().slice(0, 10);
}

// Resolve a local cutoff with the offsets around that date. During a repeated
// hour use the later occurrence, so the study date never flips backwards.
// If the clock skips the cutoff, use the first corresponding later wall time.
function boundaryFor(day, settings) {
  const wallTime = Date.parse(day + 'T00:00:00Z') + settings.dayStartHour * 3600000;
  const offsets = new Set([-2, -1, 0, 1, 2].map((days) => {
    const instant = wallTime + days * DAY_MS;
    return localParts(instant, settings.timeZone).wallTime - instant;
  }));
  const candidates = [...offsets].map((offset) => wallTime - offset);
  const exact = candidates.filter((instant) => localParts(instant, settings.timeZone).wallTime === wallTime);
  if (exact.length) return new Date(Math.max(...exact));
  const later = candidates.filter((instant) => localParts(instant, settings.timeZone).wallTime > wallTime);
  return new Date(Math.min(...later));
}

function studyDay(now = new Date(), settings = calendarSettings()) {
  const day = localParts(now, settings.timeZone).day;
  return now < boundaryFor(day, settings) ? addStudyDays(day, -1) : day;
}

function nextStudyBoundary(now, settings) {
  let day = addStudyDays(studyDay(now, settings), 1);
  let boundary = boundaryFor(day, settings);
  while (boundary <= now) {
    day = addStudyDays(day, 1);
    boundary = boundaryFor(day, settings);
  }
  return boundary;
}

// Keep the day recorded at completion. Legacy ticks keep their original India
// date rather than moving through history when a student changes timezone.
function studyStreak(entries, now, settings) {
  const days = new Set(entries.filter((entry) => entry.studyDay || entry.solvedAt).map((entry) =>
    entry.studyDay || studyDay(new Date(entry.solvedAt), calendarSettings())));
  let day = studyDay(now, settings);
  if (!days.has(day)) day = addStudyDays(day, -1);
  let count = 0;
  while (days.has(day)) {
    count += 1;
    day = addStudyDays(day, -1);
  }
  return count;
}

module.exports = { calendarSettings, validTimeZone, studyDay, nextStudyBoundary, addStudyDays, boundaryFor, studyStreak };
