import { useState } from 'react';
import Seo from '../components/seo/Seo';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';

const BASE = import.meta.env.VITE_API_URL || '/api';

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASS_RE  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const PASS_CHECKS = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { label: 'One number',            test: (p) => /\d/.test(p) },
];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]               = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail]             = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [otp, setOtp]                 = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [show, setShow]               = useState({ pass: false, confirm: false });
  const [loading, setLoading]         = useState(false);

  const emailErr      = emailTouched && email && !EMAIL_RE.test(email) ? 'Enter a valid email address' : '';
  const passwordOk    = PASS_RE.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const confirmErr    = confirmPassword.length > 0 && !passwordsMatch ? "Passwords don't match" : '';

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return toast.error('Enter a valid email address');
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    if (!passwordOk)     return toast.error('Password does not meet the requirements');
    if (!passwordsMatch) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Seo noindex title="Reset Password" />
    <AuthLayout
      icon={KeyRound}
      iconGradient="from-amber-500 to-orange-500"
      title="Reset Password"
      subtitle={step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and set a new password'}
      footer={
        <p className="text-sm text-gray-400">
          <Link to="/login" className="text-[#1a3a5c] font-medium hover:underline">← Back to Login</Link>
        </p>
      }
    >
      {step === 1 ? (
        <form onSubmit={sendOTP} className="space-y-4">
          <div>
            <label className="label-base">Email Address</label>
            <input
              className={`input-base ${emailErr ? 'input-error' : ''}`}
              type="email" placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              required
            />
            {emailErr && <p className="error-msg mt-1"><XCircle size={11} />{emailErr}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPass} className="space-y-4">
          <div>
            <label className="label-base">OTP (sent to {email})</label>
            <input className="input-base text-center tracking-[0.5em] text-xl font-bold" maxLength={6}
              placeholder="000000" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
          </div>

          {/* New Password */}
          <div>
            <label className="label-base">New Password</label>
            <div className="relative">
              <input
                className="input-base pr-10"
                type={show.pass ? 'text' : 'password'}
                placeholder="Min 8 chars, upper, lower & number"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, pass: !s.pass }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show.pass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password && (
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                {PASS_CHECKS.map(({ label, test }) => (
                  <div key={label} className={`flex items-center gap-1 text-[11px] ${test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                    {test(password) ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label-base">Confirm New Password</label>
            <div className="relative">
              <input
                className={`input-base pr-10 ${confirmErr ? 'input-error' : passwordsMatch ? 'border-green-400 focus:ring-green-400/40' : ''}`}
                type={show.confirm ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmErr    && <p className="error-msg mt-1"><XCircle size={11} />{confirmErr}</p>}
            {passwordsMatch && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 size={11} /> Passwords match</p>}
          </div>

          <button type="submit" disabled={loading || !passwordsMatch || !passwordOk}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <button type="button" onClick={() => setStep(1)} className="btn-secondary w-full justify-center">← Back</button>
        </form>
      )}
    </AuthLayout>
      </>
  );
}
