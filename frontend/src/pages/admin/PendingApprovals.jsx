import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, RefreshCw, Clock, User } from 'lucide-react';
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

  const handleApprove = async (user) => {
    try {
      // 1. Activate user account
      const res1 = await authFetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      const d1 = await res1.json();
      if (!res1.ok) throw new Error(d1.message);

      // 2. If they have an associate record, approve it too and generate candidate ref no
      if (user.associateRecordId) {
        await authFetch(`/api/associates/${user.associateRecordId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        });
      }

      toast.success(`${user.profile?.fullName} approved!`);
      setUsers(u => u.filter(x => x._id !== user._id));
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async (user) => {
    if (!confirm(`Reject ${user.profile?.fullName}? This will mark their form as rejected.`)) return;
    try {
      // Mark associate form as rejected (don't delete user — they can re-submit)
      if (user.associateRecordId) {
        await authFetch(`/api/associates/${user.associateRecordId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' }),
        });
      }
      toast.success(`${user.profile?.fullName}'s application rejected`);
      setUsers(u => u.filter(x => x._id !== user._id));
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Pending Approvals</h1>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} users awaiting approval</p>
        </div>
        <button onClick={load} className="btn-ghost border border-gray-200 p-2 rounded-lg">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle size={32} className="mx-auto text-green-400 mb-3" />
          <p className="text-gray-400 text-sm">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(u => {
            const initials = u.profile?.fullName?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
            return (
              <div key={u._id} className="card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{u.profile?.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      <Clock size={10} /> Pending
                    </span>
                    {u.associateRecordId && (
                      <span className="text-xs text-gray-400">Form submitted · ID: {u.associateRecordId}</span>
                    )}
                    {!u.associateRecordId && (
                      <span className="text-xs text-amber-500">Form not submitted yet</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Registered: {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(u)}
                    disabled={!u.associateRecordId}
                    title={!u.associateRecordId ? 'User has not submitted their form yet' : 'Approve'}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(u)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
