import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Handle Zod Schema Validation Errors
  if (err.name === "ZodError" || err.constructor?.name === "ZodError") {
    const rawIssues = err.issues || err.errors || [];
    const errors = rawIssues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    const message = rawIssues[0]?.message || "Validation failed";
    error = new ApiError(400, message, errors, err.stack);
  }

  // Handle Prisma Database Errors
  else if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    let message = "Database error occurred";
    let statusCode = 500;
    let errors = [];

    if (err.code === "P2002") {
      // Unique constraint failed
      statusCode = 409;
      const target = err.meta?.target || [];
      const fields = Array.isArray(target) ? target.join(", ") : target;
      message = fields ? `${fields} already exists` : "Record already exists";
    } else if (err.code === "P2025") {
      // Record not found
      statusCode = 404;
      message = err.meta?.cause || "Record not found";
    } else if (err.code === "P2003") {
      // Foreign key constraint failed
      statusCode = 400;
      message = "Invalid reference: related record not found";
    } else {
      message = `Prisma error ${err.code}: ${err.message}`;
    }
    
    error = new ApiError(statusCode, message, errors, err.stack);
  }

  // Handle JWT Auth Errors
  else if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token", [], err.stack);
  } else if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token has expired", [], err.stack);
  }

  // Handle Multer Upload Errors
  else if (err.name === "MulterError" || err.code?.startsWith("LIMIT_")) {
    let message = err.message;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size limit exceeded (maximum size is 4MB)";
    }
    error = new ApiError(400, message, [], err.stack);
  }

  // Ensure the error is an instance of ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    error = new ApiError(statusCode, message, [], err.stack);
    // Unpredicted errors are not marked as operational
    error.isOperational = false;
  }

  // Build unified JSON response format matching API standards
  const response = {
    success: false,
    message: error.message,
    errors: Array.isArray(error.errors) ? error.errors : [],
  };

  // Add stack trace in development mode only
  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
  } else if (!error.isOperational) {
    // Obscure internal server error details in production
    response.message = "Internal server error. Please try again later.";
  }

  // Sanitized logging
  if (error.statusCode >= 500) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[500 Server Error] ${req.method} ${req.originalUrl} - ${error.message}`);
    } else {
      console.error(`[500 Server Error] ${req.method} ${req.originalUrl}:`, err);
    }
  } else if (error.statusCode === 401 && error.message === "Token not provided") {
    // Silent for standard unauthenticated guest pings to prevent terminal log noise
  } else {
    console.warn(`[${error.statusCode} Client Warning] ${req.method} ${req.originalUrl}:`, error.message);
  }

  res.status(error.statusCode).json(response);
};

export default errorMiddleware;
