import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.model.js';

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

export const allow = (...roles) => (req, res, next) => {
  const effectiveRoles = [req.user.role, ...(req.user.roles || [])];
  if (!roles.some(r => effectiveRoles.includes(r)))
    return res.status(403).json({ success: false, message: 'Access denied' });
  next();
};

export const hasRole = (user, role) =>
  user.role === role || (user.roles || []).includes(role);
