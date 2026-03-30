const express = require('express');
const { generateProject, getAllProjects, getProjectById, deleteProject } = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/auth.middleware');


const projectRouter = express.Router();

// generate project idea
projectRouter.post('/generate', authMiddleware, generateProject);

// get all project ideas of the logged in user
projectRouter.get('/all', authMiddleware, getAllProjects);

// get project idea from projectId
projectRouter.get('/:projectId', authMiddleware, getProjectById);

// delete project idea from projectId
projectRouter.delete('/:projectId', authMiddleware, deleteProject);

module.exports = projectRouter;