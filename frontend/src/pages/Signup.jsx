import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';

const BASE = import.meta.env.VITE_API_URL || '/api';

const MOBILE_RE = /^\d{10}$/;
const EMAIL_RE  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASS_RE   = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const PASS_CHECKS = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { label: 'One number',            test: (p) => /\d/.test(p) },
];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]               = useState({ fullName: '', mobile: '', email: '', password: '' });
  const [confirmPassword, setConfirm] = useState('');
  const [show, setShow]               = useState({ pass: false, confirm: false });
  const [loading, setLoading]         = useState(false);
  const [touched, setTouched]         = useState({});

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k)    => setTouched(t => ({ ...t, [k]: true }));

  const mobileErr     = touched.mobile  && form.mobile  && !MOBILE_RE.test(form.mobile) ? 'Enter a valid 10-digit mobile number' : '';
  const emailErr      = touched.email   && form.email   && !EMAIL_RE.test(form.email)   ? 'Enter a valid email address' : '';
  const passwordOk    = PASS_RE.test(form.password);
  const passwordsMatch = form.password.length > 0 && form.password === confirmPassword;
  const confirmErr    = confirmPassword.length > 0 && !passwordsMatch ? "Passwords don't match" : '';

  const canSubmit = !loading && form.fullName.trim() && EMAIL_RE.test(form.email) && passwordOk && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.mobile && !MOBILE_RE.test(form.mobile)) return toast.error('Enter a valid 10-digit mobile number');
    if (!EMAIL_RE.test(form.email))                  return toast.error('Enter a valid email address');
    if (!passwordOk)                                 return toast.error('Password does not meet the requirements');
    if (!passwordsMatch)                             return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { email: form.email, name: form.fullName } });
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      iconGradient="from-[#e85d26] to-[#f3792e]"
      title="Create Account"
      subtitle="Register for Associate Portal"
      footer={
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1a3a5c] font-medium hover:underline">Sign In</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="label-base">Full Name <span className="text-red-500">*</span></label>
          <input className="input-base" placeholder="Your full name"
            value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
        </div>

        {/* Mobile */}
        <div>
          <label className="label-base">Mobile Number</label>
          <input
            className={`input-base ${mobileErr ? 'input-error' : ''}`}
            type="tel" inputMode="numeric" maxLength={10}
            placeholder="10-digit mobile number"
            value={form.mobile}
            onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            onBlur={() => touch('mobile')}
          />
          {mobileErr && <p className="error-msg mt-1"><XCircle size={11} />{mobileErr}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="label-base">Email Address <span className="text-red-500">*</span></label>
          <input
            className={`input-base ${emailErr ? 'input-error' : touched.email && !emailErr && form.email ? 'border-green-400' : ''}`}
            type="email" placeholder="you@email.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            onBlur={() => touch('email')}
            required
          />
          {emailErr && <p className="error-msg mt-1"><XCircle size={11} />{emailErr}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="label-base">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              className="input-base pr-10"
              type={show.pass ? 'text' : 'password'}
              placeholder="Min 8 chars, upper, lower & number"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
            <button type="button" onClick={() => setShow(s => ({ ...s, pass: !s.pass }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show.pass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {/* Live checklist */}
          {form.password && (
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {PASS_CHECKS.map(({ label, test }) => (
                <div key={label} className={`flex items-center gap-1 text-[11px] ${test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  {test(form.password) ? <CheckCircle2 size={10} /> : <XCircle size={10} />} {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label-base">Confirm Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              className={`input-base pr-10 ${confirmErr ? 'input-error' : passwordsMatch ? 'border-green-400 focus:ring-green-400/40' : ''}`}
              type={show.confirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
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

        <button type="submit" disabled={!canSubmit}
          className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <UserPlus size={16} /> {loading ? 'Sending OTP...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
