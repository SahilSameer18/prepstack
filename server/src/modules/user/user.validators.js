const { z } = require('zod');

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const updateProfileSchema = z.object({
  username: z
    .string({ error: 'Username is required' })
    .trim()
    .min(4, 'Username must be at least 4 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Username must start with a letter and can only contain letters, numbers, and underscores'),

  avatar: z
    .string()
    .trim()
    .max(500, 'Avatar URL cannot exceed 500 characters')
    // only real https links (blank means "use the default avatar"): no javascript:/data:/http: values
    .refine((value) => value === '' || isHttpsUrl(value), 'Avatar must be a valid https:// URL')
    .optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password cannot be empty'),

  newPassword: z
    .string({ error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .max(72, 'New password cannot exceed 72 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
});

const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmationEmail: z.string().trim().email('Please enter a valid confirmation email').optional(),
});

module.exports = { updateProfileSchema, changePasswordSchema, deleteAccountSchema };
