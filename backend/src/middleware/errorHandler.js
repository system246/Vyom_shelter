import { logger } from '../utils/logger.js';

/**
 * Every error response now has a consistent shape:
 *   { success: false, message, code, requestId, errors? }
 *
 * - message: human-readable, safe to show the user
 * - code: a short machine-readable string (e.g. 'VALIDATION_ERROR',
 *   'FILE_TOO_LARGE') so the frontend can branch on it without parsing text
 * - requestId: matches the ID in the server log line for this request —
 *   if a user reports "it broke", asking for this ID lets you find the
 *   exact log line instantly instead of guessing
 * - errors: present only for validation failures — an array of
 *   { field, message } so the frontend can show field-level errors
 */
export const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';

  // Multer file-size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.warn('File too large', { id: requestId, path: req.originalUrl });
    return res.status(400).json({
      success: false,
      code: 'FILE_TOO_LARGE',
      message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 5}MB.`,
      requestId,
    });
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    logger.warn('Mongoose validation failed', { id: requestId, path: req.originalUrl, errors });
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Some fields are invalid. Check the details below.',
      errors,
      requestId,
    });
  }

  // Our own zod-based validation middleware (see middleware/validate.js)
  if (err.name === 'AppValidationError') {
    logger.warn('Request validation failed', { id: requestId, path: req.originalUrl, errors: err.errors });
    return res.status(422).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Some fields are invalid. Check the details below.',
      errors: err.errors,
      requestId,
    });
  }

  // Mongoose invalid ObjectId / cast error (e.g. malformed id in URL)
  if (err.name === 'CastError') {
    logger.warn('Invalid ID format', { id: requestId, path: req.originalUrl });
    return res.status(400).json({
      success: false,
      code: 'INVALID_ID',
      message: 'Invalid ID format.',
      requestId,
    });
  }

  // Duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    logger.warn('Duplicate key', { id: requestId, path: req.originalUrl, field });
    return res.status(409).json({
      success: false,
      code: 'DUPLICATE_ENTRY',
      message: `This ${field} is already in use.`,
      requestId,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.warn('Auth token invalid/expired', { id: requestId, path: req.originalUrl });
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Your session has expired. Please log in again.',
      requestId,
    });
  }

  // Everything else — log full detail server-side, but never leak internals
  // (stack traces, raw DB errors, file paths) to the client in production.
  const status = err.status || err.statusCode || 500;
  logger.error(err.message || 'Unhandled server error', {
    id: requestId,
    path: req.originalUrl,
    status,
    stack: err.stack,
  });

  res.status(status).json({
    success: false,
    code: err.code && typeof err.code === 'string' ? err.code : 'SERVER_ERROR',
    message: status >= 500 ? 'Something went wrong on our end. Please try again.' : (err.message || 'Request failed'),
    requestId,
    ...(process.env.NODE_ENV !== 'production' ? { devStack: err.stack } : {}),
  });
};
