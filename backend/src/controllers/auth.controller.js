import User from '../models/User.model.js';
import { signToken } from '../utils/jwt.js';

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is disabled' });

    const token = signToken(user._id);
    const safeUser = user.toJSON();

    res.json({ success: true, token, user: safeUser });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
