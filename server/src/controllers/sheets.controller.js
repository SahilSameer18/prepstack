const DSASheet = require('../models/sheets.model');
const Progress = require('../models/progress.model');
const AppError = require('../utils/AppError');

// controller to get all the sheets
exports.getSheets = async (req, res, next) => {
  try {
    const sheets = await DSASheet.find({}, 'name slug description');
    res.status(200).json({
      success: true,
      data: sheets
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
};

