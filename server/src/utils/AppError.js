/**
 * AppError — a structured, operational error for use in controllers/services.
 *
 * Usage:
 *   throw new AppError(404, 'Project not found');
 *   next(new AppError(403, 'Forbidden'));
 *
 * isOperational = true  → known, expected error (shown to client)
 * isOperational = false → programmer error / unexpected (should not happen)
 */
class AppError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) && errors.length > 0 ? errors : [message];
    this.isOperational = true;
    // Capture clean stack trace (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;