// How a report's requirements are listed (the Skills tab and the PDF) and which required skills the resume does not show.
const STATUS_RANK = { missing: 0, partial: 1, met: 2 };
const rank = (r) => (r.importance === "must" ? 0 : 3) + (STATUS_RANK[r.status] ?? 0);

/** Required skills first and, inside each group, the gaps first: a missing required skill is the first thing a reader sees. */
export const orderRequirements = (list) => [...list].sort((a, b) => rank(a) - rank(b));

/** The required (must-have) skills with nothing in the resume to support them. Shown on top of the report even when the score is high. */
export const missingRequired = (list) => list.filter((r) => r.importance === "must" && r.status === "missing");

/** A short name for a requirement: its catalog skill when it has one, otherwise the job's own words. */
export const requirementName = (r) => (r.skillKey && r.skillKey !== "none" ? r.skillKey : r.text);
