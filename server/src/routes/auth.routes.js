const express = require('express');
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const { authLimiter } = require('../middlewares/rateLimit.middleware')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/auth.validators')

const authRouter = express.Router();

// register user
authRouter.post('/register', authLimiter, validate(registerSchema), authController.registerUser);

// login user
authRouter.post('/login', authLimiter, validate(loginSchema), authController.loginUser);

// refresh access token
authRouter.post('/refresh', authController.refreshAccessToken);

//clear the token cookie to logout the user
authRouter.post('/logout', authMiddleware, authController.logoutUser);

// get current user
authRouter.get('/current-user', authMiddleware, authController.getCurrentUser);

module.exports = authRouter;


