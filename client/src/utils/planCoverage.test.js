import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import PlanCoverage from '../components/plan/PlanCoverage';
import {
  defaultSettings, itemGroup, paceMinutes, planBody, planDays, planFormErrors, readPlanSettings, writePlanSettings,
} from './planBuilder';
import { coverageLists, formatPlanDate, formatPlanMinutes } from './planFormat';
import { weekSummary } from './studyPlan';
import { MemoryRouter } from 'react-router-dom';
import PlanPreview from '../components/plan/PlanPreview';
import PlanBuilderForm from '../components/plan/PlanBuilderForm';
import StudyStart from '../components/plan/StudyStart';
import choices from '../data/planChoices.json';

describe('Phase 1 clear previews and roadmap tasks', () => {
  it('explains an unsaveable preview and lets an existing user check saved progress', () => {
    const builder = { valid:true, previewReady:true, options:choices, errors:{}, userId:null,
      preview:{data:{coverage:{plannedMinutes:600,syllabusMinutes:600,leftOutCount:0},week1:{items:[]},deadline:'2027-01-01',finishDate:null,notices:[],pace:'standard',saveEligibility:{allowed:false,reason:'This plan exceeds the item limit.'}}} };
    const markup = renderToStaticMarkup(createElement(MemoryRouter,null,createElement(PlanPreview,{builder})));
    expect(markup).toContain('This plan exceeds the item limit.');
    expect(markup).toContain('Sign in to check your saved progress');
    expect(markup).not.toContain('Your material fits before');
  });
  it('removes the ineffective style choice from role plans and normalizes shared old settings', () => {
    const settings = {...defaultSettings(),goalType:'role',style:'mixed'};
    const markup = renderToStaticMarkup(createElement(PlanBuilderForm,{settings,options:choices,errors:{},onChange:()=>{},onGenerate:()=>{}}));
    expect(markup).not.toContain('How do you like to study?');
    expect(markup).toContain('Roadmap topics stay in order');
    expect(planBody(settings).style).toBe('one-topic');
    expect(planBody({...settings,goalType:'placements'}).style).toBe('mixed');
  });
  it('shows the milestone objective in task detail without adding controls to Today', () => {
    const item = {id:'a',key:'a',type:'roadmap',ref:'roadmap:frontend',title:'Practise: DNS',objective:'Work through a small example from the linked material.'};
    const markup = renderToStaticMarkup(createElement(MemoryRouter,null,createElement(StudyStart,{item,plan:{items:[item]},onBack:()=>{},onFinish:()=>{}})));
    expect(markup).toContain(item.objective);
    expect(markup).toContain('Complete this task');
  });
});

describe('plan dates and times in plain words', () => {
  it('shows the weekday and date, with the year when asked', () => {
    expect(formatPlanDate('2026-11-16')).toBe('Mon, 16 Nov');
    expect(formatPlanDate('2027-01-17', true)).toBe('Sun, 17 Jan 2027');
  });
  it('shows hours and minutes', () => {
    expect([0, 40, 60, 110, 166].map(formatPlanMinutes)).toEqual(['0 min', '40 min', '1 h', '1 h 50 min', '2 h 46 min']);
  });
});

describe('the day line and the group of a task', () => {
  const dsa = (over) => ({ day: '2026-11-16', type: 'dsa', title: 'Pascal\'s Triangle', topicTitle: 'Arrays - I', plannedMinutes: 40, ...over });
  it('names the day and totals its tasks, with "task" for one', () => {
    const days = planDays([dsa(), dsa({ title: 'Set Matrix Zeros', plannedMinutes: 70 }), dsa({ day: '2026-11-17' })]);
    expect(days.map((d) => [d.label, d.focus])).toEqual([['Mon, 16 Nov', '2 tasks · 1 h 50 min'], ['Tue, 17 Nov', '1 task · 40 min']]);
    expect(days[0].items[0]).toMatchObject({ minutes: 40, group: 'Arrays' });
  });
  it('puts a topic with a Roman numeral, a subject, a mock and a behavioral question in their own groups', () => {
    expect(itemGroup(dsa())).toBe('Arrays');
    expect(itemGroup(dsa({ topicTitle: 'Binary Search' }))).toBe('Binary Search');
    expect(itemGroup({ type: 'notes', subject: 'os' })).toBe('Operating Systems');
    expect(itemGroup({ type: 'notes', subject: 'oops' })).toBe('OOP in Java');
    expect(itemGroup({ type: 'notes', subject: 'unknown' })).toBe('CS notes');
    expect(itemGroup({ type: 'mock' })).toBe('Mock interview');
    expect(itemGroup({ type: 'behavioral' })).toBe('Behavioral questions');
    expect(itemGroup({ type: 'dsa', title: 'Two Sum' })).toBe('Two Sum');
  });
  it('sums a closed week and lists the three groups with the most time first', () => {
    const week = (groups) => ({ days: [{ items: groups.map((group, k) => ({ minutes: 30 + k, group })) }] });
    expect(weekSummary(week(['Arrays', 'Arrays', 'Hashing']))).toBe('1 h 33 min · Arrays, Hashing');
    expect(weekSummary(week(['A', 'B', 'C', 'D', 'E']))).toBe('2 h 40 min · E, D, C and 2 more');
    expect(weekSummary({ days: [{ items: [{ minutes: 20 }] }] })).toBe('20 min');
    expect(weekSummary({ days: [] })).toBe('0 min');
  });
});

describe('my pace in the builder', () => {
  it('is standard by default, in the link, and in the request', () => {
    expect(defaultSettings().pace).toBe('standard');
    expect(readPlanSettings('').pace).toBe('standard');
    expect(planBody(defaultSettings()).pace).toBe('standard');
  });
  it('comes back from a shared link and survives writing it out', () => {
    const settings = { ...defaultSettings(), pace: 'slower' };
    const link = writePlanSettings(settings);
    expect(link).toContain('pace=slower');
    expect(readPlanSettings(link).pace).toBe('slower');
    expect(planBody(readPlanSettings(link))).toEqual(planBody(settings));
  });
  it('refuses a pace that does not exist, and a link with one is kept for the form to explain', () => {
    expect(readPlanSettings('pace=turbo').pace).toBe('turbo');
    expect(planFormErrors({ ...defaultSettings(), pace: 'turbo' }, null).pace).toMatch(/how fast/);
    expect(planFormErrors(defaultSettings(), null).pace).toBeUndefined();
  });
  it('shows the Medium time for each pace', () => {
    expect(['faster', 'standard', 'slower'].map(paceMinutes)).toEqual([42, 70, 98]);
    expect(paceMinutes('anything')).toBe(70);
  });
});

describe('the list of what a plan leaves out', () => {
  const groups = [
    { label: 'Arrays', kind: 'dsa', total: 24, placed: 14, state: 'part' },
    { label: 'Dynamic Programming', kind: 'dsa', total: 22, placed: 0, state: 'none' },
    { label: 'Computer Networks', kind: 'notes', total: 10, placed: 0, state: 'none' },
    { label: 'Operating Systems', kind: 'notes', total: 11, placed: 6, state: 'part' },
    { label: 'Graph', kind: 'dsa', total: 5, placed: 5, state: 'all' },
  ];
  it('splits the groups into not in the plan and only some', () => {
    const { none, part } = coverageLists(groups);
    expect(none.map((g) => g.label)).toEqual(['Dynamic Programming', 'Computer Networks']);
    expect(part.map((g) => g.label)).toEqual(['Arrays', 'Operating Systems']);
    expect(coverageLists(undefined)).toEqual({ none: [], part: [] });
  });
  it('names them in plain words, with problems for DSA and sections for subjects, and leaves out what is complete', () => {
    const html = renderToStaticMarkup(createElement(PlanCoverage, { byGroup: groups }));
    expect(html).toContain('Not in your plan:');
    expect(html).toContain('Dynamic Programming, Computer Networks.');
    expect(html).toContain('Arrays (14 of 24 problems)');
    expect(html).toContain('Operating Systems (6 of 11 sections)');
    expect(html).not.toContain('Graph');
  });
  it('shows nothing when everything is in, or when an older plan has no list', () => {
    expect(renderToStaticMarkup(createElement(PlanCoverage, { byGroup: [groups[4]] }))).toBe('');
    expect(renderToStaticMarkup(createElement(PlanCoverage, { byGroup: undefined }))).toBe('');
    expect(renderToStaticMarkup(createElement(PlanCoverage, { byGroup: [] }))).toBe('');
  });
});
