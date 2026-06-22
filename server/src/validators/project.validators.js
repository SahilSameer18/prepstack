const { z } = require('zod');

const VALID_COMPLEXITIES = ['beginner', 'intermediate', 'advanced'];

const generateProjectSchema = z.object({
  techStack: z
    .string({ required_error: 'Tech stack is required' })
    .trim()
    .min(2, 'Tech stack must be at least 2 characters')
    .max(200, 'Tech stack cannot exceed 200 characters'),

  complexity: z
    .string({ required_error: 'Complexity is required' })
    .trim()
    .toLowerCase()
    .refine(
      (val) => VALID_COMPLEXITIES.includes(val),
      { message: `Complexity must be one of: ${VALID_COMPLEXITIES.join(', ')}` }
    ),

  domain: z
    .string()
    .trim()
    .max(100, 'Domain cannot exceed 100 characters')
    .optional()
    .default(''),

  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .default(''),
});

module.exports = { generateProjectSchema };