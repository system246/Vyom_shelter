import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, ShieldCheck, ShieldOff, RefreshCw, UserCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RoleBadge = ({ roles = [], primary }) => {
  const all = [...new Set([primary, ...roles])];
  const isAdmin = all.includes('admin') || all.includes('head_admin');
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border
      ${isAdmin
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
      {isAdmin ? <ShieldCheck size={10} /> : <UserCheck size={10} />}
      {all.includes('head_admin') ? 'Head Admin' : all.includes('admin') ? 'Admin + Associate' : 'Associate'}
    </span>
  );
};

export default function CreateAdmin() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [list, setList]         = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [promoting, setPromoting] = useState(null); // id being promoted
  const [demoting, setDemoting]   = useState(null); // id being demoted

  const load = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      const res  = await authFetch(`/api/users/associates-list?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setList(data.data || []);
    } catch (err) { toast.error(err.message || 'Failed to load associates'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search, load]);

  const promote = async (user) => {
    if (!confirm(`Promote ${user.profile?.fullName} to Admin? They will keep their Associate role.`)) return;
    setPromoting(user._id);
    try {
      const res  = await authFetch(`/api/users/${user._id}/promote`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setList(l => l.map(u => u._id === user._id ? { ...u, roles: [...(u.roles || []), 'admin'] } : u));
    } catch (err) { toast.error(err.message); }
    finally { setPromoting(null); }
  };

  const demote = async (user) => {
    if (!confirm(`Remove Admin permissions from ${user.profile?.fullName}? They will remain as Associate.`)) return;
    setDemoting(user._id);
    try {
      const res  = await authFetch(`/api/users/${user._id}/demote`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Admin permissions removed from ${user.profile?.fullName}`);
      setList(l => l.map(u => u._id === user._id ? { ...u, roles: (u.roles || []).filter(r => r !== 'admin') } : u));
    } catch (err) { toast.error(err.message); }
    finally { setDemoting(null); }
  };

  const admins  = list.filter(u => (u.roles || []).includes('admin'));
  const pending = list.filter(u => !(u.roles || []).includes('admin'));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost border border-gray-200 p-1.5 rounded-lg">
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#1a3a5c]">Manage Admins</h1>
          <p className="text-xs text-gray-400 mt-0.5">Promote associates to admin or remove admin access</p>
        </div>
        <button onClick={() => load(search)} className="btn-ghost border border-gray-200 p-1.5 rounded-lg">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search associates by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 focus:border-[#1a3a5c]"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading associates…</div>
      ) : list.length === 0 ? (
        <div className="card p-12 text-center">
          <UserCheck size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No associates found</p>
        </div>
      ) : (
        <>
          {/* Current Admins */}
          {admins.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Current Admins ({admins.length})
              </h2>
              <div className="space-y-2">
                {admins.map(u => (
                  <UserRow
                    key={u._id}
                    user={u}
                    isAdmin={true}
                    onDemote={() => demote(u)}
                    loading={demoting === u._id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Associates — can be promoted */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Associates ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map(u => (
                  <UserRow
                    key={u._id}
                    user={u}
                    isAdmin={false}
                    onPromote={() => promote(u)}
                    loading={promoting === u._id}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function UserRow({ user, isAdmin, onPromote, onDemote, loading }) {
  const initials = user.profile?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors   = ['bg-[#1a3a5c]', 'bg-blue-500', 'bg-teal-500', 'bg-indigo-500', 'bg-violet-500'];
  const color    = colors[initials.charCodeAt(0) % colors.length];

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-800 text-sm">{user.profile?.fullName}</p>
          <RoleBadge primary={user.role} roles={user.roles} />
        </div>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
      </div>
      {isAdmin ? (
        <button
          onClick={onDemote}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <ShieldOff size={12} />
          {loading ? 'Removing…' : 'Remove Admin'}
        </button>
      ) : (
        <button
          onClick={onPromote}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <ShieldCheck size={12} />
          {loading ? 'Promoting…' : 'Make Admin'}
        </button>
      )}
    </div>
  );
}
