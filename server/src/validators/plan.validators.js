const { z } = require('zod');
const { GOALS, STYLES, dayNumber } = require('../services/planGenerator');
const { SUBJECTS } = require('../services/planData');
const { PLAN_MIN_WEEKS, PLAN_MAX_WEEKS, PLAN_MIN_DAILY_HOURS, PLAN_MAX_DAILY_HOURS, PLAN_TITLE_MAX, PLAN_CUSTOM_ITEM_MAX } = require('../config/limits');

// The My plan form. The form asks for hours on a weekday and on a weekend day plus a rest day; the controller turns that into hours for each weekday.
const date = (what) => z.string({ error: `${what} is required` }).regex(/^\d{4}-\d{2}-\d{2}$/, `${what} must look like 2026-11-13`).refine((s) => !Number.isNaN(dayNumber(s)), `${what} must be a real date`);
const hours = (what) => z.number({ error: `${what} must be a number of hours` }).refine((h) => h === 0 || (h >= PLAN_MIN_DAILY_HOURS && h <= PLAN_MAX_DAILY_HOURS), `${what} must be 0 or from ${PLAN_MIN_DAILY_HOURS} to ${PLAN_MAX_DAILY_HOURS}`);
const slug = (what) => z.string({ error: `${what} must be text` }).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, `${what} is not valid`).max(40, `${what} is not valid`);

const formShape = {
  goalType: z.enum(GOALS, { error: `goalType must be one of ${GOALS.join(', ')}` }),
  style: z.enum(STYLES, { error: `style must be one of ${STYLES.join(', ')}` }).default('one-topic'),
  startDate: date('Start date').optional(),
  weeks: z.number({ error: 'Weeks must be a whole number' }).int('Weeks must be a whole number').min(PLAN_MIN_WEEKS, `Weeks must be from ${PLAN_MIN_WEEKS} to ${PLAN_MAX_WEEKS}`).max(PLAN_MAX_WEEKS, `Weeks must be from ${PLAN_MIN_WEEKS} to ${PLAN_MAX_WEEKS}`),
  weekdayHours: hours('Weekday hours'),
  weekendHours: hours('Weekend hours'),
  restDay: z.number({ error: 'Rest day must be a weekday number' }).int().min(0, 'Rest day must be from 0 (Monday) to 6 (Sunday)').max(6, 'Rest day must be from 0 (Monday) to 6 (Sunday)').nullable().default(null),
  sheetSlug: slug('Sheet').optional(),
  roadmapSlug: slug('Roadmap').optional(),
  subjects: z.array(z.enum(SUBJECTS, { error: `Subjects must be from ${SUBJECTS.join(', ')}` })).max(SUBJECTS.length, 'Too many subjects').optional(),
  knownTopics: z.array(z.string().trim().min(1).max(80, 'A topic id is too long')).max(80, 'Too many topics marked as known').default([]),
};
const previewPlanSchema = z.object(formShape);
const createPlanSchema = z.object({
  ...formShape,
  title: z.string({ error: 'Title must be text' }).trim().max(PLAN_TITLE_MAX, `Title must be at most ${PLAN_TITLE_MAX} characters`).optional(),
  targetRole: z.string({ error: 'Target role must be text' }).trim().max(PLAN_TITLE_MAX, `Target role must be at most ${PLAN_TITLE_MAX} characters`).optional(),
  replace: z.boolean({ error: 'replace must be true or false' }).default(false),
});

// A change to a saved plan: rebuild from today, new hours (the same two numbers and rest day as the form), or lighter days. The apply call adds the checksum
// of the preview it was made from, so only a previewed change can be applied.
const changeShape = {
  type: z.enum(['rebuild', 'hours', 'lighter'], { error: 'type must be rebuild, hours or lighter' }),
  weekdayHours: hours('Weekday hours').optional(),
  weekendHours: hours('Weekend hours').optional(),
  restDay: formShape.restDay.optional(),
  lighterDays: z.array(z.object({ from: date('From'), to: date('To'), hours: hours('Hours') })).max(10, 'Too many lighter stretches').optional(),
};
const checkChange = (c, ctx) => {
  if (c.type === 'hours' && (c.weekdayHours === undefined || c.weekendHours === undefined)) ctx.addIssue({ code: 'custom', message: 'New hours need weekdayHours and weekendHours', path: ['weekdayHours'] });
  if (c.type === 'lighter' && !c.lighterDays) ctx.addIssue({ code: 'custom', message: 'lighterDays is required', path: ['lighterDays'] });
};
const previewChangeSchema = z.object(changeShape).superRefine(checkChange);
const applyChangeSchema = z.object({ ...changeShape, checksum: z.string({ error: 'checksum is required' }).regex(/^[0-9a-f]{16}$/, 'checksum is not valid') }).superRefine(checkChange);

// Phase 4: items and review validators
const updateItemSchema = z.object({
  done: z.boolean({ error: 'done must be true or false' }).optional(),
  result: z.enum(['alone', 'hints', 'solution'], { error: 'result must be alone, hints or solution' }).optional(),
  quizScore: z.number().int().min(0, 'quizScore must be from 0 to 5').max(5, 'quizScore must be from 0 to 5').optional(),
  day: date('Day').optional(),
  plannedMinutes: z.number({ error: 'plannedMinutes must be a number' }).int().min(1, 'plannedMinutes must be at least 1').max(360, 'plannedMinutes must be at most 360').optional(),
}).refine((b) => b.done !== undefined || b.day !== undefined || b.plannedMinutes !== undefined || b.result !== undefined || b.quizScore !== undefined, {
  message: 'At least one field (done, day, plannedMinutes, result, quizScore) must be provided',
});

const addItemSchema = z.object({
  title: z.string({ error: 'title is required' }).trim().min(1, 'title cannot be empty').max(PLAN_CUSTOM_ITEM_MAX, `title must be at most ${PLAN_CUSTOM_ITEM_MAX} characters`),
  plannedMinutes: z.number({ error: 'plannedMinutes is required' }).int().min(1, 'plannedMinutes must be at least 1').max(360, 'plannedMinutes must be at most 360'),
  day: date('Day'),
});

const recordResultSchema = z.object({
  result: z.enum(['alone', 'hints', 'solution'], { error: 'result must be alone, hints or solution' }).optional(),
  quizScore: z.number().int().min(0, 'quizScore must be from 0 to 5').max(5, 'quizScore must be from 0 to 5').optional(),
}).refine((b) => (b.result !== undefined && b.quizScore === undefined) || (b.result === undefined && b.quizScore !== undefined), {
  message: 'Provide either result (for DSA/other) or quizScore (for notes), not both',
});

const recordReviewSchema = z.object({
  passed: z.boolean({ error: 'passed must be true or false' }),
});

const weeklyReviewQuerySchema = z.object({
  weekStart: date('weekStart').optional(),
});

module.exports = {
  previewPlanSchema,
  createPlanSchema,
  previewChangeSchema,
  applyChangeSchema,
  updateItemSchema,
  addItemSchema,
  recordResultSchema,
  recordReviewSchema,
  weeklyReviewQuerySchema,
};
