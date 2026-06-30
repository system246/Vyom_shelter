import rateLimit from 'express-rate-limit';

// Login: enough headroom for someone fumbling a password a few times, but
// stops a brute-force script cold. Previously there was NO limit at all.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// OTP endpoints: tighter, since these also trigger an outbound email each
// time — without a limit, this is both a brute-force vector AND a free
// email-bombing tool against any address.
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes and try again.' },
});

// Signup / forgot-password: same email-triggering concern, slightly looser.
export const accountActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait 15 minutes and try again.' },
});

// Generic API-wide limiter — a safety net against scraping/DoS on every
// other route, much looser than the auth-specific ones above.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
