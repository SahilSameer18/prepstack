// Plain-words dates and times for plan screens. A date is a "YYYY-MM-DD" string; the day names come from the date itself (no time zone shift).
export function formatPlanDate(day, withYear = false) {
  const text = new Date(day + "T00:00:00Z").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return withYear ? text + " " + day.slice(0, 4) : text; // "Sun, 17 Jan 2027"
}

export function formatPlanMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return rest + " min";
  return hours + " h" + (rest ? " " + rest + " min" : "");
}

// The topics and subjects a plan leaves out (none) or only partly holds (part), from the server's coverage list.
export function coverageLists(byGroup) {
  const groups = Array.isArray(byGroup) ? byGroup : [];
  return {
    none: groups.filter((group) => group.state === "none"),
    part: groups.filter((group) => group.state === "part"),
  };
}
