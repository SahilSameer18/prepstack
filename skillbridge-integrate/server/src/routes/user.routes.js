import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { updateProfileSchema, changePasswordSchema } from "../schemas/user.schema.js";
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

// Get current user profile and analytics stats
userRouter.get("/profile", authUser, getProfileController);

// Update user profile (username, email, avatar)
userRouter.put("/profile", authUser, validateBody(updateProfileSchema), updateProfileController);

// Change password for credential accounts
userRouter.put("/change-password", authUser, validateBody(changePasswordSchema), changePasswordController);

export default userRouter;
