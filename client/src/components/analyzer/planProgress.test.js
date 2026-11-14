import { describe, it, expect } from "vitest";
import { countPlan, setItemDone, formatDoneAt } from "./planProgress";
import {
  PLAN_INTENT_KEY, consumePlanIntent, dateInIndia, defaultSettings,
  planBody, planDays, planFormErrors, readPlanSettings, safeReturnTo, writePlanSettings,
} from '../../utils/planBuilder';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import PlanChecklist from './PlanChecklist';
import { AuthContext } from '../../context/AuthContext';
import MyPlan from '../../pages/MyPlan';
import SelectField from '../ui/SelectField';

const plan = [
  { day: 1, items: [{ task: "a", done: true }, { task: "b", done: false }] },
  { day: 2, items: [{ task: "c" }] },
];

const builderOptions = {
  sheets: [
    { slug: 'blind-75', topics: [{ id: 'arrays', title: 'Arrays' }] },
    { slug: 'neetcode-150', topics: [] },
    { slug: 'striver-sde', topics: [] },
  ],
  roadmaps: [{ slug: 'frontend', topics: [] }],
  subjects: ['os', 'dbms', 'cn', 'oops', 'hld'].map((id) => ({ id })),
};
const validSettings = () => ({ ...defaultSettings(), startDate: '2026-11-14' });

describe('My plan builder settings and login return', () => {
  it('the shared dropdown keeps its accessible name and complete selected label', () => {
    const label = 'A long developer roadmap label that must remain readable';
    const markup = renderToStaticMarkup(createElement(SelectField, {
      'aria-label': 'Role roadmap',
      options: [{ value: 'frontend', label }],
      value: 'frontend',
      onValueChange: () => {},
    }));
    expect(markup).toContain('role="combobox"');
    expect(markup).toContain('aria-label="Role roadmap"');
    expect(markup).toContain(label);
    expect(markup).toContain('aria-expanded="false"');
  });
  it('renders the public builder before an account or plan has loaded', () => {
    const page = createElement(MemoryRouter, null, createElement(MyPlan));
    const context = { user: null, loading: false };
    const markup = renderToStaticMarkup(createElement(AuthContext.Provider, { value: context }, page));
    expect(markup).toContain('One workable plan.');
    expect(markup).toContain('Generate my plan');
    expect(markup).not.toContain('Your saved plan');
  });
  it('uses the India calendar day rather than the browser timezone', () => {
    expect(dateInIndia(new Date('2026-11-13T20:00:00Z'))).toBe('2026-11-14');
  });

  it('round-trips both goals without losing empty subjects, known topics, zero hours or no rest day', () => {
    const settings = { ...validSettings(), subjects: [], knownTopics: ['arrays'], weekdayHours: 0, restDay: null };
    expect(planBody(readPlanSettings(writePlanSettings(settings)))).toEqual(planBody(settings));
    const role = { ...settings, goalType: 'role', roadmapSlug: 'frontend', knownTopics: [] };
    expect(planBody(readPlanSettings(writePlanSettings(role)))).toEqual(planBody(role));
    expect(writePlanSettings(role)).not.toContain('sheetSlug');
    expect(writePlanSettings(settings)).not.toContain('roadmapSlug');
  });

  it('keeps broken URL values visible as errors instead of silently generating a different plan', () => {
    const settings = readPlanSettings('weeks=&weekdayHours=oops&goalType=unknown&startDate=bad');
    const errors = planFormErrors(settings, builderOptions, '2026-11-14');
    expect(errors).toHaveProperty('weeks');
    expect(errors).toHaveProperty('weekdayHours');
    expect(errors).toHaveProperty('goalType');
    expect(errors).toHaveProperty('startDate');
  });

  it('matches server hour and calendar rules, including at least one real study day', () => {
    expect(planFormErrors(validSettings(), builderOptions, '2026-11-14')).toEqual({});
    expect(planFormErrors({ ...validSettings(), weekdayHours: 0, weekendHours: 0 }, builderOptions, '2026-11-14')).toHaveProperty('weekdayHours');
    expect(planFormErrors({ ...validSettings(), weekdayHours: 0.25 }, builderOptions, '2026-11-14')).toHaveProperty('weekdayHours');
    expect(planFormErrors({ ...validSettings(), weekdayHours: 0.75 }, builderOptions, '2026-11-14')).toEqual({});
    for (const startDate of ['2026-11-12', '2026-02-30', '2027-12-31']) {
      expect(planFormErrors({ ...validSettings(), startDate }, builderOptions, '2026-11-14')).toHaveProperty('startDate');
    }
  });

  it('rejects unsuitable big-tech sheets, unknown choices and topics from another syllabus', () => {
    expect(planFormErrors({ ...validSettings(), goalType: 'bigtech' }, builderOptions, '2026-11-14')).toHaveProperty('sheetSlug');
    expect(planFormErrors({ ...validSettings(), knownTopics: ['missing'] }, builderOptions, '2026-11-14')).toHaveProperty('knownTopics');
    expect(planFormErrors({ ...validSettings(), subjects: ['lld'] }, builderOptions, '2026-11-14')).toHaveProperty('subjects');
    expect(planFormErrors({ ...validSettings(), goalType: 'role', roadmapSlug: 'missing' }, builderOptions, '2026-11-14')).toHaveProperty('roadmapSlug');
  });

  it('only permits internal login destinations and prevents login loops', () => {
    const returnTo = '/my-plan?weeks=8&subjects=os%2Cdbms#preview';
    expect(safeReturnTo(returnTo)).toBe(returnTo);
    for (const unsafe of ['https://evil.test', '//evil.test', '/\\evil.test', '/%2f%2fevil.test', '/login', '/register', null]) {
      expect(safeReturnTo(unsafe)).toBe('/');
    }
  });

  it('consumes a matching login intent exactly once', () => {
    const data = new Map();
    const storage = { getItem: (key) => data.get(key), removeItem: (key) => data.delete(key) };
    data.set(PLAN_INTENT_KEY, JSON.stringify({ token: 'test', settings: 'weeks=8', createdAt: 1000 }));
    expect(consumePlanIntent(storage, 'test', 'weeks=8', 2000)).toBe(true);
    expect(consumePlanIntent(storage, 'test', 'weeks=8', 2000)).toBe(false);
  });

  it('a shared URL, changed settings or expired intent cannot authorize an automatic save', () => {
    const storage = { getItem: () => JSON.stringify({ token: 'test', settings: 'weeks=8', createdAt: 1000 }), removeItem: () => {} };
    expect(consumePlanIntent(storage, 'other-tab', 'weeks=8', 2000)).toBe(false);
    expect(consumePlanIntent(storage, 'test', 'weeks=12', 2000)).toBe(false);
    expect(consumePlanIntent(storage, 'test', 'weeks=8', 1000 + 16 * 60 * 1000)).toBe(false);
  });

  it('read-only previews reuse the checklist without offering a tick or changing completion state', () => {
    const items = [{ day: '2026-11-14', title: 'Arrays', plannedMinutes: 40, part: { n: 2, of: 3 }, solvedOnSheet: true }];
    const days = planDays(items);
    expect(days[0].items[0].done).toBe(true);
    const markup = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PlanChecklist, { readOnly: true, days })));
    expect(markup).toContain('part 2 of 3');
    expect(markup).not.toContain('type="checkbox"');
    expect(items[0]).not.toHaveProperty('doneAt');
  });
});

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
