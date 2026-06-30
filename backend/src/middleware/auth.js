import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.model.js';

// Attach req.user from Bearer token
export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ success: false, code: 'NOT_AUTHENTICATED', message: 'Not authenticated' });

    const payload = verifyToken(auth.split(' ')[1]);
    const user = await User.findById(payload.id).select('-password');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'User not found or inactive' });

    req.user = user;
    next();
  } catch (err) {
    // Token expired vs malformed both land here — same response either way
    // (no need to leak which, to the client), but errorHandler-style codes
    // keep the response shape consistent with the rest of the API.
    const expired = err?.name === 'TokenExpiredError';
    res.status(401).json({
      success: false,
      code: expired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      message: expired ? 'Your session has expired. Please log in again.' : 'Invalid or expired token',
    });
  }
};

// Allow only specified roles
export const allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Access denied' });
  next();
};
