const DSASheet = require('../models/sheets.model');
const Progress = require('../models/progress.model');

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
      const error = new Error('DSA Sheet not found');
      error.statusCode = 404;
      throw error;
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

    let progress = await Progress.findOne({ user: userId, sheetSlug: slug });
    
    if (!progress) {
      progress = await Progress.create({ user: userId, sheetSlug: slug, solvedProblems: [] });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// toggle problem completion
exports.toggleProblemCompletion = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { problemLink } = req.body;
    const userId = req.user._id;

    let progress = await Progress.findOne({ user: userId, sheetSlug: slug });

    if (!progress) {
      progress = new Progress({ user: userId, sheetSlug: slug, solvedProblems: [problemLink] });
    } else {
      const idx = progress.solvedProblems.indexOf(problemLink);
      if (idx !== -1) {
        progress.solvedProblems.splice(idx, 1);
      } else {
        progress.solvedProblems.push(problemLink);
      }
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};