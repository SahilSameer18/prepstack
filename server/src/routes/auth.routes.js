const express = require('express');
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const authRouter = express.Router();

// register user
authRouter.post('/register', authController.registerUser);

// login user
authRouter.post('/login', authController.loginUser);

//clear the token cookie to logout the user
authRouter.post('/logout', authMiddleware, authController.logoutUser);

// get current user
authRouter.get('/current-user', authMiddleware, authController.getCurrentUser);

module.exports = authRouter;