const { z } = require('zod');

const toggleProblemSchema = z.object({
  problemLink: z
    .string({ error: 'Problem link is required' })
    .trim()
    .url('Problem link must be a valid URL'),
});

module.exports = { toggleProblemSchema };

