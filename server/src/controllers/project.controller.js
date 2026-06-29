const { generateProjectIdea } = require("../services/ai.service");
const projectModel = require('../models/project.model');

// controller to generate project idea
const generateProject = async (req, res, next) => {
  try {
    const { techStack, complexity, domain, notes } = req.body;

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
      user: req.user._id
    })

    return res.status(200).json({
      success: true,
      message: "Project idea generated successfully",
      project
    })
  } catch (error) {
    next(error);
  }
}

// controller to get all the project idea of the loged in user
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('title tagline difficulty createdAt techStack domain features')
    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      projects
    })
  } catch (error) {
    next(error);
  }
}

// controller to get project idea from projectId
const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectModel.findOne({ _id: projectId, user: req.user._id });
    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      project
    })
  } catch (error) {
    next(error);
  }
}

// controller to delete project idea from Id
const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await projectModel.findOneAndDelete({ _id: projectId, user: req.user._id });
    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    })
  } catch (error) {
    next(error);
  }
}

module.exports = { generateProject, getAllProjects, getProjectById, deleteProject }

