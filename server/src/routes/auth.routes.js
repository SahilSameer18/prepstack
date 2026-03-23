const express = require('express');
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const authRouter = express.Router();

authRouter.post('/register', authController.registerUser);
authRouter.post('/login', authController.loginUser);

//clear the token cookie to logout the user
authRouter.post('/logout', authMiddleware, authController.logoutUser);

module.exports = authRouter;