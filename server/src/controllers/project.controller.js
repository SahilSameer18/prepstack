const mongoose = require('mongoose');
const { generateProjectIdea } = require("../services/ai.service");
const projectModel = require('../models/project.model');
const AppError = require('../utils/AppError');
const { sendSuccess, sanitizeDoc } = require('../utils/responseFormatter');
const { HOUR_MS, PROJECT_LOCK_MS, projectsPerDay } = require('../config/limits');
const { acquireLock, recentCount, recordEvent } = require('../services/lock');
const { countLast24h } = require('../services/usage.service');

// Times (ms) at which the AI said a user's typed tech stack was not a real technology, per user. A rejected check still
// costs an AI call and the hourly limit does not count failed requests, so without this someone could type junk in a
// loop and use up the shared free quota. Counted in Redis when it is on (shared by every server, survives a restart), else in memory.
const NOT_A_TECHNOLOGY_LIMIT = 5; // per user per hour

// Most ideas one user may save in any 24 hours (the hourly limit of 4 stays as well). The AI quota is shared by
// everyone on the free plan, so this stops one user from using it all up. Counted from the database, so it
// survives restarts. Deleting ideas lowers the count; the hourly limit still caps total use. The number is in config/limits.js.

// controller to generate project idea
const generateProject = async (req, res, next) => {
  const userId = req.user._id;
  const key = String(userId);

  // A double click or a second tab must never cost a second AI call. The lock is taken in one atomic step (Redis SET NX, or this
  // process's memory without Redis), so two requests arriving in the same instant cannot both get it; it expires by itself.
  const lock = await acquireLock('project', key, PROJECT_LOCK_MS);
  if (!lock) {
    return next(new AppError(409, 'Your last project idea is still being generated. Please wait for it to finish.'));
  }

  try {
    const { techStack, complexity, domain, notes } = req.body;

    if ((await recentCount('not-a-technology', key, HOUR_MS)) >= NOT_A_TECHNOLOGY_LIMIT) {
      return next(new AppError(429, "You've tried several names we don't recognise. Please pick a tech stack from the list, or try again in an hour."));
    }

    const limit = projectsPerDay();
    const recent = await countLast24h(projectModel, userId);
    if (recent >= limit) {
      return next(new AppError(429, `You've reached the limit of ${limit} project ideas per 24 hours. Please try again later.`));
    }

    const projectIdea = await generateProjectIdea({ techStack, complexity, domain, notes });

    const project = await projectModel.create({
      title: projectIdea.title,
      tagline: projectIdea.tagline,
      description: projectIdea.description,
      features: projectIdea.features,
      techStack: projectIdea.techStack,
      difficulty: projectIdea.difficulty,
      estimatedTime: projectIdea.estimatedTime,
      resumeValue: projectIdea.resumeValue,
      domain: domain || '',
      aiProvider: projectIdea.aiProvider, // which model answered: for debugging only, never sent to the browser
      user: userId
    });

    const sanitizedProject = sanitizeDoc(project);
    return sendSuccess(res, 201, 'Project idea generated successfully', { project: sanitizedProject }, { project: sanitizedProject });
  } catch (error) {
    if (error.reason === 'invalid-tech-stack') await recordEvent('not-a-technology', key, HOUR_MS);
    next(error);
  } finally {
    await lock.release(); // always released: success, failure or the early returns above
  }
};

// controller to get all the project idea of the logged in user
// The list comes 20 at a time, newest first. "Next page" = pass `before` = the _id of the last idea you already have.
// An id (not a page number) is used so the list stays correct while ideas are added or deleted between requests.
const PROJECT_PAGE_SIZE = 20;

const getAllProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { before } = req.query;

    const filter = { user: userId };
    if (before !== undefined) {
      if (typeof before !== 'string' || !/^[a-f0-9]{24}$/i.test(before)) return next(new AppError(400, 'Invalid "before" value'));
      filter._id = { $lt: before };
    }

    // one extra row tells us whether there is another page, without a second query
    const rows = await projectModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(PROJECT_PAGE_SIZE + 1)
      .select('title tagline difficulty createdAt techStack domain features');
    const hasMore = rows.length > PROJECT_PAGE_SIZE;
    const total = await projectModel.countDocuments({ user: userId }); // the true number, whatever page this is

    const sanitizedProjects = sanitizeDoc(rows.slice(0, PROJECT_PAGE_SIZE));
    return sendSuccess(res, 200, 'Projects fetched successfully', { projects: sanitizedProjects, total, hasMore }, { projects: sanitizedProjects, total, hasMore });
  } catch (error) {
    next(error);
  }
};

// controller to get project idea from projectId
const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new AppError(400, "Invalid project ID format"));
    }

    const project = await projectModel.findOne({ _id: projectId, user: userId });
    if (!project) {
      return next(new AppError(404, "Project not found"));
    }

    const sanitizedProject = sanitizeDoc(project);
    return sendSuccess(res, 200, 'Project fetched successfully', { project: sanitizedProject }, { project: sanitizedProject });
  } catch (error) {
    next(error);
  }
};

// controller to delete project idea from Id
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new AppError(400, "Invalid project ID format"));
    }

    const project = await projectModel.findOneAndDelete({ _id: projectId, user: userId });
    if (!project) {
      return next(new AppError(404, "Project not found"));
    }

    return sendSuccess(res, 200, 'Project deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateProject, getAllProjects, getProjectById, deleteProject };

