// Small pure helpers for the study-plan checklist (kept out of the component so they can be tested without a browser).

// How many plan items are done, over all days.
export const countPlan = (days) => {
  const items = (days || []).flatMap((d) => d.items || []);
  return { done: items.filter((i) => i.done).length, total: items.length };
};

// A copy of the plan with one item set to the wanted state. Anything that does not exist is left alone.
export const setItemDone = (days, day, index, done, doneAt = null) =>
  (days || []).map((d) => (d.day !== day ? d : {
    ...d,
    items: (d.items || []).map((it, i) => (i !== index ? it : { ...it, done, doneAt: done ? doneAt : null })),
  }));

// "10 Nov, 3:42 pm" for a saved time, or "" when there is none.
export const formatDoneAt = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};
