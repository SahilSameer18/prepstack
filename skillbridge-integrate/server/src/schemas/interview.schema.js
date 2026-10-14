import { z } from "zod";

export const createInterviewSchema = z.object({
  jobDescription: z
    .string({ required_error: "Job description is required" })
    .trim()
    .min(1, "Job description is required"),
});

export const interviewIdParamSchema = z.object({
  interviewId: z
    .string({ required_error: "Interview ID is required" })
    .trim()
    .min(1, "Interview ID is required"),
});
