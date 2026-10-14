import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import * as interviewController from "../controllers/interview.controller.js";
import upload from "../middlewares/file.middleware.js";
import { aiGenerationLimiter } from "../middlewares/rateLimit.middleware.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import {
  createInterviewSchema,
  interviewIdParamSchema,
} from "../schemas/interview.schema.js";

const interviewRouter = express.Router();
/**
 * @route POST /api/interview/
 * @desc generate new interview report on the basis of user self description, resume pdf and job description
 * @access private
 */

interviewRouter.post(
  "/",
  authUser,
  aiGenerationLimiter,
  upload.single("resume"),
  validateBody(createInterviewSchema),
  interviewController.generateInterViewReportController,
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId
 * @access private
 */

interviewRouter.get(
  "/report/:interviewId",
  authUser,
  validateParams(interviewIdParamSchema),
  interviewController.getInterviewReportByIdController,
);

/**
 * @route GET /api/interview/
 * @description get all interview reports of the logged-in user
 * @access private
 */

interviewRouter.get(
  "/",
  authUser,
  interviewController.getAllInterviewReportsController,
);

/**
 * @route DELETE /api/interview/:interviewId
 * @description delete interview report by interviewId
 * @access private
 */

interviewRouter.delete(
  "/:interviewId",
  authUser,
  validateParams(interviewIdParamSchema),
  interviewController.deleteInterviewReportController,
);

export default interviewRouter;