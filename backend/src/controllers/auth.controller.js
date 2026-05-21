import User from '../models/User.model.js';
import { signToken } from '../utils/jwt.js';
import { sendOTP, sendWelcome } from '../utils/mailer.js';

// alias for forgot password
const transporter_send = sendOTP;

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { email, password, fullName, mobile } = req.body;
    if (!email || !password || !fullName)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });

    const exists = await User.findOne({ email });
    if (exists && exists.isVerified)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const otp      = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (exists && !exists.isVerified) {
      // Resend OTP
      exists.otp       = otp;
      exists.otpExpiry = otpExpiry;
      await exists.save();
    } else {
      await User.create({
        email, password,
        role:   'associate',
        profile: { fullName, mobile: mobile || '' },
        otp, otpExpiry,
        isVerified:       false,
        isActive:         false,
        isSelfRegistered: true,
      });
    }

    await sendOTP(email, otp, fullName);
    res.status(201).json({ success: true, message: 'OTP sent to your email' });
  } catch (err) { next(err); }
};

// POST /api/auth/verify-otp
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified)
      return res.status(400).json({ success: false, message: 'Already verified' });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > user.otpExpiry)
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });

    user.isVerified = true;
    user.otp        = undefined;
    user.otpExpiry  = undefined;
    await user.save();

    await sendWelcome(email, user.profile.fullName, user.role);
    res.json({ success: true, message: 'Email verified! Awaiting admin approval.' });
  } catch (err) { next(err); }
};

// POST /api/auth/resend-otp
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified)
      return res.status(400).json({ success: false, message: 'Already verified' });

    const otp      = generateOTP();
    user.otp       = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTP(email, otp, user.profile.fullName);
    res.json({ success: true, message: 'OTP resent' });
  } catch (err) { next(err); }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isVerified)
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval' });

    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    const otp      = generateOTP();
    user.otp       = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await transporter_send(email, otp, user.profile.fullName);
    res.json({ success: true, message: 'Password reset OTP sent to your email' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email }).select('+otp +otpExpiry +password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > user.otpExpiry)
      return res.status(400).json({ success: false, message: 'OTP expired' });

    user.password  = password;
    user.otp       = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (err) { next(err); }
};
