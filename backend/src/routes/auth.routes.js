import express from 'express';
import { signup, verifyOTP, resendOTP, login, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { loginLimiter, otpLimiter, accountActionLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  signupSchema, loginSchema, verifyOtpSchema, resendOtpSchema,
  forgotPasswordSchema, resetPasswordSchema,
} from '../validations/schemas.js';

const router = express.Router();

router.post('/signup',          accountActionLimiter, validate(signupSchema), signup);
router.post('/verify-otp',      otpLimiter,            validate(verifyOtpSchema), verifyOTP);
router.post('/resend-otp',      otpLimiter,            validate(resendOtpSchema), resendOTP);
router.post('/login',           loginLimiter,          validate(loginSchema), login);
router.post('/forgot-password', accountActionLimiter,  validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',  otpLimiter,             validate(resetPasswordSchema), resetPassword);
router.get('/me',               protect,                getMe);

export default router;
