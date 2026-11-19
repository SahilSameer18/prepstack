const crypto = require('node:crypto');
const Plan = require('../models/plan.model');
const User = require('../modules/auth/auth.model');
const Progress = require('../models/progress.model');
const AppError = require('../shared/http/AppError');
const { sendSuccess } = require('../shared/http/responseFormatter');
const { planClock } = require('../shared/calendar/clock');
const { PlanInputError } = require('../services/planGenerator');
const { resumePlan, recoverReviews } = require('../services/planRecovery');
const { calendarSettings, studyDay, nextStudyBoundary } = require('../shared/calendar/studyCalendar');
const { normalizedSolves } = require('../utils/problemIdentity');
const { presentPlan, withTransaction } = require('./plan.controller');
const { PLAN_MAX_FINISHED } = require('../shared/config/limits');
const { invalidateUser } = require('../shared/infra/sessionCache');

// Read fresh owned state for both preview and apply. Neither caller can submit
// replacement task data or move another account's paused plan.
async function recoveryContext(req) {
  const userId = req.user._id;
  const [user, active, paused] = await Promise.all([
    User.findById(userId).select('studyTimeZone studyDayStart updatedAt').lean(),
    Plan.findOne({ user: userId, status: 'active' }).lean(),
    Plan.findOne({ user: userId, status: 'paused' }).lean(),
  ]);
  if (!user) throw new AppError(401, 'Your account is no longer available.');
  const now = planClock.now();
  const calendar = calendarSettings(user);
  const today = studyDay(now, calendar);
  const body = { ...req.body };
  delete body.checksum;
  const summary = { type: body.type, today, deadlineBefore: active?.deadline || null };
  let patch = null;

  if (body.type === 'calendar') {
    const next = { timeZone: body.timeZone, dayStartHour: body.dayStartHour };
    summary.studyDayBefore = today;
    summary.studyDayAfter = studyDay(now, next);
    summary.calendar = next;
  } else if (body.type === 'pause') {
    if (!active || active.deadline < today) throw new AppError(409, 'There is no editable active plan to pause.');
    if (paused) throw new AppError(409, 'One main plan is already paused. Resume or delete it first.');
    patch = { status: 'paused', pausedAtDay: today, pauseCalendar: calendar };
    summary.title = active.title;
    summary.deadlineAfter = active.deadline;
  } else if (body.type === 'resume' || body.type === 'discard') {
    if (!paused || String(paused._id) !== body.planId) throw new AppError(404, 'Paused plan not found.');
    summary.title = paused.title;
    summary.deadlineBefore = paused.deadline;
    if (body.type === 'resume') {
      const progress = await Progress.find({ user: userId }).select('solvedProblems').lean();
      const solved = new Set(normalizedSolves(progress.flatMap((record) => record.solvedProblems)).map((record) => record.link));
      const resumed = resumePlan(paused, user, now, body.extendDeadline, solved);
      patch = resumed.patch;
      summary.shiftDays = resumed.shiftDays;
      summary.movedItems = resumed.movedItems;
      summary.reviews = resumed.reviews;
      summary.refitted = resumed.refitted;
      summary.movedLocked = resumed.movedLocked;
      summary.extraDays = resumed.extraDays;
      summary.deadlineAfter = patch.deadline;
      summary.archiveActive = active ? { title: active.title, unfinished: active.items.filter((item) => !item.doneAt && !item.skipped).length } : null;
    }
  } else if (body.type === 'recover') {
    if (!active || active.deadline < today) throw new AppError(409, 'Extend or resume your plan before arranging reviews.');
    const recovery = recoverReviews(active, user, now, body.recoveryDays);
    patch = { items: recovery.items };
    summary.reviewCount = recovery.reviewCount;
    summary.deadlineAfter = active.deadline;
  }

  const checksum = crypto.createHash('sha256').update(JSON.stringify({ user, active, paused, body, today, patch })).digest('hex').slice(0, 32);
  return { user, active, paused, patch, summary, checksum, now, calendar };
}

function forwardError(error, next) {
  if (error instanceof PlanInputError) return next(new AppError(422, error.messages[0]));
  if (error.code === 11000) return next(new AppError(409, 'A plan changed in another request. Refresh and preview again.'));
  return next(error);
}

const previewRecovery = async (req, res, next) => {
  try {
    const context = await recoveryContext(req);
    const data = { ...context.summary, checksum: context.checksum };
    return sendSuccess(res, 200, 'Plan change preview', data);
  } catch (error) {
    return forwardError(error, next);
  }
};

function unchangedPlan(plan, userId, status) {
  return { _id: plan._id, user: userId, status, updatedAt: plan.updatedAt };
}

// A replica set commits lifecycle changes together. The standalone fallback
// compensates an archived sprint if activating the main plan fails.
const applyRecovery = async (req, res, next) => {
  try {
    const context = await recoveryContext(req);
    if (context.checksum !== req.body.checksum) throw new AppError(409, 'Your plans, calendar or study day changed. Preview again.');
    const { user, active, paused, patch, now, calendar } = context;
    const userId = req.user._id;
    await withTransaction(async (session) => {
      const options = session ? { session } : {};
      if (req.body.type === 'calendar') {
        // Old records without a timestamp still keep their original daily guard
        // through the end of the old study day when preferences change.
        await Plan.updateMany({ user: userId, status: { $in: ['active', 'paused'] } }, {
          $set: { 'items.$[review].reviewWindowEndsAt': nextStudyBoundary(now, calendar) },
        }, { ...options, arrayFilters: [{ 'review.lastReviewDay': studyDay(now, calendar), 'review.lastReviewAt': null, 'review.reviewWindowEndsAt': null }] });
        const result = await User.updateOne({ _id: user._id, updatedAt: user.updatedAt }, {
          $set: { studyTimeZone: req.body.timeZone, studyDayStart: req.body.dayStartHour },
        }, options);
        if (!result.matchedCount) throw new AppError(409, 'Your account changed. Preview again.');
        return;
      }
      if (req.body.type === 'discard') {
        const result = await Plan.deleteOne(unchangedPlan(paused, userId, 'paused'), options);
        if (!result.deletedCount) throw new AppError(409, 'The paused plan changed. Preview again.');
        return;
      }
      const source = req.body.type === 'resume' ? paused : active;
      const sourceStatus = req.body.type === 'resume' ? 'paused' : 'active';
      const changes = { ...patch };
      if (req.body.type === 'pause') changes.pausedAt = now;
      // Validate the complete result before any archive write takes place.
      const candidate = new Plan({ ...source, ...changes });
      await candidate.validate();
      let archived = null;
      if (req.body.type === 'resume' && active) {
        archived = await Plan.findOneAndUpdate(unchangedPlan(active, userId, 'active'), {
          $set: { status: 'finished' },
        }, { ...options, returnDocument: 'after' });
        if (!archived) throw new AppError(409, 'The sprint changed. Preview again.');
      }
      try {
        const result = await Plan.updateOne(unchangedPlan(source, userId, sourceStatus), { $set: changes }, { ...options, runValidators: true });
        if (!result.matchedCount) throw new AppError(409, 'The plan changed. Preview again.');
      } catch (error) {
        if (!session && archived) {
          try {
            await Plan.updateOne(unchangedPlan(archived, userId, 'finished'), { $set: { status: 'active' } });
          } catch (restoreError) {
            if (restoreError.code !== 11000) throw restoreError;
          }
        }
        throw error;
      }
    });
    if (req.body.type === 'calendar') await invalidateUser(userId); // the auth middleware caches the study calendar
    const older = await Plan.find({ user: userId, status: 'finished' }).sort({ createdAt: -1 }).skip(PLAN_MAX_FINISHED).select('_id').lean();
    if (older.length) await Plan.deleteMany({ user: userId, _id: { $in: older.map((record) => record._id) } });
    return sendSuccess(res, 200, 'Plan settings saved', { applied: true });
  } catch (error) {
    return forwardError(error, next);
  }
};

const getPausedPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user._id, status: 'paused' });
    if (!plan) throw new AppError(404, 'Paused plan not found.');
    return sendSuccess(res, 200, 'Paused plan snapshot', { plan: presentPlan(plan), readOnly: true });
  } catch (error) {
    return next(error.name === 'CastError' ? new AppError(404, 'Paused plan not found.') : error);
  }
};

module.exports = { previewRecovery, applyRecovery, getPausedPlan };
