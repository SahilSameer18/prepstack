import { z } from "zod";

export const interviewFormSchema = z.object({
  jobDescription: z
    .string()
    .trim()
    .min(1, "Job description is required."),
  resumeFile: z
    .any()
    .refine((file) => file !== null && file !== undefined, "Resume PDF file is required."),
});


  