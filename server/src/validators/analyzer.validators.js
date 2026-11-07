const { z } = require('zod');

// A multipart form sends every value as text, so "true" and "10" arrive as strings
const truthy = z.preprocess((v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : v), z.boolean({ error: 'Please confirm that your resume text may be sent to the AI services' }));

const createReportSchema = z.object({
  jobDescription: z
    .string({ error: 'Job description is required' })
    .trim()
    .min(30, 'Job description must be at least 30 characters')
    .max(4000, 'Job description cannot exceed 4000 characters'),
  // used when no PDF is uploaded
  resumeText: z
    .string()
    .max(20000, 'Resume text is too long. Paste at most 20,000 characters.')
    .optional(),
  days: z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), z.number({ error: 'Days must be a number' }).int('Days must be a whole number').min(3, 'Choose at least 3 days').max(30, 'Choose at most 30 days').default(10)),
  consent: truthy.refine((v) => v === true, 'Please confirm that your resume text may be sent to the AI services'),
});

const reportIdSchema = z.object({
  id: z.string({ error: 'Report id is required' }).regex(/^[a-f0-9]{24}$/i, 'Invalid report id'),
});

module.exports = { createReportSchema, reportIdSchema };
