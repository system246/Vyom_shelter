/**
 * Structured logger. Writes to console only — NOT to a file.
 *
 * Why not a file: this app runs on free-tier hosting (Render/Railway/etc),
 * and those platforms wipe the local disk on every redeploy/restart — the
 * exact problem we already fixed for uploaded images by moving to
 * Cloudinary. Writing logs to disk here would have the identical bug:
 * logs disappearing right when you need them after a crash.
 *
 * Instead, every host worth using captures stdout/stderr automatically and
 * shows it in their dashboard (Render → Logs tab, Railway → Deployments →
 * Logs, etc) — that's the durable place for these to live for free.
 */

const LEVEL_COLOR = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', success: '\x1b[32m' };
const RESET = '\x1b[0m';

const timestamp = () => new Date().toISOString();

const write = (level, message, meta = {}) => {
  const color = LEVEL_COLOR[level] || '';
  const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  const line = `${color}[${timestamp()}] ${level.toUpperCase()}${RESET} ${message}${metaStr}`;
  (level === 'error' ? console.error : console.log)(line);
};

export const logger = {
  info:    (message, meta) => write('info', message, meta),
  warn:    (message, meta) => write('warn', message, meta),
  error:   (message, meta) => write('error', message, meta),
  success: (message, meta) => write('success', message, meta),
};
