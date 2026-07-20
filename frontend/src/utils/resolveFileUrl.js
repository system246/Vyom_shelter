const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

/**
 * Resolves a stored file reference to a usable URL.
 * - Full Cloudinary URLs (https://...) are returned as-is
 * - Legacy local paths are prefixed with the backend base URL
 */
export const resolveFileUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE}/uploads/${value}`;
};
