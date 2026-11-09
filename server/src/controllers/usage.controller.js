const projectModel = require('../models/project.model');
const Report = require('../models/interviewReport.model');
const { projectsPerDay, reportsPerDay } = require('../config/limits');
const { dailyUsage } = require('../services/usage.service');
const { sendSuccess } = require('../utils/responseFormatter');

// GET /api/usage: how much of today's allowance the user has used, for the forms to show before the user hits a limit.
const getUsage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [projects, reports] = await Promise.all([
      dailyUsage(projectModel, userId, projectsPerDay()),
      dailyUsage(Report, userId, reportsPerDay()),
    ]);
    sendSuccess(res, 200, 'Usage fetched successfully', { projects, reports });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsage };
