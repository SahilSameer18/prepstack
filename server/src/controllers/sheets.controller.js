const DSASheet = require('../models/sheets.model');

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

