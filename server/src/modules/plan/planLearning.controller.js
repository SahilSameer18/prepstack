const { z } = require('zod');
const Plan = require('./plan.model');
const { findActivePlan, toStored, solvedLinksFor } = require('./plan.controller');
const { getPlanData } = require('./planData');
const learning = require('./planLearning');
const { calendarSettings, studyDay } = require('../../shared/calendar/studyCalendar');
const { planClock } = require('../../shared/calendar/clock');
const AppError = require('../../shared/http/AppError');
const { sendSuccess } = require('../../shared/http/responseFormatter');

const checkSchema = z.object({
  id: z.enum(['foundation', 'role', 'notes']),
  outcome: z.enum(['independent', 'help', 'skipped']).optional(),
  itemId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  quizScore: z.number().int().min(0).max(5).optional(),
}).refine((body) => body.id === 'notes'
  ? !!body.itemId && body.quizScore !== undefined && body.outcome === undefined
  : !!body.outcome && body.itemId === undefined && body.quizScore === undefined,
{ message: 'Choose a starting-check answer or provide the section quiz result.' });
const choiceSchema = z.object({ offerId: z.string().min(1).max(700) });
const applySchema = choiceSchema.extend({ checksum: z.string().regex(/^[a-f0-9]{32}$/) });
const practiceSchema = z.object({
  familiar: z.boolean(), independent: z.boolean(), explained: z.boolean(), tested: z.boolean(),
  effort: z.enum(['less', 'about', 'more']).optional(),
});

async function context(req, editable = true) {
  const doc = await findActivePlan(req.user, editable);
  const data = getPlanData();
  const solvedLinks = await solvedLinksFor(req.user._id, doc, data);
  const day = studyDay(planClock.now(), calendarSettings(req.user));
  return { doc, data, solvedLinks, day };
}

// Every response is private, including refused changes and starting checks.
function handler(action) {
  return async (req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    try {
      return sendSuccess(res, 200, 'Learning plan updated', await action(req));
    } catch (error) {
      return next(error.name === 'PlanInputError' ? new AppError(422, error.messages[0]) : error);
    }
  };
}

async function save(doc, user, fields) {
  const saved = await Plan.findOneAndUpdate(
    { _id: doc._id, user: user._id, status: 'active', updatedAt: doc.updatedAt, __v: doc.__v },
    { $set: fields, $inc: { __v: 1 } }, { returnDocument: 'after', runValidators: true },
  );
  if (!saved) throw new AppError(409, 'Your plan changed. Refresh it and preview again.');
  return saved;
}

const getLearning = handler(async (req) => {
  const { doc, data, solvedLinks } = await context(req, false);
  return {
    checks: learning.startingChecks(doc), results: doc.startingChecks,
    offers: learning.recommendations(doc, data, solvedLinks),
    attempts: doc.learningAttempts.length,
    note: 'Optional self-checks. These do not establish interview readiness or automatically skip your lessons.',
  };
});

const saveCheck = handler(async (req) => {
  const { doc } = await context(req);
  const check = learning.startingChecks(doc).find((entry) => entry.id === req.body.id);
  const note = req.body.id === 'notes' && doc.items.find((entry) => String(entry._id) === req.body.itemId && entry.type === 'notes');
  if (!check && !note) throw new AppError(422, 'This check is not available for your plan.');
  const results = doc.startingChecks.map((entry) => entry.toObject()).filter((entry) => entry.id !== req.body.id);
  const outcome = note ? (req.body.quizScore >= 4 ? 'independent' : 'help') : req.body.outcome;
  results.push({ id: req.body.id, outcome, quizScore: req.body.quizScore, ref: note?.ref, at: planClock.now() });
  await save(doc, req.user, { startingChecks: results });
  return { results };
});

async function makePreview(req) {
  const contextValue = await context(req);
  const { doc, data, solvedLinks, day } = contextValue;
  const offer = learning.recommendations(doc, data, solvedLinks).find((entry) => entry.id === req.body.offerId);
  if (!offer) throw new AppError(409, 'This suggestion is no longer available. Refresh your plan.');
  const stored = toStored(doc);
  stored.input.solvedLinks = solvedLinks;
  return { ...contextValue, preview: learning.previewLearning(stored, data, day, offer) };
}

const previewLearning = handler(async (req) => {
  const { preview } = await makePreview(req);
  return { offer: preview.offer, tasks: preview.tasks, diff: preview.diff, checksum: preview.checksum };
});

const applyLearning = handler(async (req) => {
  const { doc, preview } = await makePreview(req);
  if (req.body.checksum !== preview.checksum) throw new AppError(409, 'Your plan or progress changed. Preview this suggestion again.');
  const fields = {
    items: preview.plan.items, coverage: preview.plan.coverage, notices: preview.plan.notices,
    solvedLinks: preview.plan.input.solvedLinks, estimateFactors: preview.plan.input.estimateFactors || {},
  };
  if (preview.offer.kind === 'estimate') {
    fields.estimateUpdatedAt = { ...doc.estimateUpdatedAt?.toObject(), [preview.offer.type]: planClock.now() };
  }
  await save(doc, req.user, fields);
  return { applied: true };
});

// Extra practice never marks a sheet problem solved. Its rubric is kept as
// self-reported evidence, separate from original completions and review dates.
const finishPractice = handler(async (req) => {
  const { doc, day } = await context(req);
  const item = doc.items.find((entry) => String(entry._id) === req.params.id && entry.learningKind);
  if (!item) throw new AppError(404, 'Practice not found in your active plan.');
  if (item.doneAt || item.skipped) throw new AppError(422, 'This practice is already finished or skipped.');
  const response = req.body;
  item.doneAt = planClock.now();
  item.completedStudyDay = day;
  const independent = response.independent && response.explained && response.tested;
  const attempts = learning.attemptLog(doc, item, { ...response, result: independent ? 'alone' : 'hints' }, day, planClock.now(), 'practice');
  const event = attempts.at(-1);
  if (item.learningKind === 'transfer' && response.familiar && independent) event.outcome = 'familiar';
  await save(doc, req.user, { items: doc.items.toObject(), learningAttempts: attempts });
  return { saved: true };
});

module.exports = { getLearning, saveCheck, previewLearning, applyLearning, finishPractice,
  checkSchema, choiceSchema, applySchema, practiceSchema };
