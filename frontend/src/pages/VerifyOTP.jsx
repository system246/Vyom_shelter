import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

export default function VerifyOTP() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const email      = state?.email || '';
  const name       = state?.name  || '';
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Email verified! Awaiting admin approval.');
      navigate('/login');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res  = await fetch(`${BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('OTP resent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) { toast.error(err.message); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Verify Email</h1>
          <p className="text-sm text-gray-400 mt-2">
            We sent a 6-digit OTP to<br />
            <span className="font-medium text-gray-700">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#1a3a5c] focus:outline-none transition-colors"
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-gray-400">Resend OTP in <span className="font-medium text-gray-600">{countdown}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={resending} className="text-sm text-[#1a3a5c] font-medium hover:underline">
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
