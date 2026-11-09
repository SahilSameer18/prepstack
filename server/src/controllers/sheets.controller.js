const DSASheet = require('../models/sheets.model');
const Progress = require('../models/progress.model');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');

// controller to get all the sheets with dynamic problem counts
exports.getSheets = async (req, res, next) => {
  try {
    const sheets = await DSASheet.find({}, 'name slug description topics.problems.link topics.problems.difficulty topics.problems.tags');
    
    const formattedSheets = sheets.map(sheet => {
      const linkSet = new Set();
      const tagSet = new Set();
      let hasEasy = false, hasMedium = false, hasHard = false;

      (sheet.topics || []).forEach(t => {
        (t.problems || []).forEach(p => {
          if (p.link) linkSet.add(p.link);
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

    sendSuccess(res, 200, 'DSA sheets fetched successfully', formattedSheets);
  } catch (error) {
    next(error);
  }
};

// controller to get sheet by slug
exports.getSheetBySlug = async (req, res, next) => {
  try {
    const sheet = await DSASheet.findOne({ slug: req.params.slug }).select('-__v');
    if (!sheet) {
      return next(new AppError(404, 'DSA Sheet not found'));
    }
    sendSuccess(res, 200, 'DSA sheet fetched successfully', sheet);
  } catch (error) {
    next(error);
  }
};

// The API still sends solvedProblems as a plain list of links; the dates stay on the server (the dashboard gets them as a streak).
const withLinks = (progress) => {
  const plain = typeof progress.toObject === 'function' ? progress.toObject() : progress;
  return { ...plain, solvedProblems: (plain.solvedProblems || []).map((entry) => entry.link) };
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

    if (!(await DSASheet.exists({ slug }))) {
      return next(new AppError(404, 'DSA Sheet not found'));
    }

    const filter = { user: userId, sheetSlug: slug };

    // Only links that belong to this sheet can be added, which also caps the list at the sheet's size.
    // A stale link the user already has (removed from the sheet by a later re-seed) can still be removed.
    const inSheet = await DSASheet.exists({ slug, 'topics.problems.link': problemLink });
    if (!inSheet) {
      const removed = await Progress.findOneAndUpdate(
        { ...filter, 'solvedProblems.link': problemLink },
        { $pull: { solvedProblems: { link: problemLink } } },
        { returnDocument: 'after' }
      );
      if (!removed) {
        return next(new AppError(400, 'This problem is not part of this sheet'));
      }
      return sendSuccess(res, 200, 'Problem completion toggled successfully', withLinks(removed));
    }

    // Add-or-remove in ONE atomic update, so a double click or two tabs can never read a stale state.
    // $literal keeps the link a plain string (a value starting with "$" would be read as a field path).
    const link = { $literal: problemLink };
    const toggle = [{
      $set: {
        solvedProblems: {
          $let: {
            vars: { list: { $ifNull: ['$solvedProblems', []] } },
            in: {
              $cond: [
                { $in: [link, { $map: { input: '$$list', in: '$$this.link' } }] },
                { $filter: { input: '$$list', cond: { $ne: ['$$this.link', link] } } },
                { $concatArrays: ['$$list', [{ link, solvedAt: '$$NOW' }]] }
              ]
            }
          }
        },
        // mongoose adds updatedAt to pipeline updates by itself, but not createdAt
        createdAt: { $ifNull: ['$createdAt', '$$NOW'] }
      }
    }];
    const options = { returnDocument: 'after', upsert: true, updatePipeline: true };

    let progress;
    try {
      progress = await Progress.findOneAndUpdate(filter, toggle, options);
    } catch (err) {
      if (err.code !== 11000) throw err;
      // Two first-ever toggles raced on the unique (user, sheet) index. The record exists now, so retry once.
      progress = await Progress.findOneAndUpdate(filter, toggle, options);
    }

    sendSuccess(res, 200, 'Problem completion toggled successfully', withLinks(progress));
  } catch (error) {
    next(error);
  }
}
