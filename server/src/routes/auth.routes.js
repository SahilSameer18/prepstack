const express = require('express');
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const { authLimiter, linkGoogleLimiter } = require('../middlewares/rateLimit.middleware')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema, googleLoginSchema, setPasswordSchema } = require('../validators/auth.validators')

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

// Google OAuth — new login / registration
authRouter.post('/google', authLimiter, validate(googleLoginSchema), authController.googleLogin);

// Google Account Linking — authenticated user only
authRouter.post('/link-google', linkGoogleLimiter, authMiddleware, validate(googleLoginSchema), authController.linkGoogle);

// Set password for OAuth users
authRouter.put('/set-password', authLimiter, authMiddleware, validate(setPasswordSchema), authController.setPassword);

module.exports = authRouter;