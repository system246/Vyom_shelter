import { useState } from 'react';
import BackButton from '../../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MOBILE_RE = /^\d{10}$/;
const EMAIL_RE  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASS_RE   = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const PASS_CHECKS = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  test: (p) => /[a-z]/.test(p) },
  { label: 'One number',            test: (p) => /\d/.test(p) },
];

export default function CreateUser() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const isHead   = user?.role === 'head_admin';

  const [form, setForm]               = useState({ fullName: '', mobile: '', email: '', password: '', role: isHead ? 'admin' : 'associate' });
  const [confirmPassword, setConfirm] = useState('');
  const [show, setShow]               = useState({ pass: false, confirm: false });
  const [loading, setLoading]         = useState(false);
  const [touched, setTouched]         = useState({});

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k)    => setTouched(t => ({ ...t, [k]: true }));

  const mobileErr     = touched.mobile && form.mobile && !MOBILE_RE.test(form.mobile) ? 'Enter a valid 10-digit mobile number' : '';
  const emailErr      = touched.email  && form.email  && !EMAIL_RE.test(form.email)   ? 'Enter a valid email address' : '';
  const passwordOk    = PASS_RE.test(form.password);
  const passwordsMatch = form.password.length > 0 && form.password === confirmPassword;
  const confirmErr    = confirmPassword.length > 0 && !passwordsMatch ? "Passwords don't match" : '';

  const canSubmit = !loading && form.fullName.trim() && EMAIL_RE.test(form.email) && passwordOk && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.mobile && !MOBILE_RE.test(form.mobile))     return toast.error('Enter a valid 10-digit mobile number');
    if (!EMAIL_RE.test(form.email))                      return toast.error('Enter a valid email address');
    if (!passwordOk)                                     return toast.error('Password does not meet the requirements');
    if (!passwordsMatch)                                 return toast.error('Passwords do not match');

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

        {/* Full Name */}
        <div>
          <label className="label-base">Full Name <span className="text-red-500">*</span></label>
          <input className="input-base" placeholder="e.g. Ramesh Kumar"
            value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
        </div>

        {/* Mobile */}
        <div>
          <label className="label-base">Mobile</label>
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
          <label className="label-base">Email (Login ID) <span className="text-red-500">*</span></label>
          <input
            className={`input-base ${emailErr ? 'input-error' : touched.email && !emailErr && form.email ? 'border-green-400' : ''}`}
            type="email" placeholder="user@portal.com"
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
              placeholder="Re-enter the password"
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

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={!canSubmit}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            <UserPlus size={15} /> {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
