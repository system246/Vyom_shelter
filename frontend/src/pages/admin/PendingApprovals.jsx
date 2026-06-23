import { useEffect, useState, useCallback } from 'react';
import BackButton from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PendingApprovals() {
  const { authFetch } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await authFetch('/api/users?pending=true');
      const data = await res.json();
      setUsers(data.data || []);
    } catch { toast.error('Failed to load pending users'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id, name) => {
    try {
      const res  = await authFetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${name} approved! Approval email sent.`);
      setUsers(u => u.filter(x => x._id !== id));
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Reject and delete ${name}'s account?`)) return;
    try {
      const res  = await authFetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${name}'s account rejected`);
      setUsers(u => u.filter(x => x._id !== id));
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Pending Approvals</h1>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} users awaiting approval</p>
        </div>
        <button onClick={load} className="btn-ghost border border-gray-200"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {u.profile?.fullName?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{u.profile?.fullName}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Registered {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleApprove(u._id, u.profile?.fullName)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                  <CheckCircle size={13} /> Approve
                </button>
                <button onClick={() => handleReject(u._id, u.profile?.fullName)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
