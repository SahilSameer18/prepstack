const { ZodError } = require('zod');

/**
 * Global Express error-handling middleware.
 * Handles Zod validation errors, JWT errors, Mongoose/MongoDB errors, and generic errors uniformly.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('[Error]', err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for ID: ${err.value}`,
    });
  }

  // Zod validation errors (if thrown directly rather than caught by validate middleware)
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(409).json({
      success: false,
      message: `${formattedField} already exists`,
    });
  }

  // Generic fallback
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Prevent information leakage from downstream API errors (e.g., Gemini API, database)
  if (typeof message === 'string') {
    // 1. Check if the error message is a JSON string (common for downstream API errors)
    try {
      const parsed = JSON.parse(message);
      if (parsed && (parsed.error || parsed.message || parsed.status)) {
        const internalMessage = parsed.error?.message || parsed.message || '';
        
        if (internalMessage.toLowerCase().includes('high demand') || internalMessage.toLowerCase().includes('unavailable')) {
          message = 'The AI service is temporarily experiencing high demand. Please try again in a few moments.';
        } else if (internalMessage.toLowerCase().includes('limit') || internalMessage.toLowerCase().includes('quota')) {
          message = 'AI service quota or rate limit exceeded. Please try again later.';
        } else {
          message = 'The AI service is temporarily unavailable. Please try again later.';
        }
        statusCode = 503;
      }
    } catch (e) {
      // Message is not a valid JSON string, continue to substring sanitization
    }

    // 2. Perform substring checks for sensitive keywords or raw error details
    const messageLower = message.toLowerCase();
    if (messageLower.includes('high demand') || messageLower.includes('unavailable') || messageLower.includes('gemini') || messageLower.includes('googlegenai')) {
      message = 'The AI service is temporarily experiencing high demand. Please try again in a few moments.';
      statusCode = 503;
    } else if (messageLower.includes('api_key') || messageLower.includes('apikey') || messageLower.includes('credential') || messageLower.includes('auth') || messageLower.includes('secret')) {
      message = 'A system configuration error occurred. Please contact support.';
      statusCode = 500;
    } else if (messageLower.includes('mongodb') || messageLower.includes('mongo_uri') || messageLower.includes('database') || messageLower.includes('connection')) {
      message = 'A database connection error occurred. Please try again later.';
      statusCode = 500;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
