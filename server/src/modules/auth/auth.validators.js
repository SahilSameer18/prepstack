const { z } = require('zod');

const registerSchema = z.object({
  username: z
    .string({ error: 'Username is required' })
    .trim()
    .min(4, 'Username must be at least 4 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Username must start with a letter and can only contain letters, numbers, and underscores'),

  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});

// Validates the Google ID Token sent from the frontend after Google sign-in.
// The .min(1) guard prevents an empty string "" from bypassing the "required" message.
const googleLoginSchema = z.object({
  idToken: z
    .string({ error: 'Google ID token is required' })
    .min(1, 'Google ID token cannot be empty'),
});

const setPasswordSchema = z.object({
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
});

// The token is 64 hex characters (32 random bytes); anything else cannot be a real link. The new password follows the sign-up rules.
const resetPasswordSchema = z.object({
  token: z
    .string({ error: 'Reset token is required' })
    .regex(/^[a-f0-9]{64}$/, 'This reset link is invalid or has expired. Please request a new one.'),
  password: setPasswordSchema.shape.password,
});

module.exports = { registerSchema, loginSchema, googleLoginSchema, setPasswordSchema, forgotPasswordSchema, resetPasswordSchema };

