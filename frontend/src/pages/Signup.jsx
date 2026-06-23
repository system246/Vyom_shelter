import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ fullName: '', mobile: '', email: '', password: '' });
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
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
              <UserPlus size={16} /> {loading ? 'Sending OTP...' : 'Create Account'}
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
