import { describe, it, expect } from "vitest";
import { countPlan, setItemDone, formatDoneAt } from "./planProgress";

const plan = [
  { day: 1, items: [{ task: "a", done: true }, { task: "b", done: false }] },
  { day: 2, items: [{ task: "c" }] },
];

describe("countPlan", () => {
  it("counts done and total over all days; a missing done counts as not done", () => {
    expect(countPlan(plan)).toEqual({ done: 1, total: 3 });
  });
  it("handles an empty or missing plan", () => {
    expect(countPlan([])).toEqual({ done: 0, total: 0 });
    expect(countPlan(undefined)).toEqual({ done: 0, total: 0 });
    expect(countPlan([{ day: 1 }])).toEqual({ done: 0, total: 0 });
  });
});

describe("setItemDone", () => {
  it("ticks one item and keeps the rest, without changing the original", () => {
    const next = setItemDone(plan, 2, 0, true, "2026-11-10T10:00:00Z");
    expect(next[1].items[0]).toEqual({ task: "c", done: true, doneAt: "2026-11-10T10:00:00Z" });
    expect(next[0]).toBe(plan[0]);
    expect(plan[1].items[0].done).toBeUndefined();
  });
  it("unticking clears the time", () => {
    const next = setItemDone(plan, 1, 0, false);
    expect(next[0].items[0]).toEqual({ task: "a", done: false, doneAt: null });
  });
  it("a day or position that does not exist changes nothing", () => {
    expect(countPlan(setItemDone(plan, 9, 0, true))).toEqual({ done: 1, total: 3 });
    expect(countPlan(setItemDone(plan, 1, 7, true))).toEqual({ done: 1, total: 3 });
  });
});

describe("formatDoneAt", () => {
  it("is empty when there is no time or it is not a date", () => {
    expect(formatDoneAt(null)).toBe("");
    expect(formatDoneAt(undefined)).toBe("");
    expect(formatDoneAt("not a date")).toBe("");
  });
  it("gives a short readable text for a real date", () => {
    const s = formatDoneAt("2026-11-10T10:12:00Z");
    expect(s).toMatch(/10/);
    expect(s).toMatch(/Nov/);
  });
});
