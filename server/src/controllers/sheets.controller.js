const DSASheet = require('../models/sheets.model');
const Progress = require('../models/progress.model');

// controller to get all the sheets
exports.getSheets = async (req, res) => {
  try {
    const sheets = await DSASheet.find({}, 'name slug description');
    res.status(200).json({
      success: true,
      data: sheets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// controller to get sheet by slug
exports.getSheetBySlug = async (req, res) => {
  try {
    const sheet = await DSASheet.findOne({ slug: req.params.slug });
    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: 'DSA Sheet not found'
      });
    }
    res.status(200).json({
      success: true,
      data: sheet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get user progress for a sheet
exports.getUserSheetProgress = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// toggle problem completion
exports.toggleProblemCompletion = async (req, res) => {
  try {
    const { slug } = req.params;
    const { problemLink } = req.body;
    const userId = req.user._id;

    if (!problemLink) {
      return res.status(400).json({ success: false, message: 'Problem link is required' });
    }

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

