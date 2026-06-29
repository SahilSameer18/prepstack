const { ZodError } = require('zod');

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On success, req.body is replaced with the parsed (and coerced/trimmed) data.
 * On failure, a structured 422 error is forwarded to the error handler.
 *
 * @param {import('zod').ZodSchema} schema
 */

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = (result.error.issues ?? result.error.errors ?? []).map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(422).json({
      success: false,
      // Use the first specific field error as the top-level message so the
      // client always gets a human-readable string (e.g. "Password must be
      // at least 8 characters") rather than a vague "Validation failed".
      message: errors[0]?.message || 'Validation failed',
      errors,
    });
  }

  // Replace body with parsed data so controllers get clean, coerced values
  req.body = result.data;
  next();
};

module.exports = validate;