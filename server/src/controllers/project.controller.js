const mongoose = require('mongoose');
const { generateProjectIdea } = require("../services/ai.service");
const projectModel = require('../models/project.model');
const AppError = require('../utils/AppError');
const { sendSuccess, sanitizeDoc } = require('../utils/responseFormatter');

// controller to generate project idea
const generateProject = async (req, res, next) => {
  try {
    const { techStack, complexity, domain, notes } = req.body;
    const userId = req.user._id || req.user.id;

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
      user: userId
    });

    const sanitizedProject = sanitizeDoc(project);
    return sendSuccess(res, 201, 'Project idea generated successfully', { project: sanitizedProject }, { project: sanitizedProject });
  } catch (error) {
    next(error);
  }
};

// controller to get all the project idea of the logged in user
const getAllProjects = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

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
    const userId = req.user._id || req.user.id;

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
    const userId = req.user._id || req.user.id;

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

