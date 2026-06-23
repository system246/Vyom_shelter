import { useState } from 'react';
import BackButton from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateUser() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const isHead   = user?.role === 'head_admin';

  const [form, setForm]     = useState({ fullName: '', mobile: '', email: '', password: '', role: isHead ? 'admin' : 'associate' });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password)
      return toast.error('Fill all required fields');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res  = await authFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    form.email,
          password: form.password,
          role:     form.role,
          profile:  { fullName: form.fullName, mobile: form.mobile },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${form.role.replace('_', ' ')} created successfully`);
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <BackButton />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1a3a5c]">Create User</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isHead ? 'You can create admins and associates.' : 'You can create associates only.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {/* Role selector */}
        <div>
          <label className="label-base">Role <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            {(isHead ? ['admin', 'associate'] : ['associate']).map(r => (
              <label key={r} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all
                ${form.role === r ? 'border-[#1a3a5c] bg-[#e8f0fb] text-[#1a3a5c]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <input type="radio" className="sr-only" value={r} checked={form.role === r} onChange={() => set('role', r)} />
                {r === 'admin' ? '🛡 Admin' : '👤 Associate'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label-base">Full Name <span className="text-red-500">*</span></label>
          <input className="input-base" placeholder="e.g. Ramesh Kumar" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
        </div>

        <div>
          <label className="label-base">Mobile</label>
          <input className="input-base" type="tel" maxLength={10} placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
        </div>

        <div>
          <label className="label-base">Email (Login ID) <span className="text-red-500">*</span></label>
          <input className="input-base" type="email" placeholder="user@portal.com" value={form.email} onChange={e => set('email', e.target.value)} required />
        </div>

        <div>
          <label className="label-base">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              className="input-base pr-10"
              type={show ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            <UserPlus size={15} /> {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
