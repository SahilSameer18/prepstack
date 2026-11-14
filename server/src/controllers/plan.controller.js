const crypto = require('crypto');
const mongoose = require('mongoose');
const Plan = require('../models/plan.model');
const Progress = require('../models/progress.model');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');
const gen = require('../services/planGenerator');
const adj = require('../services/planAdjust');
const { getPlanData, planClock } = require('../services/planData');
const { PLAN_MAX_ITEMS, PLAN_MAX_FINISHED, PLAN_MAX_START_DAYS_AHEAD } = require('../config/limits');

const GOAL_TITLES = { placements: 'Placement prep', role: 'Role switch', bigtech: 'Big-tech SDE interview' };
const MAX_SOLVED_LINKS = 1500;

const today = () => gen.todayIst(planClock.now());
const weekdayHours = (b) => [b.weekdayHours, b.weekdayHours, b.weekdayHours, b.weekdayHours, b.weekdayHours, b.weekendHours, b.weekendHours];

// The form's answers as the generator's input. The start date defaults to today in India; it may be from yesterday (the clocks differ) to 60 days ahead.
const toInput = (body) => {
  const t = gen.dayNumber(today());
  const start = body.startDate ?? today();
  const s = gen.dayNumber(start);
  if (s < t - 1 || s > t + PLAN_MAX_START_DAYS_AHEAD) throw new AppError(422, `The start date must be from yesterday to ${PLAN_MAX_START_DAYS_AHEAD} days from today`);
  return {
    goalType: body.goalType, style: body.style, startDate: start, weeks: body.weeks, hoursByWeekday: weekdayHours(body), restDay: body.restDay,
    sheetSlug: body.sheetSlug, roadmapSlug: body.roadmapSlug, subjects: body.subjects, knownTopics: body.knownTopics,
  };
};
// A rule the generator checks (for example a sheet that does not exist) becomes a 422 with its own words.
const asAppError = (e) => (e instanceof gen.PlanInputError ? new AppError(422, e.messages[0], e.messages.map((message) => ({ field: '', message }))) : e);

// What the user has already solved, limited to the sheets this plan uses, so a plan does not schedule it again.
const solvedLinksFor = async (userId, input, data) => {
  const docs = await Progress.find({ user: userId }).select('solvedProblems.link').lean();
  const solved = new Set(docs.flatMap((d) => (d.solvedProblems || []).map((p) => p.link)));
  const sheets = input.goalType === 'role' ? Object.values(data.sheets) : [data.sheets[input.sheetSlug]].filter(Boolean);
  const inPlan = new Set(sheets.flatMap((s) => s.topics.flatMap((t) => t.problems.map((p) => p.link))));
  return [...solved].filter((l) => inPlan.has(l)).slice(0, MAX_SOLVED_LINKS);
};

const presentItem = (it) => ({
  id: it._id ? String(it._id) : null, key: it.key ?? null, originalKey: it.originalKey ?? null, type: it.type, ref: it.ref ?? null, link: it.link ?? null, title: it.title,
  plannedMinutes: it.plannedMinutes, day: it.day ?? null, part: it.part ?? null, source: it.source ?? 'planner', core: it.core ?? true, sheet: it.sheet ?? null,
  topicId: it.topicId ?? null, topicTitle: it.topicTitle ?? null, subject: it.subject ?? null, difficulty: it.difficulty ?? null,
  starred: !!it.starred, locked: !!it.locked, skipped: !!it.skipped, result: it.result ?? null, quizScore: it.quizScore ?? null, doneAt: it.doneAt ?? null,
  reviewStage: it.reviewStage ?? null, nextReviewDay: it.nextReviewDay ?? null, dueDay: it.dueDay ?? null, failed: it.failed ?? undefined, solvedOnSheet: !!it.solvedOnSheet,
});
const presentPlan = (doc) => ({
  id: String(doc._id), goalType: doc.goalType, style: doc.style, title: doc.title, targetRole: doc.targetRole, status: doc.status, sheetSlug: doc.sheetSlug, roadmapSlug: doc.roadmapSlug,
  subjects: doc.subjects, knownTopics: doc.knownTopics, weeks: doc.weeks, startDate: doc.startDate, deadline: doc.deadline, hoursByWeekday: doc.hoursByWeekday, restDay: doc.restDay,
  lighterDays: doc.lighterDays, coverage: doc.coverage, notices: doc.notices, createdAt: doc.createdAt, updatedAt: doc.updatedAt, items: doc.items.map(presentItem),
});
const presentView = (v) => ({ ...v, items: v.items.map(presentItem), startItem: v.startItem ? presentItem(v.startItem) : null });

// A saved plan in the shape the generator and the adjust module work on.
const toStored = (doc) => {
  const o = doc.toObject();
  return {
    input: { goalType: o.goalType, style: o.style, startDate: o.startDate, weeks: o.weeks, hoursByWeekday: o.hoursByWeekday, restDay: o.restDay, sheetSlug: o.sheetSlug, roadmapSlug: o.roadmapSlug, subjects: o.subjects, knownTopics: o.knownTopics, solvedLinks: o.solvedLinks, lighterDays: o.lighterDays },
    startDate: o.startDate, deadline: o.deadline, items: o.items,
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
    const doc = await Plan.findOne({ user: req.user._id, status: 'active' });
    if (!doc) return sendSuccess(res, 200, 'No active plan', { plan: null, today: null, finished: false });
    // a problem solved on its sheet (not through the plan) counts as done here: it leaves Today and the on-track numbers, and the page can show it done
    const solved = await solvedOnSheets(req.user._id, doc);
    const stored = toStored(doc);
    stored.items = stored.items.map((it) => (it.type === 'dsa' && !it.doneAt && solved.has(it.link) ? { ...it, doneAt: planClock.now(), solvedOnSheet: true } : it));
    const plan = presentPlan(doc);
    plan.items = plan.items.map((it) => ({ ...it, solvedOnSheet: it.type === 'dsa' && !it.doneAt && solved.has(it.link) }));
    return sendSuccess(res, 200, 'Plan fetched successfully', { plan, today: presentView(adj.todayView(stored, today())), finished: doc.deadline < today() });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan   body: the form (+ title, targetRole, replace)
// One active plan per user. A plan whose deadline has passed is finished automatically; another one needs `replace: true`, which keeps the old plan as history.
const createPlan = async (req, res, next) => {
  try {
    const data = getPlanData();
    const input = toInput(req.body);
    const existing = await Plan.findOne({ user: req.user._id, status: 'active' });
    if (existing && existing.deadline >= today() && !req.body.replace) return next(new AppError(409, 'You already have an active plan. Replace it or delete it first.'));

    input.solvedLinks = await solvedLinksFor(req.user._id, input, data);
    let plan;
    try {
      plan = gen.generatePlan(input, data);
    } catch (error) {
      return next(asAppError(error));
    }
    if (plan.items.length > PLAN_MAX_ITEMS) return next(new AppError(422, `This plan would have ${plan.items.length} items and the most is ${PLAN_MAX_ITEMS}. Choose fewer weeks, fewer subjects or a smaller sheet.`));
    if (!plan.coverage.syllabusItems) return next(new AppError(422, 'There is nothing to plan: every problem on this sheet is already solved or marked as known.'));

    if (existing) await Plan.updateOne({ _id: existing._id }, { $set: { status: 'finished' } });
    let doc;
    try {
      doc = await Plan.create({
        user: req.user._id, goalType: input.goalType, style: input.style, title: req.body.title || `${GOAL_TITLES[input.goalType]}, ${input.weeks} weeks`, targetRole: req.body.targetRole || '',
        sheetSlug: input.sheetSlug || null, roadmapSlug: input.roadmapSlug || null, subjects: plan.input.subjects, knownTopics: input.knownTopics, solvedLinks: input.solvedLinks,
        weeks: input.weeks, startDate: input.startDate, deadline: plan.deadline, hoursByWeekday: input.hoursByWeekday, restDay: input.restDay, lighterDays: [],
        coverage: plan.coverage, notices: plan.notices, items: plan.items,
      });
    } catch (error) {
      if (existing) await Plan.updateOne({ _id: existing._id }, { $set: { status: 'active' } }); // the old plan stays as it was
      if (error.code === 11000) return next(new AppError(409, 'You already have an active plan. Replace it or delete it first.'));
      throw error;
    }
    const old = await Plan.find({ user: req.user._id, status: 'finished' }).sort({ createdAt: -1 }).skip(PLAN_MAX_FINISHED).select('_id').lean();
    if (old.length) await Plan.deleteMany({ _id: { $in: old.map((p) => p._id) }, user: req.user._id });
    return sendSuccess(res, 201, 'Plan created successfully', { plan: presentPlan(doc), today: presentView(adj.todayView(toStored(doc), today())) });
  } catch (error) {
    return next(error);
  }
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
    const { deletedCount } = await Plan.deleteMany({ user: req.user._id, status: 'finished' });
    return sendSuccess(res, 200, 'Plan history deleted successfully', { deleted: deletedCount });
  } catch (error) {
    return next(error);
  }
};

// The change a request describes, in the adjust module's words, with the current solved list so a rebuild does not bring solved problems back.
const changeFrom = async (req, doc) => {
  const b = req.body;
  const change = { type: b.type, solvedLinks: await solvedLinksFor(req.user._id, { goalType: doc.goalType, sheetSlug: doc.sheetSlug }, getPlanData()) };
  if (b.type === 'hours') { change.hoursByWeekday = weekdayHours(b); if (b.restDay !== undefined) change.restDay = b.restDay; }
  if (b.type === 'lighter') change.lighterDays = b.lighterDays;
  return change;
};
const makeChange = async (req) => {
  const doc = await Plan.findOne({ user: req.user._id, status: 'active' });
  if (!doc) throw new AppError(404, 'You have no active plan');
  let result;
  try {
    result = adj.previewChange(toStored(doc), getPlanData(), today(), await changeFrom(req, doc));
  } catch (error) {
    throw asAppError(error);
  }
  if (result.error === 'finished') throw new AppError(409, 'This plan is finished. Start a new plan instead.');
  return { doc, result };
};
const summary = (result) => ({ diff: result.diff, plannedMinutes: result.plan.coverage.plannedMinutes, leftOutCount: result.plan.coverage.leftOut.length, finishDate: result.plan.finishDate });

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
      { $set: { items: p.items, hoursByWeekday: p.input.hoursByWeekday, restDay: p.input.restDay, lighterDays: p.input.lighterDays, solvedLinks: p.input.solvedLinks, coverage: p.coverage, notices: p.notices } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return next(new AppError(409, 'The plan changed while you were looking at it. Preview the change again.'));
    return sendSuccess(res, 200, 'Change applied', { plan: presentPlan(updated), today: presentView(adj.todayView(toStored(updated), today())) });
  } catch (error) {
    return next(error);
  }
};

// ── Phase 4: Items API, DSA sync, and Weekly Review ──────────────────────────

const findActivePlan = async (userId) => {
  const doc = await Plan.findOne({ user: userId, status: 'active' });
  if (!doc) throw new AppError(404, 'You have no active plan');
  return doc;
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
const syncDsaProgress = async (userId, sheetSlug, link, isDone, session = null) => {
  if (!sheetSlug || !link) return { changed: false, previous: null };
  const filter = { user: userId, sheetSlug };
  const opts = session ? { session } : {};
  if (isDone) {
    const now = new Date();
    const push = { $push: { solvedProblems: { link, solvedAt: now } } };
    const matches = { ...filter, 'solvedProblems.link': { $ne: link } };
    let result;
    try {
      result = await Progress.updateOne(matches, { ...push, $setOnInsert: { createdAt: now } }, { upsert: true, ...opts });
    } catch (err) {
      if (err.code !== 11000) throw err;
      result = await Progress.updateOne(matches, push, opts); // two first ticks at once: the other one created the document
    }
    return { changed: (result.modifiedCount || 0) + (result.upsertedCount || 0) > 0, previous: null };
  }
  const before = await Progress.findOne(filter, { solvedProblems: { $elemMatch: { link } } }, opts).lean();
  const previous = before?.solvedProblems?.[0]?.solvedAt ?? null;
  const result = await Progress.updateOne(filter, { $pull: { solvedProblems: { link } } }, opts);
  return { changed: (result.modifiedCount || 0) > 0, previous };
};

// Saves the plan and the sheet progress as one operation. On a replica set that is a transaction. On a single MongoDB server (no
// transactions) the sheet is written first and put back if the plan cannot be saved, so the two never disagree after a failure.
const persistWithSync = (doc, sync) => withTransaction(async (session) => {
  if (session) {
    await doc.save({ session });
    if (sync) await syncDsaProgress(doc.user, sync.sheet, sync.link, sync.isDone, session);
    return;
  }
  const info = sync ? await syncDsaProgress(doc.user, sync.sheet, sync.link, sync.isDone) : null;
  try {
    await doc.save();
  } catch (error) {
    if (info?.changed) {
      if (sync.isDone) await syncDsaProgress(doc.user, sync.sheet, sync.link, false);
      else await Progress.updateOne({ user: doc.user, sheetSlug: sync.sheet }, { $push: { solvedProblems: { link: sync.link, solvedAt: info.previous } } });
    }
    throw error;
  }
});

// What the user has marked solved on the sheets for the plan's open DSA items (decision 2: a problem solved on the sheet shows done in the plan).
const solvedOnSheets = async (userId, doc) => {
  const open = new Set(doc.items.filter((it) => it.type === 'dsa' && it.link && !it.doneAt).map((it) => it.link));
  if (!open.size) return new Set();
  const docs = await Progress.find({ user: userId }).select('solvedProblems.link').lean();
  return new Set(docs.flatMap((d) => (d.solvedProblems || []).map((p) => p.link)).filter((l) => open.has(l)));
};

const applyItemsUpdate = (doc, updatedList) => {
  for (const updated of updatedList) {
    const target = doc.items.find((it) => it.key === updated.key);
    if (target) {
      if ('doneAt' in updated) target.doneAt = updated.doneAt ?? null;
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
    const doc = await findActivePlan(req.user._id);
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
          item.doneAt = null;
          item.result = null;
          item.quizScore = null;
          item.reviewLadder = null;
          item.reviewStage = null;
          item.reviewBaseDay = null;
          item.nextReviewDay = null;
          item.lastFailedDay = null;
          if (item.type === 'dsa' && item.link) {
            dsaSync = { sheet: item.sheet || doc.sheetSlug, link: item.link, isDone: false };
            doc.solvedLinks = doc.solvedLinks.filter((l) => l !== item.link);
          }
        }
      } else {
        if (!item.doneAt) {
          if (item.skipped) return next(new AppError(422, 'Cannot mark a skipped item as done'));
          const info = {
            doneAt: new Date(),
            doneDay: today(),
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
          if (item.type === 'dsa' && item.link) {
            dsaSync = { sheet: item.sheet || doc.sheetSlug, link: item.link, isDone: true };
            if (!doc.solvedLinks.includes(item.link)) doc.solvedLinks.push(item.link);
          }
        }
      }
    }

    await persistWithSync(doc, dsaSync);

    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Item updated', { item: presentItem(updated) });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items   body: { title, plannedMinutes, day }
const addItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user._id);
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
    return sendSuccess(res, 201, 'Item added', { item: presentItem(created) });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/plan/items/:id   Only items the student added (or a report added) can be removed. An item the planner made is skipped instead:
// a removed one would come back at the next rebuild, and removing an item must never un-solve a problem on its sheet.
const removeItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user._id);
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
    const doc = await findActivePlan(req.user._id);
    const item = findItemInPlan(doc, req.params.id);
    item.starred = !item.starred;
    await doc.save();
    return sendSuccess(res, 200, 'Item star toggled', { item: presentItem(item) });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/result   body: { result?, quizScore? }
const recordResult = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user._id);
    const item = findItemInPlan(doc, req.params.id);
    if (item.doneAt) return next(new AppError(422, 'Item is already completed'));
    if (item.skipped) return next(new AppError(422, 'Cannot record result for a skipped item'));

    const info = {
      doneAt: new Date(),
      doneDay: today(),
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
    if (item.type === 'dsa' && item.link) {
      dsaSync = { sheet: item.sheet || doc.sheetSlug, link: item.link, isDone: true };
      if (!doc.solvedLinks.includes(item.link)) doc.solvedLinks.push(item.link);
    }

    await persistWithSync(doc, dsaSync);

    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Result recorded', { item: presentItem(updated), started: markRes.started });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/review   body: { passed }
const recordReview = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user._id);
    const item = findItemInPlan(doc, req.params.id);
    const reviewRes = adj.recordReview(toStored(doc).items, item.key, req.body.passed, today());
    if (reviewRes.error) {
      if (reviewRes.error === 'no-review-due') return next(new AppError(422, 'No review is due for this item'));
      return next(new AppError(422, reviewRes.error));
    }
    applyItemsUpdate(doc, reviewRes.items);
    await doc.save();
    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Review recorded', {
      retired: reviewRes.retired,
      offerRecode: reviewRes.offerRecode,
      item: presentItem(updated),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/skip
const skipItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user._id);
    const item = findItemInPlan(doc, req.params.id);
    if (item.doneAt) return next(new AppError(422, 'Completed items cannot be skipped'));

    const skipRes = adj.skipItem(toStored(doc).items, item.key, getPlanData());
    if (skipRes.error === 'already-done') return next(new AppError(422, 'Completed items cannot be skipped'));
    applyItemsUpdate(doc, skipRes.items);
    await doc.save();
    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Item skipped', { warning: skipRes.warning, item: presentItem(updated) });
  } catch (error) {
    return next(error);
  }
};

// POST /api/plan/items/:id/unskip
const unskipItem = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user._id);
    const item = findItemInPlan(doc, req.params.id);
    const unskipRes = adj.unskipItem(toStored(doc).items, item.key);
    applyItemsUpdate(doc, unskipRes.items);
    await doc.save();
    const updated = findItemInPlan(doc, req.params.id);
    return sendSuccess(res, 200, 'Item unskipped', { item: presentItem(updated) });
  } catch (error) {
    return next(error);
  }
};

// GET /api/plan/review?weekStart=YYYY-MM-DD
const getWeeklyReview = async (req, res, next) => {
  try {
    const doc = await findActivePlan(req.user._id);
    const queryStart = req.query?.weekStart;
    const n = queryStart ? gen.dayNumber(queryStart) : gen.dayNumber(today());
    const monday = gen.ymdOf(n - gen.weekdayOf(n));
    const sunday = gen.ymdOf(gen.dayNumber(monday) + 6);
    const startNum = gen.dayNumber(doc.startDate);
    const weekIdx = Math.floor((gen.dayNumber(monday) - gen.weekdayOf(gen.dayNumber(monday)) - (startNum - gen.weekdayOf(startNum))) / 7) + 1;

    const plannedItems = doc.items.filter((it) => it.day >= monday && it.day <= sunday && !it.skipped);
    const plannedMinutes = plannedItems.reduce((s, it) => s + it.plannedMinutes, 0);

    const completedItems = doc.items.filter((it) => {
      if (!it.doneAt) return false;
      const doneDay = gen.todayIst(it.doneAt);
      return doneDay >= monday && doneDay <= sunday;
    });
    const completedMinutes = completedItems.reduce((s, it) => s + it.plannedMinutes, 0);

    const movedItems = doc.items.filter((it) => it.day >= monday && it.day <= sunday && it.locked && it.plannedDay && it.plannedDay !== it.day);

    const weakTopics = [];
    const seenWeak = new Set();
    for (const it of doc.items) {
      const wasDoneInWeek = it.doneAt && gen.todayIst(it.doneAt) >= monday && gen.todayIst(it.doneAt) <= sunday;
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

    const track = gen.onTrack(doc.items, today());

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

module.exports = {
  previewPlan,
  getPlan,
  createPlan,
  deletePlan,
  deleteHistory,
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
};
