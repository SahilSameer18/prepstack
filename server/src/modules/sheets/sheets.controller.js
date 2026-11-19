const DSASheet = require('./sheets.model');
const Progress = require('./progress.model');
const { problemIdentity, normalizedSolves } = require('./problemIdentity');
const { writeProblemProgress } = require('./problemProgress');
const { planClock } = require('../../shared/calendar/clock');
const { calendarSettings, studyDay } = require('../../shared/calendar/studyCalendar');
const AppError = require('../../shared/http/AppError');
const { sendSuccess } = require('../../shared/http/responseFormatter');
const { cached } = require('../../shared/infra/cache');
const { PUBLIC_CONTENT_CACHE_CONTROL } = require('../../shared/config/limits');

// The sheets only change when a seed runs, so their public reads come from the cache (phase 4); MongoDB answers a miss or a Redis outage.
// A seed clears the cached copies (clearContentCache), and every entry expires by itself within about ten minutes anyway.
const loadSheetList = async () => {
  const sheets = await DSASheet.find({}, 'name slug description topics.problems.link topics.problems.difficulty topics.problems.tags').lean(); // plain objects: building 1,300 Mongoose documents per request cost 58 ms of CPU

  return sheets.map(sheet => {
    const linkSet = new Set();
    const tagSet = new Set();
    let hasEasy = false, hasMedium = false, hasHard = false;

    (sheet.topics || []).forEach(t => {
      (t.problems || []).forEach(p => {
        if (p.link) linkSet.add(problemIdentity(p.link));
        if (p.difficulty) {
          const d = p.difficulty.toLowerCase();
          if (d === 'easy') hasEasy = true;
          if (d === 'medium') hasMedium = true;
          if (d === 'hard') hasHard = true;
        }
        (p.tags || []).forEach(tag => tagSet.add(tag));
      });
    });

    let difficultyLabel = 'Intermediate';
    if (hasEasy && hasHard) difficultyLabel = 'Beginner → Advanced';
    else if (hasEasy && hasMedium) difficultyLabel = 'Beginner → Intermediate';
    else if (hasMedium && hasHard) difficultyLabel = 'Intermediate → Advanced';
    else if (hasHard) difficultyLabel = 'Advanced';
    else if (hasEasy) difficultyLabel = 'Beginner';

    return {
      name: sheet.name,
      slug: sheet.slug,
      description: sheet.description || '',
      totalProblems: linkSet.size,
      difficulty: difficultyLabel,
      tags: Array.from(tagSet).slice(0, 4)
    };
  });
};

// controller to get all the sheets with dynamic problem counts
exports.getSheets = async (req, res, next) => {
  try {
    const formattedSheets = await cached(['content', 'sheets-list'], loadSheetList);
    res.set('Cache-Control', PUBLIC_CONTENT_CACHE_CONTROL);
    sendSuccess(res, 200, 'DSA sheets fetched successfully', formattedSheets);
  } catch (error) {
    next(error);
  }
};

// controller to get sheet by slug (null from the loader means "not found", which is cached briefly too)
exports.getSheetBySlug = async (req, res, next) => {
  try {
    const plain = await cached(['content', 'sheet', req.params.slug], async () => {
      const copy = await DSASheet.findOne({ slug: req.params.slug }).select('-__v').lean();
      if (!copy) return null;
      for (const topic of copy.topics || []) for (const problem of topic.problems || []) problem.link = problemIdentity(problem.link);
      return copy;
    });
    if (!plain) {
      return next(new AppError(404, 'DSA Sheet not found'));
    }
    res.set('Cache-Control', PUBLIC_CONTENT_CACHE_CONTROL);
    sendSuccess(res, 200, 'DSA sheet fetched successfully', plain);
  } catch (error) {
    next(error);
  }
};

// The API still sends solvedProblems as a plain list of links; the dates stay on the server (the dashboard gets them as a streak).
const withLinks = (progress) => {
  const plain = typeof progress.toObject === 'function' ? progress.toObject() : progress;
  return { ...plain, solvedProblems: normalizedSolves(plain.solvedProblems || []).map((entry) => entry.link) };
};

// get user progress for a sheet (read-only: never writes)
exports.getUserSheetProgress = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase(); // sheet slugs are stored lowercase
    const userId = req.user._id;

    if (!(await DSASheet.exists({ slug }))) {
      return next(new AppError(404, 'DSA Sheet not found'));
    }

    // A sheet the user has not touched yet is simply an empty list; no record is created until they solve something
    const progress = await Progress.findOne({ user: userId, sheetSlug: slug }).lean()
      ?? { user: userId, sheetSlug: slug, solvedProblems: [] };

    sendSuccess(res, 200, 'Sheet progress fetched successfully', withLinks(progress));
  } catch (error) {
    next(error);
  }
};

// toggle problem completion atomically
exports.toggleProblemCompletion = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { problemLink } = req.body;
    const userId = req.user._id;

    const sheet = await DSASheet.findOne({ slug }).select('topics.problems.link').lean();
    if (!sheet) return next(new AppError(404, 'DSA Sheet not found'));
    const link = problemIdentity(problemLink);
    const inSheet = sheet.topics.some((topic) => topic.problems.some((problem) => problemIdentity(problem.link) === link));
    if (!inSheet) {
      const old = await Progress.findOne({ user: userId, sheetSlug: slug }).lean();
      if (!normalizedSolves(old?.solvedProblems).some((entry) => entry.link === link)) {
        return next(new AppError(400, 'This problem is not part of this sheet'));
      }
    }
    const completedDay = studyDay(planClock.now(), calendarSettings(req.user));
    const result = await writeProblemProgress({ user: userId, sheetSlug: slug, link, mode: inSheet ? 'toggle' : 'undone', studyDay: completedDay });
    sendSuccess(res, 200, 'Problem completion toggled successfully', withLinks(result.progress));

  } catch (error) {
    next(error);
  }
}
