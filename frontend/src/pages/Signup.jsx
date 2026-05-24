import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ fullName: '', mobile: '', email: '', password: '' });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null); // null = not started
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Countdown timer after submit
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // When countdown hits 0, redirect to OTP page
  useEffect(() => {
    if (countdown === 0) {
      navigate('/verify-otp', { state: { email: form.email, name: form.fullName } });
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    setCountdown(30); // start countdown immediately

    // Fire API in background — don't await it blocking the UI
    fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          toast.success('OTP sent! Redirecting…');
        }
        // Whether success or fail, the countdown will redirect anyway
      })
      .catch(() => {
        // API failed — countdown still runs, master OTP will work
      });
  };

  if (countdown !== null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 size={28} className="text-white animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[#1a3a5c] mb-2">Setting up your account</h2>
            <p className="text-sm text-gray-400 mb-6">
              Sending OTP to <span className="font-medium text-gray-700">{form.email}</span>
            </p>

            {/* Countdown ring */}
            <div className="w-20 h-20 mx-auto mb-4 relative flex items-center justify-center">
              <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#1a3a5c" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 30)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="text-2xl font-bold text-[#1a3a5c]">{countdown}</span>
            </div>

            <p className="text-xs text-gray-400">
              Redirecting to OTP page in <b>{countdown}s</b>…
            </p>
            <p className="text-xs text-gray-400 mt-2">
              If OTP email doesn't arrive, use master OTP on the next page.
            </p>

            {/* Skip wait */}
            <button
              onClick={() => setCountdown(0)}
              className="mt-4 text-xs text-[#1a3a5c] underline hover:text-blue-700"
            >
              Skip wait →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#e85d26] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Create Account</h1>
            <p className="text-sm text-gray-400 mt-1">Register for Associate Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">Full Name <span className="text-red-500">*</span></label>
              <input className="input-base" placeholder="Your full name" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
            </div>
            <div>
              <label className="label-base">Mobile</label>
              <input className="input-base" type="tel" maxLength={10} placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
            <div>
              <label className="label-base">Email Address <span className="text-red-500">*</span></label>
              <input className="input-base" type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="label-base">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input className="input-base pr-10" type={show ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              <UserPlus size={16} /> Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1a3a5c] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
