import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.model.js';

// Attach req.user from Bearer token
export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Not authenticated' });

    const payload = verifyToken(auth.split(' ')[1]);
    const user = await User.findById(payload.id).select('-password');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'User not found or inactive' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Allow if user's primary role OR any of their extra roles is in the list
export const allow = (...roles) => (req, res, next) => {
  const effectiveRoles = [req.user.role, ...(req.user.roles || [])];
  const permitted = roles.some(r => effectiveRoles.includes(r));
  if (!permitted)
    return res.status(403).json({ success: false, message: 'Access denied' });
  next();
};

// Helper: check if req.user has a given role (including extra roles)
export const hasRole = (user, role) => {
  return user.role === role || (user.roles || []).includes(role);
};
