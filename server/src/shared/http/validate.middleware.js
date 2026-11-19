/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On success, req.body is replaced with the parsed (and coerced/trimmed) data.
 * On failure, a structured 422 error is forwarded to the error handler.
 *
 * @param {import('zod').ZodSchema} schema
 */

const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    const errors = (result.error.issues ?? result.error.errors ?? []).map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(422).json({
      success: false,
      message: errors[0]?.message || 'Validation failed',
      errors,
    });
  }

  req[target] = result.data;
  next();
};

module.exports = validate;


