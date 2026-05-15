import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_STYLE = {
  head_admin: 'bg-purple-100 text-purple-700',
  admin:      'bg-blue-100   text-blue-700',
  associate:  'bg-green-100  text-green-700',
};

export default function MyProfile() {
  const { user, authFetch } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [mobile, setMobile]     = useState(user?.profile?.mobile || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { profile: { fullName, mobile } };
      if (password) {
        if (password.length < 6) { toast.error('Password min 6 chars'); setSaving(false); return; }
        body.password = password;
      }
      const res  = await authFetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Profile updated');
      setEditing(false);
      setPassword('');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-[#1a3a5c] mb-6">My Profile</h1>

      <div className="card p-6">
        {/* Avatar + role */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold
            ${user?.role === 'head_admin' ? 'bg-purple-500' : user?.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
            {user?.profile?.fullName?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">{user?.profile?.fullName}</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_STYLE[user?.role]}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={15} className="text-gray-400" />
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={15} className="text-gray-400" />
              <span className="text-gray-600">{user?.profile?.mobile || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={15} className="text-gray-400" />
              <span className="text-gray-600">
                Joined {new Date(user?.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}
              </span>
            </div>
            <button onClick={() => setEditing(true)} className="btn-primary mt-4">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label-base">Full Name</label>
              <input className="input-base" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label-base">Mobile</label>
              <input className="input-base" type="tel" maxLength={10} value={mobile} onChange={e => setMobile(e.target.value)} />
            </div>
            <div>
              <label className="label-base">New Password <span className="text-gray-400 font-normal normal-case">(leave blank to keep current)</span></label>
              <input className="input-base" type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditing(false); setPassword(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
