const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

/**
 * Resolves a stored file reference to a usable <img src> / <a href> URL.
 *
 * Before Cloudinary: the DB stored a relative path like "images/abc.jpg",
 * and the frontend had to prepend the backend's /uploads/ base URL.
 *
 * After Cloudinary: the DB stores the full secure URL already
 * (https://res.cloudinary.com/...), which should be used as-is.
 *
 * This handles both, so any pre-Cloudinary test data you already have
 * doesn't break, while every new upload uses the CDN URL directly.
 */
export const resolveFileUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value; // already a full URL (Cloudinary)
  return `${API_BASE}/uploads/${value}`; // legacy local-disk path
};
