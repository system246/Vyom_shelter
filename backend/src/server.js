import dotenv from 'dotenv';
dotenv.config(); // must run before any route/controller import that reads process.env at load time

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './utils/db.js';
import authRoutes         from './routes/auth.routes.js';
import userRoutes         from './routes/user.routes.js';
import associateRoutes    from './routes/associate.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import activityRoutes     from './routes/activity.routes.js';
import propertyRoutes     from './routes/property.routes.js';
import serviceRoutes      from './routes/service.routes.js';
import { getSitemap } from './controllers/sitemap.controller.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { requestLogger } from './middleware/requestLogger.js';
import { logger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

connectDB();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow frontend (different origin) to load /uploads images
  contentSecurityPolicy: false, // this is an API + file server, not a page-rendering app; CSP isn't applicable here
}));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use(requestLogger);
app.get('/sitemap.xml', getSitemap); // public, unauthenticated, intentionally before the rate limiter
app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/associates',    associateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-log',  activityRoutes);
app.use('/api/properties',    propertyRoutes);
app.use('/api/services',      serviceRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({
  success: false,
  code: 'NOT_FOUND',
  message: `No route ${req.method} ${req.originalUrl}`,
  requestId: req.requestId || 'unknown',
}));
app.use(errorHandler);

// Without these, an error thrown outside Express's own request/response
// cycle (e.g. inside a stray async callback, a bad DB driver event) would
// crash the process with zero log output — on a host that auto-restarts
// the server, that's a silent, repeating crash loop with no trace of why.
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason?.message || String(reason), stack: reason?.stack });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception — process will exit', { message: err.message, stack: err.stack });
  process.exit(1); // let the host's process manager restart cleanly rather than continue in a corrupted state
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.success(`API running → http://localhost:${PORT}/api`);
  logger.info(`Files (legacy local fallback) → http://localhost:${PORT}/uploads`);
});
