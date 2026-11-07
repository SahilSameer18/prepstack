const { z } = require('zod');

const VALID_COMPLEXITIES = ['beginner', 'intermediate', 'advanced'];

const generateProjectSchema = z.object({
  techStack: z
    .string({ error: 'Tech stack is required' })
    .trim()
    .min(2, 'Tech stack must be at least 2 characters')
    .max(40, 'Tech stack cannot exceed 40 characters')
    // a technology name, not a sentence: this also keeps scripts, links and long instructions out of the AI prompt
    .regex(/^[A-Za-z0-9 +#./&()-]+$/, 'Tech stack can only use letters, numbers and + # . / & ( ) -')
    .refine((value) => (value.match(/[A-Za-z]/g) || []).length >= 2, 'Tech stack must contain letters'),

  complexity: z
    .string({ error: 'Complexity is required' })
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

