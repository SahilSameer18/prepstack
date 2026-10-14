/**
 * @description Express middleware to validate request data against Zod schemas
 */

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  
  // Set parsed data back to req.body (preserves coercion/strip logic)
  req.body = result.data;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return next(result.error);
  }
  
  req.params = result.data;
  next();
};

