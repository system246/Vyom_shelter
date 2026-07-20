/**
 * Central fetch wrapper used by every service file.
 *
 * Fixes three real error-message problems that existed before:
 *
 * 1. Network failure ("Failed to fetch") — raw browser error shown verbatim.
 *    Now: "No internet connection. Please check your network and try again."
 *
 * 2. data.message was undefined — several callers did `throw new Error(data.message)`
 *    with no fallback. If the backend returned an unexpected shape, the toast
 *    showed "undefined" or a blank error.
 *    Now: always falls back to a clear generic message.
 *
 * 3. Proxy/platform error pages — Vercel/Render sometimes return HTML (not
 *    JSON) for their own errors (cold-start timeout, deploy in progress, etc).
 *    res.json() would throw a SyntaxError, propagating as "Unexpected token <"
 *    which is meaningless to any user.
 *    Now: HTML responses are caught and converted to a clean message.
 */

const USER_MESSAGES = {
  VALIDATION_ERROR:  null,           // use the per-field errors or the message as-is
  NOT_FOUND:         'Not found.',
  FORBIDDEN:         'You don\'t have permission to do that.',
  INVALID_TOKEN:     'Your session has expired. Please log in again.',
  TOKEN_EXPIRED:     'Your session has expired. Please log in again.',
  DUPLICATE_ENTRY:   null,           // message from server is clear enough ("This email is already in use")
  FILE_TOO_LARGE:    null,           // message from server includes the limit
  SERVER_ERROR:      'Something went wrong on our end. Please try again in a moment.',
  NOT_AUTHENTICATED: 'Please log in to continue.',
};

export const parseErrorMessage = (data) => {
  if (!data) return 'Something went wrong. Please try again.';
  // If the backend gave us a specific code, check for a friendlier override
  if (data.code && USER_MESSAGES[data.code] !== null && USER_MESSAGES[data.code] !== undefined) {
    return USER_MESSAGES[data.code];
  }
  // Fall through to the server's own message (which is now always set by errorHandler.js)
  return data.message || 'Something went wrong. Please try again.';
};

export const apiCall = async (url, options = {}) => {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    // fetch() itself throws only on network-level failures (no internet,
    // DNS failure, server completely unreachable). The raw error is
    // "Failed to fetch" which is meaningless to a real user.
    throw new Error('No internet connection. Please check your network and try again.');
  }

  // Parse the body — but guard against HTML responses from proxy/platform
  // error pages (Vercel/Render serve their own HTML on cold-start timeouts,
  // deploy-in-progress, etc), which break .json() with "Unexpected token <"
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    // Non-JSON response — almost certainly a platform/proxy error page
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(
        res.status === 503
          ? 'The server is temporarily unavailable. Please try again in a moment.'
          : res.status === 502
          ? 'The server is starting up. Please wait a few seconds and try again.'
          : `Server error (${res.status}). Please try again.`
      );
    }
    // Successful but non-JSON — return as-is (shouldn't happen in normal flow)
    return text;
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(data));
  }

  return data;
};
