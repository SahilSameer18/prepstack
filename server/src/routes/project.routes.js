const express = require('express');
const { generateProject, getAllProjects, getProjectById, deleteProject } = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { aiProjectLimiter } = require('../middlewares/rateLimit.middleware')
const validate = require('../middlewares/validate.middleware')
const { generateProjectSchema } = require('../validators/project.validators')


const projectRouter = express.Router();

// generate project idea
projectRouter.post('/generate', aiProjectLimiter, authMiddleware, validate(generateProjectSchema), generateProject);

// get all project ideas of the logged in user
projectRouter.get('/', authMiddleware, getAllProjects);

// get project idea from projectId
projectRouter.get('/:projectId', authMiddleware, getProjectById);

// delete project idea from projectId
projectRouter.delete('/:projectId', authMiddleware, deleteProject);

module.exports = projectRouter;
