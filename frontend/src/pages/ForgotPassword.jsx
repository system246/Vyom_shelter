import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
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
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
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
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Reset Password</h1>
            <p className="text-sm text-gray-400 mt-1">{step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}</p>
          </div>

          {step === 1 ? (
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="label-base">Email Address</label>
                <input className="input-base" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPass} className="space-y-4">
              <div>
                <label className="label-base">OTP (sent to {email})</label>
                <input className="input-base text-center tracking-[0.5em] text-xl font-bold" maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} required />
              </div>
              <div>
                <label className="label-base">New Password</label>
                <div className="relative">
                  <input className="input-base pr-10" type={show ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShow(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary w-full justify-center">← Back</button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            <Link to="/login" className="text-[#1a3a5c] font-medium hover:underline">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
