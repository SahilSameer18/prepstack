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
import ReportPlanImport from '../plan/ReportPlanImport';
import StudyToday from '../plan/StudyToday';
import StudyRecovery from '../plan/StudyRecovery';
import { pullForwardItem, revisionRoundItems, resolveStudyItem, studyProgress, studyChecklistDays, studyWeeks, studyMaterial } from '../../utils/studyPlan';

describe('Daily study screens', () => {
  it('opens learning practice at its source roadmap step without sharing the original task identity', () => {
    const task = { type: 'custom', learningKind: 'repair', ref: 'learning:separate-id',
      materialRef: 'roadmap:frontend', stepId: 'react-basics', title: 'Practise React' };
    expect(studyMaterial(task).path).toBe('/roadmaps/frontend#react-basics');
    expect(studyMaterial({ ...task, materialRef: 'notes:os:os-processes', stepId: null }).path).toBe('/notes/os/os-processes');
  });
  it('offers a paused main plan alongside the active sprint without a second pause action', () => {
    const data = {
      plan: { items: [] }, finished: false,
      calendar: { timeZone: 'America/Los_Angeles', dayStartHour: 4, today: '2026-11-16' },
      pausedPlans: [{ id: 'main', title: 'Placement main', pausedAtDay: '2026-11-01' }],
    };
    const tree = createElement(MemoryRouter, null, createElement(StudyRecovery, { model: { data } }));
    const markup = renderToStaticMarkup(tree);
    expect(markup).toContain('America/Los_Angeles');
    expect(markup).toContain('Placement main');
    expect(markup).toContain('Resume plan');
    expect(markup).toContain('Read paused plan');
    expect(markup).not.toContain('>Pause plan<');
  });
  it('opening a report offers an import action, without implicit confirmation', () => {
    const tree = createElement(MemoryRouter, null, createElement(ReportPlanImport, { reportId: 'report' }));
    const markup = renderToStaticMarkup(tree);
    expect(markup).toContain('Add to My plan');
    expect(markup).not.toContain('Confirm add to My plan');
  });
  it('groups the partial first week separately from the following Monday', () => {
    const days = [{ day: '2026-11-15' }, { day: '2026-11-16' }, { day: '2026-11-22' }];
    expect(studyWeeks(days, '2026-11-15').map((week) => [week.number, week.days.length])).toEqual([[1, 1], [2, 2]]);
    // a plan that starts on a rest day has no tasks in its first calendar week: the numbering starts at the first week with tasks
    expect(studyWeeks(days.slice(1), '2026-11-15').map((week) => week.number)).toEqual([1]);
  });
  it('keeps Today to its exact allowed text, one button and the task list', () => {
    const items = [{ key: 'carry', title: 'Arrays', plannedMinutes: 40 }, { key: 'review', title: 'Recall processes', plannedMinutes: 10 }];
    const today = { date: '2026-11-15', isToday: true, items, minutes: 50, startItem: items[1] };
    const markup = renderToStaticMarkup(createElement(StudyToday, { today, onStart: () => {} }));
    expect(markup.match(/<button\b/g)).toHaveLength(1);
    expect(markup.match(/<li\b/g)).toHaveLength(2);
    expect(markup.replace(/<[^>]*>/g, '')).toBe('Today: 2 tasks, 50 minStartArrays40 minRecall processes10 min');
    expect(markup).not.toMatch(/<(?:a|input|select|details|svg|canvas)\b/);
    const split = { ...today, items: [{ ...items[0], part: { n: 2, of: 3 } }] };
    expect(renderToStaticMarkup(createElement(StudyToday, { today: split }))).toContain('Arrays (part 2 of 3)');
  });
  it('labels a future day and disables Start when there is no task', () => {
    const today = { date: '2026-11-16', isToday: false, items: [], minutes: 0, startItem: null };
    const markup = renderToStaticMarkup(createElement(StudyToday, { today }));
    expect(markup).toContain('Mon, 16 Nov');
    expect(markup).toContain('disabled=""');
  });
  it('keeps sheet overlays in progress and checklist, without inventing timestamps', () => {
    const items = [{ id: 'one', day: '2026-11-15', title: 'Arrays', plannedMinutes: 40, solvedOnSheet: true }];
    expect(studyProgress(items)).toEqual({ total: 1, done: 1, minutes: 40, complete: true });
    expect(studyChecklistDays(items)[0].items[0]).toMatchObject({ id: 'one', done: true, disabled: true });
    expect(items[0].doneAt).toBeUndefined();
  });
  it('resolves virtual reviews to their original item, never another occurrence', () => {
    const items = [{ id: 'one', key: 'part1' }, { id: 'two', key: 'part2' }];
    expect(resolveStudyItem({ items }, { key: 'review:part2', originalKey: 'part2' }).id).toBe('two');
  });
  it('deduplicates split practice, prioritizes stars and leaves saved reviews unchanged', () => {
    const items = [
      { id: '1', ref: 'dsa:a', link: 'a', type: 'dsa', doneAt: 'saved', plannedMinutes: 20, nextReviewDay: '2026-11-20' },
      { id: '2', ref: 'dsa:a', link: 'a', type: 'dsa', doneAt: 'saved', plannedMinutes: 30 },
      { id: '3', ref: 'notes:os:x', type: 'notes', solvedOnSheet: true, plannedMinutes: 10, starred: true },
      { id: '4', type: 'mock', doneAt: 'saved', plannedMinutes: 60 },
    ];
    const before = JSON.stringify(items);
    const round = revisionRoundItems(items);
    expect(round.map((item) => item.ref)).toEqual(['notes:os:x', 'dsa:a']);
    expect(round[1].plannedMinutes).toBe(50);
    expect(JSON.stringify(items)).toBe(before);
  });
  it('pulls only tomorrow work within free room, move limits and study-day rules', () => {
    const task = { id: '1', day: '2026-11-16', plannedDay: '2026-11-16', plannedMinutes: 30, type: 'dsa' };
    const plan = { hoursByWeekday: [2, 2, 2, 2, 2, 2, 2], lighterDays: [], restDay: null, items: [task] };
    const today = { date: '2026-11-15', isToday: true, items: [], minutes: 60 };
    expect(pullForwardItem(plan, today)).toBe(task);
    expect(pullForwardItem(plan, { ...today, minutes: 100 })).toBeNull();
    expect(pullForwardItem(plan, { ...today, items: [{ type: 'review' }] })).toBeNull();
    expect(pullForwardItem({ ...plan, restDay: 6 }, today)).toBeNull();
    expect(pullForwardItem({ ...plan, items: [{ ...task, locked: true }] }, today)).toBeNull();
    expect(pullForwardItem({ ...plan, items: [{ ...task, plannedDay: '2026-11-20' }] }, today)).toBeNull();
    expect(pullForwardItem(plan, { ...today, isToday: false, date: '2026-11-16', minutes: 100 }, '2026-11-15')).toBe(task);
    const doneToday = { day: '2026-11-15', doneAt: 'saved', plannedMinutes: 90 };
    expect(pullForwardItem({ ...plan, items: [doneToday, task] }, { ...today, minutes: 0 })).toBeNull();
    expect(pullForwardItem({ ...plan, items: [{ ...doneToday, nextReviewDay: '2026-11-15' }, task] }, { ...today, minutes: 0 })).toBeNull();
    const carried = { day: '2026-11-14', plannedMinutes: 20 };
    expect(pullForwardItem({ ...plan, items: [{ ...doneToday, plannedMinutes: 60 }, task] }, { ...today, items: [carried], minutes: 20 })).toBeNull();
  });
});

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
