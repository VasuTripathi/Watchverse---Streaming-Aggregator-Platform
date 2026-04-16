const logger = require('./logger');

// Custom API Error
class APIError extends Error {
  constructor(message, statusCode = 500, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  logger.error(`Request Error: ${req.method} ${req.path}`, {
    error: err.message,
    statusCode: err.statusCode || 500,
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Avoid sending stack trace in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.data && { data: err.data }),
  };

  res.status(statusCode).json(response);
};

// Async wrapper to catch errors in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error formatter
const formatValidationError = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map((err) => ({
      field: err.path || 'unknown',
      message: err.message,
    }));
  }
  return [{ message: 'Validation error' }];
};

module.exports = {
  APIError,
  errorHandler,
  asyncHandler,
  formatValidationError,
};
