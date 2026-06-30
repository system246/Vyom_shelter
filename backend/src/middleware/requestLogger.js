import { nanoid } from 'nanoid';
import { logger } from '../utils/logger.js';

/**
 * Logs every request once it finishes, with a short request ID attached so
 * a person reading the logs (or you, debugging) can match a specific
 * frontend error toast back to the exact backend log line — the request ID
 * is also returned in error responses (see errorHandler.js) for this reason.
 */
export const requestLogger = (req, res, next) => {
  req.requestId = nanoid(8);
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta = {
      id: req.requestId,
      status: res.statusCode,
      ms: duration,
      ...(req.user ? { user: req.user._id?.toString(), role: req.user.role } : {}),
    };
    const line = `${req.method} ${req.originalUrl}`;

    if (res.statusCode >= 500) logger.error(line, meta);
    else if (res.statusCode >= 400) logger.warn(line, meta);
    else logger.info(line, meta);
  });

  next();
};
