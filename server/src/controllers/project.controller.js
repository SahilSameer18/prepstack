const { generateProjectIdea } = require("../services/ai.service");
const projectModel = require('../models/project.model');


// controller to generate project idea
const generateProject = async (req, res) => {
  try {
    const { techStack, complexity, domain, notes } = req.body;

    if (!techStack || !complexity) {
      return res.status(400).json({
        success: false,
        message: "Tech stack and complexity are required"
      })
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
      user: req.user._id
    })

    return res.status(200).json({
      success: true,
      message: "Project idea generated successfully",
      project
    })
  } catch (error) {
    console.error("Error generating project idea:", error);
    res.status(500).json({ message: "Failed to generate project idea" });
  }
}


// controller to get all the project idea of the loged in user

const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel.find({ user: req.user._id }).sort({ createdAt: -1 }).select('title tagline difficulty createdAt')
    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      projects
    })
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
}

// controller to get project idea from projectId

const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await projectModel.findOne({ _id: projectId, user: req.user._id });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      project
    })
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
}


// controller to delete project idea from Id

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await projectModel.findOneAndDelete({ _id: projectId, user: req.user._id });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
}


module.exports = { generateProject, getAllProjects, getProjectById, deleteProject }