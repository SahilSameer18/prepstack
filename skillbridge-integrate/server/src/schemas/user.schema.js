import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  email: z.string().email("Enter a valid email address").optional(),
  avatar: z.string().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: "Current password is required" }).min(1, "Current password is required"),
  newPassword: z.string({ required_error: "New password is required" }).min(6, "New password must be at least 6 characters"),
});

