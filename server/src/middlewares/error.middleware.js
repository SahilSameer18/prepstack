const AppError = require('../utils/AppError');

/**
 * Centralized Express error-handling middleware.
 *
 * Handles:
 *  - AppError (operational, thrown by our code)
 *  - Mongoose ValidationError        → 422
 *  - Mongoose CastError (bad ObjectId) → 400
 *  - Mongoose duplicate-key (11000)   → 409
 *  - JWT JsonWebTokenError            → 403
 *  - JWT TokenExpiredError            → 401
 *  - Everything else                  → 500
 *
 * In development the full stack trace is included in the response.
 * In production only the message is sent.
 */

// ── Mongoose / JWT error transformers ─────────────────────────────────────────

function handleCastError(err) {
  return new AppError(400, `Invalid value for field "${err.path}": ${err.value}`);
}

function handleValidationError(err) {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(422, `Validation failed: ${messages.join('. ')}`);
}

function handleDuplicateKeyError(err) {
  // Extract the duplicated field name from the error key-value map
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return new AppError(409, `An account with that ${field} already exists`);
}

function handleJWTError() {
  return new AppError(403, 'Invalid token. Please log in again.');
}

function handleJWTExpiredError() {
  return new AppError(401, 'Your session has expired. Please log in again.');
}

// ── Response senders ──────────────────────────────────────────────────────────

function sendDevError(err, res) {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

function sendProdError(err, res) {
  if (err.isOperational) {
    // Known, safe-to-expose error
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programmer or unknown error — don't leak details
    console.error('UNEXPECTED ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
}

// ── Main middleware ────────────────────────────────────────────────────────────

const errorMiddleware = (err, req, res, next) => {
  // Default to 500 if statusCode wasn't set
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
    return;
  }

  // In production, transform known error types into AppErrors
  let error = err;

  if (err.name === 'CastError') error = handleCastError(err);
  else if (err.name === 'ValidationError') error = handleValidationError(err);
  else if (err.code === 11000) error = handleDuplicateKeyError(err);
  else if (err.name === 'JsonWebTokenError') error = handleJWTError();
  else if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendProdError(error, res);
};

module.exports = errorMiddleware;

