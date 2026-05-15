import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.profile.fullName}!`);
      // Route based on role
      if (user.role === 'head_admin') navigate('/admin/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/my-profile');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#1a3a5c] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Sign In</h1>
            <p className="text-sm text-gray-400 mt-1">Associate Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-base">Email Address</label>
              <input
                type="email"
                className="input-base"
                placeholder="you@portal.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label-base">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input-base pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              <LogIn size={16} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Contact your administrator if you don't have access.
          </p>
        </div>
      </div>
    </div>
  );
}
