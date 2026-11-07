const mongoose = require('mongoose');
const { generateProjectIdea } = require("../services/ai.service");
const projectModel = require('../models/project.model');
const AppError = require('../utils/AppError');
const { sendSuccess, sanitizeDoc } = require('../utils/responseFormatter');

// Times (ms) at which the AI said a user's typed tech stack was not a real technology, per user. A rejected check still
// costs an AI call and the hourly limit does not count failed requests, so without this someone could type junk in a
// loop and use up the shared free quota. Kept in server memory (resets on restart).
const notATechnology = new Map();
const NOT_A_TECHNOLOGY_LIMIT = 5; // per user per hour
const HOUR_MS = 60 * 60 * 1000;
const recentNotATechnology = (key) => {
  const fresh = (notATechnology.get(key) || []).filter((at) => Date.now() - at < HOUR_MS);
  if (fresh.length) notATechnology.set(key, fresh); else notATechnology.delete(key);
  return fresh.length;
};

// Users with an idea being generated right now. Kept in server memory, so it resets on restart and is per
// server process (fine for a single instance).
const generatingNow = new Set();

// Most ideas one user may save in any 24 hours (the hourly limit of 4 stays as well). The AI quota is shared by
// everyone on the free plan, so this stops one user from using it all up. Counted from the database, so it
// survives restarts. Deleting ideas lowers the count; the hourly limit still caps total use.
const DAY_MS = 24 * 60 * 60 * 1000;
const dailyLimit = () => {
  const n = Number(process.env.AI_DAILY_LIMIT);
  return Number.isInteger(n) && n > 0 ? n : 15;
};

// controller to generate project idea
const generateProject = async (req, res, next) => {
  const userId = req.user._id;
  const key = String(userId);

  // A double click or a second tab must never cost a second AI call. Set before any await so two requests
  // arriving in the same instant cannot both get past this line.
  if (generatingNow.has(key)) {
    return next(new AppError(409, 'Your last project idea is still being generated. Please wait for it to finish.'));
  }
  generatingNow.add(key);

  try {
    const { techStack, complexity, domain, notes } = req.body;

    if (recentNotATechnology(key) >= NOT_A_TECHNOLOGY_LIMIT) {
      return next(new AppError(429, "You've tried several names we don't recognise. Please pick a tech stack from the list, or try again in an hour."));
    }

    const limit = dailyLimit();
    const recent = await projectModel.countDocuments({ user: userId, createdAt: { $gte: new Date(Date.now() - DAY_MS) } });
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
    if (error.reason === 'invalid-tech-stack') notATechnology.set(key, [...(notATechnology.get(key) || []), Date.now()]);
    next(error);
  } finally {
    generatingNow.delete(key); // always cleared: success, failure or the early returns above
  }
};

// controller to get all the project idea of the logged in user
const getAllProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const projects = await projectModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .select('title tagline difficulty createdAt techStack domain features');

    const sanitizedProjects = sanitizeDoc(projects);
    return sendSuccess(res, 200, 'Projects fetched successfully', { projects: sanitizedProjects }, { projects: sanitizedProjects });
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

