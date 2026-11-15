import { dateInIndia, planDays } from "./planBuilder";
import { formatPlanDate, formatPlanMinutes } from "./planFormat";
import { refLink } from "./reportLinks";

export { formatPlanDate, formatPlanMinutes };

// Completion on a sheet counts here even when the stored plan has no completion timestamp.
export function isPlanItemDone(item) {
  return !!(item.doneAt || item.solvedOnSheet);
}

// Calendar arithmetic is UTC on date-only strings; the current day comes from India time.
export function addPlanDays(day, count) {
  const date = new Date(day + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

// Never use a virtual review's missing ID as a mutation target.
export function resolveStudyItem(plan, entry) {
  const key = entry.originalKey || entry.key;
  return plan.items.find((item) => item.id === key || item.key === key) || null;
}

// Real problem links open the coding site; other materials use existing PrepStack routes.
export function studyMaterial(item) {
  if (item.type === "dsa" && item.link)
    return { path: item.link, label: "Open coding problem" };
  const target = refLink(item.ref, { [item.ref]: item.title });
  if (
    target &&
    item.type === "roadmap" &&
    item.stepId &&
    !target.path.includes("#")
  ) {
    return { ...target, path: target.path + "#" + item.stepId };
  }
  return target;
}

export function studyProgress(items) {
  const live = items.filter((item) => !item.skipped);
  const done = live.filter(isPlanItemDone);
  return {
    total: live.length,
    done: done.length,
    minutes: done.reduce((sum, item) => sum + item.plannedMinutes, 0),
    complete: live.length > 0 && done.length === live.length,
  };
}

// Adapt to the shared checklist while retaining stable IDs for per-task actions.
export function studyChecklistDays(items) {
  const days = planDays(items);
  for (const day of days) {
    const original = items.filter((item) => item.day === day.day);
    day.items = day.items.map((entry, index) => ({
      ...entry,
      id: original[index].id,
      disabled: !!original[index].solvedOnSheet && !original[index].doneAt,
    }));
  }
  return days;
}

// One line for a week that is still closed: the time and the first topics in it (from the checklist days, whose items carry minutes and a group).
export function weekSummary(week) {
  const items = week.days.flatMap((day) => day.items);
  const total = items.reduce((sum, item) => sum + (item.minutes || 0), 0);
  const byGroup = new Map();
  for (const item of items) if (item.group) byGroup.set(item.group, (byGroup.get(item.group) || 0) + (item.minutes || 0));
  const groups = [...byGroup.entries()].sort((x, y) => y[1] - x[1]).map(([group]) => group); // the topics with the most time first
  const shown = groups.slice(0, 3).join(", ");
  const more = groups.length > 3 ? " and " + (groups.length - 3) + " more" : "";
  return formatPlanMinutes(total) + (shown ? " · " + shown + more : "");
}

// Calendar weeks start on Monday, matching previews and the server's weekly review.
export function studyWeeks(days, startDate) {
  const start = new Date(startDate + "T00:00:00Z");
  const mondayOffset = (start.getUTCDay() + 6) % 7;
  const weeks = new Map();
  for (const day of days) {
    const offset = (Date.parse(day.day) - start.getTime()) / 86400000;
    const number = Math.floor((offset + mondayOffset) / 7) + 1;
    if (!weeks.has(number)) weeks.set(number, { number, days: [] });
    weeks.get(number).days.push(day);
  }
  const list = [...weeks.values()];
  const skipped = list.length ? list[0].number - 1 : 0; // a start on the rest day leaves week 1 empty: count from the first week with tasks
  return list.map((week) => ({ ...week, number: week.number - skipped }));
}

// Deduplicate split problems so a practice round never treats every part as a new problem.
export function revisionRoundItems(items) {
  const grouped = new Map();
  for (const item of items) {
    if (
      item.skipped ||
      !isPlanItemDone(item) ||
      !["dsa", "notes"].includes(item.type)
    )
      continue;
    const identity = item.ref + "|" + (item.link || "");
    const previous = grouped.get(identity);
    grouped.set(identity, {
      ...item,
      part: null,
      plannedMinutes: item.plannedMinutes + (previous?.plannedMinutes || 0),
      starred: item.starred || !!previous?.starred,
    });
  }
  return [...grouped.values()].sort(
    (a, b) => Number(b.starred) - Number(a.starred),
  );
}

// Pull forward only a task that fits today's planned room and the existing move limits.
export function pullForwardItem(plan, today, currentDay = dateInIndia()) {
  const day = today?.isToday ? today.date : currentDay;
  if ((plan.startDate && day < plan.startDate) || day > plan.deadline)
    return null;
  // Waiting reviews take priority, even if they did not fit on Today's small list.
  if (
    plan.items.some(
      (item) =>
        !item.skipped && item.nextReviewDay && item.nextReviewDay <= day,
    )
  )
    return null;
  if (today?.isToday && today.items.some((item) => item.type === "review"))
    return null;
  const weekday = (new Date(day + "T00:00:00Z").getUTCDay() + 6) % 7;
  const lighter = plan.lighterDays.find(
    (range) => range.from <= day && range.to >= day,
  );
  const hours =
    weekday === plan.restDay
      ? 0
      : lighter
        ? lighter.hours
        : plan.hoursByWeekday[weekday];
  const scheduled = plan.items
    .filter((item) => item.day === day && !item.skipped)
    .reduce((sum, item) => sum + item.plannedMinutes, 0);
  const outstanding = today?.isToday ? today.minutes : 0;
  const carriedMinutes = today?.isToday
    ? today.items
      .filter((item) => item.type === "review" || item.day < day)
      .reduce((sum, item) => sum + item.plannedMinutes, 0)
    : 0;
  const room = Math.floor(hours * 60 * 0.85)
    - Math.max(scheduled + carriedMinutes, outstanding);
  if (plan.items.some((item) => item.day === day && item.type === "mock"))
    return null;
  return (
    plan.items.find((item) => {
      const originalDay = item.plannedDay || item.day;
      const shift = Math.abs(
        (Date.parse(originalDay) - Date.parse(day)) / 86400000,
      );
      return (
        item.day === addPlanDays(day, 1) &&
        !item.locked &&
        !item.skipped &&
        !isPlanItemDone(item) &&
        !["mock", "behavioral"].includes(item.type) &&
        item.plannedMinutes <= room &&
        shift <= 3
      );
    }) || null
  );
}

// Mocks use distinct, unfinished core problems. Nothing is silently marked solved.
export function mockProblems(items) {
  const unique = new Map();
  for (const item of items) {
    if (
      item.type === "dsa" &&
      item.core &&
      !item.skipped &&
      !isPlanItemDone(item)
    )
      unique.set(item.link, item);
  }
  const problems = [...unique.values()];
  if (problems.length < 2) return [];
  const first = problems[0];
  const second =
    problems.find(
      (item) =>
        item.link !== first.link && item.difficulty !== first.difficulty,
    ) || problems[1];
  return [first, second];
}
