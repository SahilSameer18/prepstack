import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { authLimiter, googleLinkLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, googleAuthSchema } from "../schemas/auth.schema.js";

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user with credentials
 * @access Public
 */
authRouter.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  authController.registerUserController
);

/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access Public
 */
authRouter.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  authController.loginUserController
);

/**
 * @route POST /api/auth/google
 * @description Google OAuth login and registration endpoint with 409 conflict detection
 * @access Public
 */
authRouter.post(
  "/google",
  authLimiter,
  validateBody(googleAuthSchema),
  authController.googleAuthController
);

/**
 * @route POST /api/auth/link-google
 * @description Link Google OAuth account to currently logged in user
 * @access Private
 */
authRouter.post(
  "/link-google",
  authUser,
  googleLinkLimiter,
  validateBody(googleAuthSchema),
  authController.linkGoogleController
);

/**
 * @route POST /api/auth/logout
 * @description Clear the token cookie and blacklist session token
 * @access Public
 */
authRouter.post("/logout", authUser, authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description Get the current logged in user details
 * @access Private
 */
authRouter.get("/get-me", authUser, authController.getMeController);

export default authRouter;
