const crypto = require('crypto');
const { calendarSettings, studyDay, nextStudyBoundary } = require('../utils/studyCalendar');
const mongoose = require('mongoose');
const Plan = require('../models/plan.model');
const Progress = require('../models/progress.model');
const { problemIdentity, normalizedSolves } = require('../utils/problemIdentity');
const { writeProblemProgress } = require('../services/problemProgress');
const { alternativeResources, substituteOptions } = require('../services/problemResources');
const Report = require('../models/interviewReport.model');
const { prepareReportImport } = require('../services/planReport');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');
const gen = require('../services/planGenerator');
const adj = require('../services/planAdjust');
const { getPlanData, getPlanChoices, planClock } = require('../services/planData');
const { PLAN_MAX_ITEMS, PLAN_MAX_FINISHED, PLAN_MAX_START_DAYS_AHEAD } = require('../config/limits');

const GOAL_TITLES = { placements: 'Placement prep', role: 'Role switch', bigtech: 'Big-tech SDE interview' };
const MAX_SOLVED_LINKS = 1500;

// Public builder choices only: no user data, problem lists or generated schedules.
const getPlanOptions = (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Plan choices fetched', getPlanChoices());
  } catch (error) {
    return next(error);
  }
};

const today = (req) => studyDay(planClock.now(), calendarSettings(req?.user));
const weekdayHours = (b) => [b.weekdayHours, b.weekdayHours, b.weekdayHours, b.weekdayHours, b.weekdayHours, b.weekendHours, b.weekendHours];

// Private saves use the account's study clock; public previews can supply the
// same calendar without exposing or modifying any account preferences.
const toInput = (body, user) => {
  const calendar = user ? calendarSettings(user) : body.calendar || calendarSettings();
  const currentDay = studyDay(planClock.now(), calendar);
  const t = gen.dayNumber(currentDay);
  const start = body.startDate ?? currentDay;
  const s = gen.dayNumber(start);
  if (s < t - 1 || s > t + PLAN_MAX_START_DAYS_AHEAD) {
    throw new AppError(422, `The start date must be from yesterday to ${PLAN_MAX_START_DAYS_AHEAD} days from today`);
  }
  return {
    goalType: body.goalType, style: body.style, startDate: start, weeks: body.weeks,
    hoursByWeekday: weekdayHours(body), restDay: body.restDay,
    sheetSlug: body.sheetSlug, roadmapSlug: body.roadmapSlug,
    subjects: body.subjects, knownTopics: body.knownTopics, pace: body.pace,
  };
};
// A rule the generator checks (for example a sheet that does not exist) becomes a 422 with its own words.
const asAppError = (e) => (e instanceof gen.PlanInputError ? new AppError(422, e.messages[0], e.messages.map((message) => ({ field: '', message }))) : e);

// What the user has already solved, limited to the sheets this plan uses, so a plan does not schedule it again.
const solvedLinksFor = async (userId, input, data) => {
  const docs = await Progress.find({ user: userId }).select('solvedProblems.link').lean();
  const solved = new Set(docs.flatMap((d) => (d.solvedProblems || []).map((p) => problemIdentity(p.link))));
  const sheets = input.goalType === 'role' ? Object.values(data.sheets) : [data.sheets[input.sheetSlug]].filter(Boolean);
  const inPlan = new Set(sheets.flatMap((s) => s.topics.flatMap((t) => t.problems.map((p) => problemIdentity(p.link)))));
  return [...solved].filter((l) => inPlan.has(l)).slice(0, MAX_SOLVED_LINKS);
};

// Storage ordinals keep occurrence keys unique through rebuilds. Display ordinals describe only
// surviving parts, without changing saved completions or using a Today subset as the total.
const partLabels = (items) => {
  const groups = new Map();
  for (const it of items) {
    if (!it.part) continue;
    const id = gen.baseId(it);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(it);
  }
  const labels = new Map();
  for (const parts of groups.values()) {
    parts.sort((a, b) => a.part.n - b.part.n);
    parts.forEach((it, i) => labels.set(it.key, { n: i + 1, of: parts.length }));
  }
  return labels;
};
const presentItem = (it, labels) => ({
  id: it._id ? String(it._id) : null, key: it.key ?? null, originalKey: it.originalKey ?? null, type: it.type, ref: it.ref ?? null, link: it.link ?? null, title: it.title,
  plannedMinutes: it.plannedMinutes, day: it.day ?? null, plannedDay: it.plannedDay ?? it.day ?? null, stepId: it.stepId ?? null,
  alternatives: alternativeResources(it.link), replacesKey: it.replacesKey ?? null,
  part: labels?.get(it.key) ?? it.part ?? null, source: it.source ?? 'planner', core: it.core ?? true, sheet: it.sheet ?? null,
  topicId: it.topicId ?? null, topicTitle: it.topicTitle ?? null, subject: it.subject ?? null, difficulty: it.difficulty ?? null,
  starred: !!it.starred, locked: !!it.locked, skipped: !!it.skipped, result: it.result ?? null, quizScore: it.quizScore ?? null, doneAt: it.doneAt ?? null, completedStudyDay: it.completedStudyDay ?? null,
  reviewStage: it.reviewStage ?? null, nextReviewDay: it.nextReviewDay ?? null, dueDay: it.dueDay ?? null, failed: it.failed ?? undefined, solvedOnSheet: !!it.solvedOnSheet,
});
const presentPlan = (doc) => {
  const labels = partLabels(doc.items);
  return {
    id: String(doc._id), goalType: doc.goalType, style: doc.style, title: doc.title, targetRole: doc.targetRole, status: doc.status, sheetSlug: doc.sheetSlug, roadmapSlug: doc.roadmapSlug,
    subjects: doc.subjects, pace: doc.pace || 'standard', knownTopics: doc.knownTopics, weeks: doc.weeks, startDate: doc.startDate, deadline: doc.deadline, hoursByWeekday: doc.hoursByWeekday, restDay: doc.restDay,
    lighterDays: doc.lighterDays, coverage: doc.coverage, notices: doc.notices, createdAt: doc.createdAt, updatedAt: doc.updatedAt, items: doc.items.map((it) => presentItem(it, labels)),
  };
};
const presentView = (v, allItems) => {
  const labels = partLabels(allItems);
  return { ...v, items: v.items.map((it) => presentItem(it, labels)), startItem: v.startItem ? presentItem(v.startItem, labels) : null };
};

// A saved plan in the shape the generator and the adjust module work on.
const toStored = (doc) => {
  const o = doc.toObject();
  return {
    input: { goalType: o.goalType, style: o.style, startDate: o.startDate, weeks: o.weeks, hoursByWeekday: o.hoursByWeekday, restDay: o.restDay, sheetSlug: o.sheetSlug, roadmapSlug: o.roadmapSlug, subjects: o.subjects, pace: o.pace || 'standard', knownTopics: o.knownTopics, solvedLinks: o.solvedLinks, lighterDays: o.lighterDays, originReport: o.originReport, pausedDays: o.totalPausedDays || 0 },
    startDate: o.startDate, deadline: o.deadline, items: o.items, coverage: o.coverage, revision: o.updatedAt,
  };
};

// POST /api/plan/preview   (no login, no database write, its own limiter per IP)
// The numbers and week 1 only: the other weeks appear after login.
const previewPlan = (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Preview made', gen.previewPlan(toInput(req.body), getPlanData()));
  } catch (error) {
    return next(asAppError(error));
  }
};

// GET /api/plan
const getPlan = async (req, res, next) => {
  try {
    const settings = calendarSettings(req.user);
    const now = planClock.now();
    const calendar = { ...settings, today: studyDay(now, settings), nextRollover: nextStudyBoundary(now, settings) };
    const paused = await Plan.find({ user: req.user._id, status: 'paused' }).select('title deadline pausedAtDay').lean();
    const pausedPlans = paused.map((plan) => ({ id: String(plan._id), title: plan.title, deadline: plan.deadline, pausedAtDay: plan.pausedAtDay }));
    const doc = await Plan.findOne({ user: req.user._id, status: 'active' });
    if (!doc) return sendSuccess(res, 200, 'No active plan', { plan: null, today: null, finished: false, calendar, pausedPlans });
    // a problem solved on its sheet (not through the plan) counts as done here: it leaves Today and the on-track numbers, and the page can show it done
    const solved = await solvedOnSheets(req.user._id, doc);
    const stored = toStored(doc);
    stored.items = withSheetSolves(stored.items, solved);
    const plan = presentPlan(doc);
    plan.items = plan.items.map((it) => ({ ...it, solvedOnSheet: it.type === 'dsa' && !it.doneAt && solved.has(problemIdentity(it.link)) }));
    return sendSuccess(res, 200, 'Plan fetched successfully', { plan, today: presentView(adj.todayView(stored, today(req)), stored.items), calendar, pausedPlans, finished: doc.deadline < today(req) });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan   body: the form (+ title, targetRole, replace)
// One active plan per user. A plan whose deadline has passed is finished automatically; another one needs `replace: true`, which keeps the old plan as history.
const createPlan = async (req, res, next) => {
  try {
    const data = getPlanData();
    const input = toInput(req.body, req.user);
    const existing = await Plan.findOne({ user: req.user._id, status: 'active' });
    if (existing && existing.deadline >= today(req) && !req.body.replace) return next(new AppError(409, 'You already have an active plan. Replace it or delete it first.'));

    input.solvedLinks = await solvedLinksFor(req.user._id, input, data);
    let plan;
    try {
      plan = gen.generatePlan(input, data);
    } catch (error) {
      return next(asAppError(error));
    }
    if (plan.items.length > PLAN_MAX_ITEMS) return next(new AppError(422, `This plan would have ${plan.items.length} items and the most is ${PLAN_MAX_ITEMS}. Choose fewer weeks, fewer subjects or a smaller sheet.`));
    if (!plan.coverage.syllabusItems) return next(new AppError(422, 'There is nothing to plan: every problem on this sheet is already solved or marked as known.'));

    let archived = null;
    if (existing) {
      archived = await Plan.findOneAndUpdate(
        { _id: existing._id, user: req.user._id, status: 'active', updatedAt: existing.updatedAt },
        { $set: { status: 'finished' } }, { returnDocument: 'after' },
      );
      if (!archived) throw new AppError(409, 'Your plan changed. Refresh before replacing it.');
    }
    let doc;
    try {
      doc = await Plan.create({
        user: req.user._id, goalType: input.goalType, style: input.style, title: req.body.title || `${GOAL_TITLES[input.goalType]}, ${input.weeks} weeks`, targetRole: req.body.targetRole || '',
        sheetSlug: input.sheetSlug || null, roadmapSlug: input.roadmapSlug || null, subjects: plan.input.subjects, pace: plan.input.pace, knownTopics: input.knownTopics, solvedLinks: input.solvedLinks,
        weeks: input.weeks, startDate: input.startDate, deadline: plan.deadline, hoursByWeekday: input.hoursByWeekday, restDay: input.restDay, lighterDays: [],
        coverage: plan.coverage, notices: plan.notices, items: plan.items,
      });
    } catch (error) {
      // Restore only the snapshot this request archived. A concurrent pause or
      // replacement must never be overwritten by failure compensation.
      if (archived) {
        try {
          await Plan.updateOne({ _id: archived._id, user: req.user._id, status: 'finished', updatedAt: archived.updatedAt }, { $set: { status: 'active' } });
        } catch (restoreError) {
          if (restoreError.code !== 11000) throw restoreError;
        }
      }
      if (error.code === 11000) return next(new AppError(409, 'You already have an active plan. Replace it or delete it first.'));
      throw error;
    }
    const old = await Plan.find({ user: req.user._id, status: 'finished' }).sort({ createdAt: -1 }).skip(PLAN_MAX_FINISHED).select('_id').lean();
    if (old.length) await Plan.deleteMany({ _id: { $in: old.map((p) => p._id) }, user: req.user._id });
    return sendSuccess(res, 201, 'Plan created successfully', { plan: presentPlan(doc), today: presentView(adj.todayView(toStored(doc), today(req)), doc.items) });
  } catch (error) {
    return next(error);
  }
};

// Load only an owned report and derive its changes on the server. The checksum
// binds consent to the report, current plan, mode and account study day.
async function reportImportContext(req) {
  if (!mongoose.isObjectIdOrHexString(req.params.reportId)) throw new AppError(404, 'Report not found');
  const [report, current] = await Promise.all([
    Report.findOne({ _id: req.params.reportId, user: req.user._id }).lean(),
    Plan.findOne({ user: req.user._id, status: 'active' }),
  ]);
  if (!report) throw new AppError(404, 'Report not found');
  if (!Number.isInteger(report.days) || report.days < 1 || report.days > 364) throw new AppError(422, 'This report has no valid study period.');
  const mode = req.body.mode;
  const day = today(req);
  if (current && current.deadline < day && mode === 'merge') {
    throw new AppError(409, 'This plan has finished. Choose Replace to start a new report plan.');
  }
  const result = prepareReportImport(report, current?.toObject(), mode, day, getPlanData());
  if (!result.added.length) throw new AppError(422, 'No new tasks to add. Completed or already scheduled material was left out.');
  if (result.plan.items.length > PLAN_MAX_ITEMS) throw new AppError(422, `This would exceed ${PLAN_MAX_ITEMS} plan items. Remove tasks or replace the plan.`);
  const checksum = crypto.createHash('sha256').update(JSON.stringify({
    user: String(req.user._id), report, current: current?.toObject() || null, mode, day, result,
  })).digest('hex').slice(0, 32);
  return { current, result, checksum, mode };
}

const previewReportImport = async (req, res, next) => {
  try {
    const { current, result, checksum, mode } = await reportImportContext(req);
    return sendSuccess(res, 200, 'Report import preview', {
      checksum, mode, createsPlan: !current || mode === 'replace',
      title: result.plan.title, startDate: result.plan.startDate, deadline: result.plan.deadline,
      hoursByWeekday: result.plan.hoursByWeekday, restDay: result.plan.restDay,
      addedCount: result.added.length, omittedCount: result.omitted,
      doneProtected: current?.items.filter((item) => item.doneAt).length || 0,
      overloadMinutes: result.overloads.reduce((sum, entry) => sum + entry.minutes, 0),
      overloads: result.overloads, items: result.added.map((item) => presentItem(item)),
    });
  } catch (error) { return next(asAppError(error)); }
};

// Merge is one conditional document update. Replacement validates before
// archiving and restores the old plan if saving its replacement fails.
const applyReportImport = async (req, res, next) => {
  try {
    const { current, result, checksum, mode } = await reportImportContext(req);
    if (checksum !== req.body.checksum) throw new AppError(409, 'The report or plan changed. Preview again before saving.');
    let saved;
    if (current && mode === 'merge') {
      saved = await Plan.findOneAndUpdate(
        { _id: current._id, user: req.user._id, status: 'active', updatedAt: current.updatedAt },
        { $set: { items: result.plan.items, coverage: result.plan.coverage, notices: result.plan.notices } },
        { returnDocument: 'after', runValidators: true },
      );
      if (!saved) throw new AppError(409, 'The plan changed. Preview again before saving.');
    } else {
      const candidate = new Plan({ ...result.plan, user: req.user._id, status: 'active' });
      await candidate.validate();
      let archived = null;
      if (current) {
        archived = await Plan.findOneAndUpdate(
          { _id: current._id, user: req.user._id, status: 'active', updatedAt: current.updatedAt },
          { $set: { status: 'finished' } }, { returnDocument: 'after' },
        );
        if (!archived) throw new AppError(409, 'The plan changed. Preview again before saving.');
      }
      try {
        saved = await candidate.save();
      } catch (error) {
        if (archived) {
          try {
            await Plan.updateOne({ _id: archived._id, user: req.user._id, status: 'finished', updatedAt: archived.updatedAt }, { $set: { status: 'active' } });
          } catch (restoreError) {
            // Another request may already have created an active plan. The old
            // snapshot remains readable; never overwrite that winning request.
            if (restoreError.code !== 11000) throw restoreError;
          }
        }
        if (error.code === 11000) throw new AppError(409, 'Another plan was saved. Refresh and preview again.');
        throw error;
      }
      const old = await Plan.find({ user: req.user._id, status: 'finished' }).sort({ createdAt: -1 }).skip(PLAN_MAX_FINISHED).select('_id').lean();
      if (old.length) await Plan.deleteMany({ user: req.user._id, _id: { $in: old.map((plan) => plan._id) } });
    }
    return sendSuccess(res, 200, 'Report added to My plan', { plan: presentPlan(saved) });
  } catch (error) { return next(asAppError(error)); }
};

// DELETE /api/plan   Always allowed and really deletes. DELETE /api/plan/history deletes the finished plans too.
const deletePlan = async (req, res, next) => {
  try {
    const { deletedCount } = await Plan.deleteOne({ user: req.user._id, status: 'active' });
    return sendSuccess(res, 200, 'Plan deleted successfully', { deleted: deletedCount === 1 });
  } catch (error) {
    return next(error);
  }
};
const deleteHistory = async (req, res, next) => {
  try {
    const { deletedCount } = await Plan.deleteMany(historyFilter(req.user));
    return sendSuccess(res, 200, 'Plan history deleted successfully', { deleted: deletedCount });
  } catch (error) {
    return next(error);
  }
};

// Finished plans are snapshots: reading history never overlays later sheet progress.
const historyFilter = (user) => ({
  user: user._id,
  $or: [
    { status: 'finished' },
    { status: 'active', deadline: { $lt: studyDay(planClock.now(), calendarSettings(user)) } },
  ],
});
const getHistory = async (req, res, next) => {
  try {
    const docs = await Plan.find(historyFilter(req.user)).sort({ createdAt: -1, _id: -1 }).select('title goalType startDate deadline createdAt');
    return sendSuccess(res, 200, 'Plan history fetched', { plans: docs.map((doc) => ({ id: String(doc._id), title: doc.title, goalType: doc.goalType, startDate: doc.startDate, deadline: doc.deadline, createdAt: doc.createdAt, readOnly: true })) });
  } catch (error) { return next(error); }
};
const getHistoryPlan = async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) throw new AppError(404, 'Plan not found');
    const doc = await Plan.findOne({ ...historyFilter(req.user), _id: req.params.id });
    if (!doc) throw new AppError(404, 'Plan not found');
    return sendSuccess(res, 200, 'Finished plan fetched', { plan: { ...presentPlan(doc), status: 'finished' }, readOnly: true });
  } catch (error) { return next(error); }
};

// The change a request describes, in the adjust module's words, with the current solved list so a rebuild does not bring solved problems back.
const changeFrom = async (req, doc) => {
  const b = req.body;
  const change = { type: b.type, deadline: b.deadline, solvedLinks: await solvedLinksFor(req.user._id, { goalType: doc.goalType, sheetSlug: doc.sheetSlug }, getPlanData()) };
  if (b.type === 'hours') { change.hoursByWeekday = weekdayHours(b); if (b.restDay !== undefined) change.restDay = b.restDay; }
  if (b.type === 'lighter') change.lighterDays = b.lighterDays;
  if (b.type === 'pace') change.pace = b.pace;
  return change;
};
const makeChange = async (req) => {
  const doc = await Plan.findOne({ user: req.user._id, status: 'active' });
  if (!doc) throw new AppError(404, 'You have no active plan');
  let result;
  try {
    result = adj.previewChange(toStored(doc), getPlanData(), today(req), await changeFrom(req, doc));
  } catch (error) {
    throw asAppError(error);
  }
  if (result.error === 'finished') throw new AppError(409, 'This plan is finished. Start a new plan instead.');
  return { doc, result };
};
const summary = (result) => ({ diff: result.diff, plannedMinutes: result.plan.coverage.plannedMinutes, leftOutCount: result.plan.coverage.leftOut.length, byGroup: result.plan.coverage.byGroup, finishDate: result.plan.finishDate });

// POST /api/plan/changes/preview   body { type: rebuild | hours | lighter, ... }   nothing is saved
const previewChange = async (req, res, next) => {
  try {
    const { result } = await makeChange(req);
    return sendSuccess(res, 200, 'Change previewed', summary(result));
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/changes/apply   the same body plus the checksum from the preview; only a previewed change is applied
const applyChange = async (req, res, next) => {
  try {
    const { doc, result } = await makeChange(req);
    if (result.diff.checksum !== req.body.checksum) return next(new AppError(409, 'This change was not previewed, or the plan changed after the preview. Preview it again.'));
    const p = result.plan;
    // the update only goes through if nobody changed the plan since it was read
    const updated = await Plan.findOneAndUpdate(
      { _id: doc._id, user: req.user._id, status: 'active', updatedAt: doc.updatedAt },
      { $set: { items: p.items, deadline: p.deadline, weeks: p.input.weeks, hoursByWeekday: p.input.hoursByWeekday, restDay: p.input.restDay, pace: p.input.pace, lighterDays: p.input.lighterDays, solvedLinks: p.input.solvedLinks, coverage: p.coverage, notices: p.notices } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return next(new AppError(409, 'The plan changed while you were looking at it. Preview the change again.'));
    return sendSuccess(res, 200, 'Change applied', { plan: presentPlan(updated), today: presentView(adj.todayView(toStored(updated), today(req)), updated.items) });
  } catch (error) {
    return next(error);
  }
};

// ── Phase 4: Items API, DSA sync, and Weekly Review ──────────────────────────

const findActivePlan = async (user, editable = true) => {
  const doc = await Plan.findOne({ user: user._id, status: 'active' });
  if (!doc) throw new AppError(404, 'You have no active plan');
  const day = studyDay(planClock.now(), calendarSettings(user));
  if (editable && doc.deadline < day) throw new AppError(409, 'This plan is finished. Its history is read-only.');
  return doc;
};
const partsOf = (doc, item) => doc.items.filter((it) => gen.baseId(it) === gen.baseId(item));
// Undoing a completion also removes its review schedule and daily review guard.
const clearLadder = (item) => {
  Object.assign(item, {
    completedStudyDay: null, lastReviewAt: null, reviewWindowEndsAt: null,
    reviewLadder: null, reviewStage: null, reviewBaseDay: null,
    nextReviewDay: null, lastFailedDay: null, lastReviewDay: null,
    reviewNeedsPractice: undefined,
  });
};

const findItemInPlan = (doc, id) => {
  const item = doc.items.find((it) => String(it._id) === id || it.key === id);
  if (!item) throw new AppError(404, 'Item not found');
  return item;
};

const withTransaction = async (fn) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } catch (txError) {
    if (
      txError.message?.includes('replica set member') ||
      txError.message?.includes('retryable writes') ||
      txError.codeName === 'IllegalOperation' ||
      txError.code === 20
    ) {
      return await fn(null);
    }
    throw txError;
  } finally {
    await session.endSession();
  }
};

// Ticking a DSA item in the plan marks the problem solved on its sheet, unticking removes it. Returns what it changed
// ({ changed, previous: the earlier solvedAt }) so the caller can undo it if the plan cannot be saved.
const syncDsaProgress = async (userId, sheetSlug, link, isDone, session = null, completedDay = null) => {
  if (!sheetSlug || !link) return { changed: false, previous: null };
  return writeProblemProgress({ user: userId, sheetSlug, link, mode: isDone ? 'done' : 'undone', session, studyDay: completedDay });
};

// Saves the plan and the sheet progress as one operation. On a replica set that is a transaction. On a single MongoDB server (no
// transactions) the sheet is written first and put back if the plan cannot be saved, so the two never disagree after a failure.
const persistWithSync = (doc, sync) => withTransaction(async (session) => {
  if (session) {
    await doc.save({ session });
    if (sync) await syncDsaProgress(doc.user, sync.sheet, sync.link, sync.isDone, session, sync.studyDay);
    return;
  }
  const info = sync ? await syncDsaProgress(doc.user, sync.sheet, sync.link, sync.isDone, null, sync.studyDay) : null;
  try {
    await doc.save();
  } catch (error) {
    if (info?.changed) {
      if (sync.isDone) await syncDsaProgress(doc.user, sync.sheet, sync.link, false);
      else await Progress.updateOne({ user: doc.user, sheetSlug: sync.sheet }, { $push: { solvedProblems: { link: sync.link, solvedAt: info.previous, studyDay: info.previousStudyDay } } });
    }
    throw error;
  }
});

// What the user has marked solved on the sheets for the plan's open DSA items (decision 2: a problem solved on the sheet shows done in the plan).
// Returns link -> the date it was solved (or null for old ticks with no date).
const solvedOnSheets = async (userId, doc) => {
  const open = new Set(doc.items.filter((it) => it.type === 'dsa' && it.link && !it.doneAt).map((it) => problemIdentity(it.link)));
  if (!open.size) return new Map();
  const docs = await Progress.find({ user: userId }).select('solvedProblems').lean();
  const solved = new Map();
  solved.studyDays = new Map();
  for (const p of normalizedSolves(docs.flatMap((doc) => doc.solvedProblems || []))) {
    if (open.has(problemIdentity(p.link))) solved.set(problemIdentity(p.link), p.solvedAt ?? null);
    solved.studyDays.set(problemIdentity(p.link), p.studyDay || (p.solvedAt ? gen.todayIst(p.solvedAt) : null));
  }
  return solved;
};
// An open DSA item whose problem is solved on its sheet counts as done, with the date it was solved there. Used by the plan, Today and the weekly review,
// so they all agree. An unknown date stays unknown and earns no dated weekly credit. Nothing is written.
const withSheetSolves = (items, solved) => items.map((it) => (it.type === 'dsa' && !it.doneAt && solved.has(problemIdentity(it.link)) ? { ...it, doneAt: solved.get(problemIdentity(it.link)) ?? null, completedStudyDay: solved.studyDays?.get(problemIdentity(it.link)) ?? null, solvedOnSheet: true } : it));

const applyItemsUpdate = (doc, updatedList) => {
  for (const updated of updatedList) {
    const target = doc.items.find((it) => it.key === updated.key);
    if (target) {
      if ('doneAt' in updated) target.doneAt = updated.doneAt ?? null;
      if ('completedStudyDay' in updated) target.completedStudyDay = updated.completedStudyDay ?? null;
      if ('result' in updated) target.result = updated.result ?? null;
      if ('quizScore' in updated) target.quizScore = updated.quizScore ?? null;
      if ('reviewLadder' in updated) target.reviewLadder = updated.reviewLadder ?? null;
      if ('reviewStage' in updated) target.reviewStage = updated.reviewStage ?? null;
      if ('reviewBaseDay' in updated) target.reviewBaseDay = updated.reviewBaseDay ?? null;
      if ('nextReviewDay' in updated) target.nextReviewDay = updated.nextReviewDay ?? null;
      if ('lastFailedDay' in updated) target.lastFailedDay = updated.lastFailedDay ?? null;
      if ('day' in updated) target.day = updated.day;
      if ('plannedDay' in updated) target.plannedDay = updated.plannedDay;
      if ('locked' in updated) target.locked = updated.locked;
      if ('skipped' in updated) target.skipped = updated.skipped;
    }
  }
};

// PATCH /api/plan/items/:id   body: { done?, result?, quizScore?, day?, plannedMinutes? }
const updateItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    const body = req.body;
    let dsaSync = null;

    if (body.day !== undefined) {
      const moveRes = adj.moveItem(toStored(doc), item.key, body.day);
      if (moveRes.error) {
        const errorMessages = {
          'already-done': 'Done items cannot be moved',
          'skipped': 'Skipped items cannot be moved',
          'dated-item': 'Mock and behavioral items cannot be moved',
          'outside-plan': 'Day must be between start date and deadline',
          'too-far': 'Items can only be moved up to 3 days from their planned day',
          'no-hours': 'Cannot move item to a day with no study hours',
          'mock-day': 'Cannot move item to a mock interview day',
        };
        return next(new AppError(422, errorMessages[moveRes.error] || moveRes.error));
      }
      applyItemsUpdate(doc, moveRes.items);
    }

    if (body.plannedMinutes !== undefined) {
      if (item.doneAt) return next(new AppError(422, 'Cannot change planned minutes of a done item'));
      if (item.skipped) return next(new AppError(422, 'Cannot change planned minutes of a skipped item'));
      item.plannedMinutes = body.plannedMinutes;
    }

    if (body.done !== undefined) {
      if (body.done === false) {
        if (item.doneAt) {
          const wasFull = partsOf(doc, item).every((p) => p.doneAt);
          item.doneAt = null;
          item.result = null;
          item.quizScore = null;
          clearLadder(item);
          if (wasFull) { // the whole problem was done: it is not any more, and its review ladder (kept on one part) goes
            for (const p of partsOf(doc, item)) { p.result = null; p.quizScore = null; clearLadder(p); }
            if (item.type === 'dsa' && item.link) {
              dsaSync = { sheet: item.sheet || doc.sheetSlug, link: item.link, isDone: false };
              doc.solvedLinks = doc.solvedLinks.filter((link) => problemIdentity(link) !== problemIdentity(item.link));
            }
          }
        }
      } else {
        if (!item.doneAt) {
          if (item.skipped) return next(new AppError(422, 'Cannot mark a skipped item as done'));
          const info = {
            doneAt: planClock.now(),
            doneDay: today(req),
            result: body.result || (item.type === 'dsa' ? 'alone' : undefined),
            quizScore: body.quizScore,
          };
          const markRes = adj.markDone(toStored(doc).items, item.key, info);
          if (markRes.error) {
            const errorMessages = {
              'already-done': 'Item is already completed',
              'skipped': 'Cannot mark a skipped item as done',
              'bad-quiz-score': 'Quiz score must be an integer between 0 and 5',
              'result-required': 'Result must be alone, hints or solution',
            };
            return next(new AppError(422, errorMessages[markRes.error] || markRes.error));
          }
          applyItemsUpdate(doc, markRes.items);
          if (item.type === 'dsa' && item.link && partsOf(doc, item).every((p) => p.doneAt)) { // the sheet is ticked when the last part is done
            dsaSync = { sheet: item.sheet || doc.sheetSlug, link: item.link, isDone: true, studyDay: today(req) };
            if (!doc.solvedLinks.includes(item.link)) doc.solvedLinks.push(item.link);
          }
        }
      }
    }

    await persistWithSync(doc, dsaSync);

    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Item updated', { item: presentItem(updated, partLabels(doc.items)) });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items   body: { title, plannedMinutes, day }
const addItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    if (doc.items.length >= PLAN_MAX_ITEMS) {
      return next(new AppError(422, `This plan already has ${PLAN_MAX_ITEMS} items`));
    }
    const { title, plannedMinutes, day } = req.body;
    if (day < doc.startDate || day > doc.deadline) {
      return next(new AppError(422, 'Day must be between start date and deadline'));
    }
    if (adj.hoursOn(toStored(doc).input, day) <= 0) {
      return next(new AppError(422, 'Cannot add an item to a day with no study hours'));
    }
    const key = `custom:${crypto.randomBytes(8).toString('hex')}`;
    const newItem = {
      key,
      type: 'custom',
      title,
      plannedMinutes,
      day,
      plannedDay: day,
      source: 'student',
      core: false,
      locked: true,
    };
    doc.items.push(newItem);
    await doc.save();
    const created = doc.items[doc.items.length - 1];
    return sendSuccess(res, 201, 'Item added', { item: presentItem(created, partLabels(doc.items)) });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/plan/items/:id   Only items the student added (or a report added) can be removed. An item the planner made is skipped instead:
// a removed one would come back at the next rebuild, and removing an item must never un-solve a problem on its sheet.
const removeItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    if (item.source === 'planner') return next(new AppError(422, 'This item came from your plan. Skip it instead of removing it.'));
    doc.items.pull(item._id);
    await doc.save();

    return sendSuccess(res, 200, 'Item removed', { removed: true, id: req.params.id });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/plan/items/:id/star
const starItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    item.starred = !item.starred;
    await doc.save();
    return sendSuccess(res, 200, 'Item star toggled', { item: presentItem(item, partLabels(doc.items)) });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/result   body: { result?, quizScore? }
const recordResult = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    if (item.doneAt) return next(new AppError(422, 'Item is already completed'));
    if (item.skipped) return next(new AppError(422, 'Cannot record result for a skipped item'));

    const info = {
      doneAt: planClock.now(),
      doneDay: today(req),
      result: req.body.result,
      quizScore: req.body.quizScore,
    };
    const markRes = adj.markDone(toStored(doc).items, item.key, info);
    if (markRes.error) {
      const errorMessages = {
        'already-done': 'Item is already completed',
        'skipped': 'Cannot record result for a skipped item',
        'bad-quiz-score': 'Quiz score must be an integer between 0 and 5',
        'result-required': 'Result must be alone, hints or solution',
      };
      return next(new AppError(422, errorMessages[markRes.error] || markRes.error));
    }
    applyItemsUpdate(doc, markRes.items);

    let dsaSync = null;
    if (item.type === 'dsa' && item.link && partsOf(doc, item).every((p) => p.doneAt)) {
      dsaSync = { sheet: item.sheet || doc.sheetSlug, link: item.link, isDone: true, studyDay: today(req) };
      if (!doc.solvedLinks.includes(item.link)) doc.solvedLinks.push(item.link);
    }

    await persistWithSync(doc, dsaSync);

    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Result recorded', { item: presentItem(updated, partLabels(doc.items)), started: markRes.started });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/review   body: { passed }
const recordReview = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    const now = planClock.now();
    const settings = calendarSettings(req.user);
    const reviewedThisDay = item.lastReviewAt && studyDay(new Date(item.lastReviewAt), settings) === today(req);
    if (reviewedThisDay || (item.reviewWindowEndsAt && now < item.reviewWindowEndsAt)) {
      throw new AppError(422, 'You have already reviewed this item in the current study-day window.');
    }
    const reviewRes = adj.recordReview(toStored(doc).items, item.key, req.body.passed, today(req));
    if (reviewRes.error) {
      if (reviewRes.error === 'no-review-due') return next(new AppError(422, 'No review is due for this item'));
      if (reviewRes.error === 'already-reviewed-today') return next(new AppError(422, 'You have already reviewed this item today.'));
      return next(new AppError(422, reviewRes.error));
    }
    const reviewed = reviewRes.items.find((entry) => entry.key === item.key);
    reviewed.lastReviewAt = now;
    reviewed.reviewWindowEndsAt = nextStudyBoundary(now, settings);
    reviewed.reviewNeedsPractice = !req.body.passed;
    // Two simultaneous replies must not advance the same overdue ladder twice.
    const saved = await Plan.findOneAndUpdate(
      { _id: doc._id, user: req.user._id, status: 'active', updatedAt: doc.updatedAt,
        items: { $elemMatch: { _id: item._id, reviewStage: item.reviewStage, nextReviewDay: item.nextReviewDay, lastReviewDay: { $ne: today(req) } } } },
      { $set: { items: reviewRes.items } }, { returnDocument: 'after', runValidators: true }
    );
    if (!saved) throw new AppError(409, 'The plan changed. Refresh it before reviewing again.');
    const updated = findItemInPlan(saved, req.params.id);
    return sendSuccess(res, 200, 'Review recorded', {
      retired: reviewRes.retired,
      offerRecode: reviewRes.offerRecode,
      item: presentItem(updated, partLabels(saved.items)),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/skip
const skipItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    if (item.doneAt) return next(new AppError(422, 'Completed items cannot be skipped'));

    const skipRes = adj.skipItem(toStored(doc).items, item.key, getPlanData());
    if (skipRes.error === 'already-done') return next(new AppError(422, 'Completed items cannot be skipped'));
    applyItemsUpdate(doc, skipRes.items);
    await doc.save();
    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Item skipped', { warning: skipRes.warning, item: presentItem(updated, partLabels(doc.items)) });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/unskip
const unskipItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    const unskipRes = adj.unskipItem(toStored(doc).items, item.key);
    applyItemsUpdate(doc, unskipRes.items);
    await doc.save();
    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Item unskipped', { item: presentItem(updated, partLabels(doc.items)) });
  } catch (error) {
    return next(error);
  }
};

// GET /api/plan/review?weekStart=YYYY-MM-DD
const getWeeklyReview = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user, false);
    const queryStart = req.query?.weekStart;
    const n = queryStart ? gen.dayNumber(queryStart) : gen.dayNumber(today(req));
    const monday = gen.ymdOf(n - gen.weekdayOf(n));
    const sunday = gen.ymdOf(gen.dayNumber(monday) + 6);
    const startNum = gen.dayNumber(doc.startDate);
    const weekIdx = Math.floor((gen.dayNumber(monday) - gen.weekdayOf(gen.dayNumber(monday)) - (startNum - gen.weekdayOf(startNum))) / 7) + 1;

    const solved = await solvedOnSheets(req.user._id, doc);
    const items = withSheetSolves(doc.items.map((it) => (typeof it.toObject === 'function' ? it.toObject() : it)), solved);
    const plannedItems = items.filter((it) => it.day >= monday && it.day <= sunday && !it.skipped);
    const plannedMinutes = plannedItems.reduce((s, it) => s + it.plannedMinutes, 0);

    const completedItems = items.filter((it) => {
      if (!it.doneAt) return false;
      const doneDay = (it.completedStudyDay || gen.todayIst(it.doneAt));
      return doneDay >= monday && doneDay <= sunday;
    });
    const completedMinutes = completedItems.reduce((s, it) => s + it.plannedMinutes, 0);

    const movedItems = items.filter((it) => it.day >= monday && it.day <= sunday && it.locked && it.plannedDay && it.plannedDay !== it.day);

    const weakTopics = [];
    const seenWeak = new Set();
    for (const it of items) {
      const wasDoneInWeek = it.doneAt && (it.completedStudyDay || gen.todayIst(it.doneAt)) >= monday && (it.completedStudyDay || gen.todayIst(it.doneAt)) <= sunday;
      const wasScheduledInWeek = it.day >= monday && it.day <= sunday;
      const failedInWeek = it.lastFailedDay && it.lastFailedDay >= monday && it.lastFailedDay <= sunday;
      if (!wasDoneInWeek && !wasScheduledInWeek && !failedInWeek) continue;

      let isWeak = false;
      let reason = '';
      if (it.result === 'solution') {
        isWeak = true;
        reason = 'Viewed solution';
      } else if (it.quizScore != null && it.quizScore < 4) {
        isWeak = true;
        reason = `Quiz score ${it.quizScore}/5`;
      } else if (failedInWeek) {
        isWeak = true;
        reason = 'Failed review';
      } else if (it.result === 'hints') {
        isWeak = true;
        reason = 'Needed hints';
      }

      if (isWeak) {
        const id = it.key;
        if (!seenWeak.has(id)) {
          seenWeak.add(id);
          let link = null;
          let quizLink = null;
          if (it.type === 'notes') {
            const sectionId = it.ref ? it.ref.split(':')[2] : null;
            link = `/notes/${it.subject}/${sectionId || ''}`;
            quizLink = link; // the 5-question quiz is at the end of the section's page
          } else if (it.type === 'dsa') {
            link = `/dsa/${it.sheet || doc.sheetSlug || 'blind-75'}`;
          }
          weakTopics.push({
            key: it.key,
            title: it.title,
            type: it.type,
            subject: it.subject || null,
            sheet: it.sheet || doc.sheetSlug || null,
            topicTitle: it.topicTitle || null,
            reason,
            link,
            quizLink,
          });
        }
      }
    }

    const track = gen.onTrack(items, today(req));

    return sendSuccess(res, 200, 'Weekly review computed', {
      week: {
        from: monday,
        to: sunday,
        weekNumber: Math.max(1, weekIdx),
      },
      summary: {
        plannedMinutes,
        completedMinutes,
        plannedCount: plannedItems.length,
        completedCount: completedItems.length,
        movedCount: movedItems.length,
        completionRate: plannedMinutes > 0 ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100)) : 0,
      },
      weakTopics,
      onTrack: track,
      suggestRebuild: track.suggestRebuild,
    });
  } catch (error) {
    return next(error);
  }
};

async function availableSubstitutes(req, doc, item) {
  if (item.type !== 'dsa' || partsOf(doc, item).some((part) => part.doneAt) || (await solvedOnSheets(req.user._id, doc)).has(problemIdentity(item.link))) {
    throw new AppError(422, 'Only an unfinished problem can be substituted. Completed parts stay protected.');
  }
  const progress = await Progress.find({ user: req.user._id }).select('solvedProblems').lean();
  const solved = new Set(normalizedSolves(progress.flatMap((row) => row.solvedProblems)).map((entry) => entry.link));
  return substituteOptions(doc, item, getPlanData(), solved);
}

const getSubstitutes = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Available alternatives', { alternatives: alternativeResources(item.link), substitutes: await availableSubstitutes(req, doc, item) });
  } catch (error) { return next(error); }
};

const substituteItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user);
    const item = findItemInPlan(doc, req.params.id);
    const option = (await availableSubstitutes(req, doc, item)).find((entry) => entry.sheetSlug === req.body.sheetSlug && problemIdentity(entry.link) === problemIdentity(req.body.link));
    if (!option || option.checksum !== req.body.checksum) throw new AppError(409, 'The available problems changed. Preview again.');
    if (doc.items.length >= PLAN_MAX_ITEMS) throw new AppError(422, 'This plan has reached its item limit.');
    const group = new Set(partsOf(doc, item).map((part) => part.key));
    const items = doc.items.map((part) => ({ ...part.toObject(), skipped: group.has(part.key) ? true : part.skipped }));
    items.push({ key: 'substitute:' + new mongoose.Types.ObjectId(), type: 'dsa', title: option.title, ref: `dsa:${option.sheetSlug}:${option.topicId}`, sheet: option.sheetSlug, topicId: option.topicId, topicTitle: option.topicTitle, difficulty: option.difficulty, link: option.link, plannedMinutes: option.plannedMinutes, day: item.day, plannedDay: item.day, source: 'student', core: item.core, replacesKey: item.key });
    const saved = await Plan.findOneAndUpdate({ _id: doc._id, user: req.user._id, status: 'active', updatedAt: doc.updatedAt }, { $set: { items } }, { returnDocument: 'after', runValidators: true });
    if (!saved) throw new AppError(409, 'The plan changed. Preview again.');
    return sendSuccess(res, 200, 'Substitute added; original problem remains unsolved', { plan: presentPlan(saved) });
  } catch (error) { return next(error); }
};

module.exports = {
  presentPlan,
  withTransaction,
  getPlanOptions,
  previewPlan,
  getPlan,
  createPlan,
  deletePlan,
  deleteHistory,
  getHistory,
  getHistoryPlan,
  previewChange,
  applyChange,
  updateItem,
  addItem,
  removeItem,
  starItem,
  recordResult,
  recordReview,
  skipItem,
  unskipItem,
  getWeeklyReview,
  syncDsaProgress,
  previewReportImport,
  applyReportImport,
  getSubstitutes,
  substituteItem,
};
