const DSASheet = require('../models/sheets.model');
const Progress = require('../models/progress.model');
const AppError = require('../utils/AppError');

// controller to get all the sheets with dynamic problem counts
exports.getSheets = async (req, res, next) => {
  try {
    const sheets = await DSASheet.find({}, 'name slug description topics.problems.link topics.problems.difficulty topics.problems.tags topics.questions.link');
    
    const formattedSheets = sheets.map(sheet => {
      const linkSet = new Set();
      const tagSet = new Set();
      let hasEasy = false, hasMedium = false, hasHard = false;

      (sheet.topics || []).forEach(t => {
        (t.problems || t.questions || []).forEach(p => {
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

    res.status(200).json({
      success: true,
      data: formattedSheets
    });
  } catch (error) {
    next(error);
  }
};

// controller to get sheet by slug
exports.getSheetBySlug = async (req, res, next) => {
  try {
    const sheet = await DSASheet.findOne({ slug: req.params.slug });
    if (!sheet) {
      return next(new AppError(404, 'DSA Sheet not found'));
    }
    res.status(200).json({
      success: true,
      data: sheet
    });
  } catch (error) {
    next(error);
  }
};

// get user progress for a sheet
exports.getUserSheetProgress = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user._id;

    const progress = await Progress.findOneAndUpdate(
      { user: userId, sheetSlug: slug },
      { $setOnInsert: { solvedProblems: [] } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// toggle problem completion atomically
exports.toggleProblemCompletion = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { problemLink } = req.body;
    const userId = req.user._id;

    // Check if the problem is already marked as solved
    const existing = await Progress.findOne({
      user: userId,
      sheetSlug: slug,
      solvedProblems: problemLink
    });

    const updateOperation = existing
      ? { $pull: { solvedProblems: problemLink } }
      : { $addToSet: { solvedProblems: problemLink } };

    const progress = await Progress.findOneAndUpdate(
      { user: userId, sheetSlug: slug },
      updateOperation,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
}