import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PendingApprovals() {
  const { authFetch } = useAuth();
  const [items, setItems]     = useState([]); // { user, associate }
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Get all self-registered users who have submitted a form
      const res  = await authFetch('/api/users?pending=true');
      const data = await res.json();
      const users = data.data || [];

      // For each user, fetch their associate form to check status
      const withForms = await Promise.all(users.map(async (u) => {
        if (!u.associateRecordId) return { user: u, associate: null };
        try {
          const r = await authFetch(`/api/associates/${u.associateRecordId}`);
          const d = await r.json();
          return { user: u, associate: d.success ? d.data : null };
        } catch { return { user: u, associate: null }; }
      }));

      // Only show those whose form is pending
      setItems(withForms.filter(x => !x.associate || x.associate.status === 'pending'));
    } catch { toast.error('Failed to load pending approvals'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async ({ user, associate }) => {
    try {
      // Approve the associate form (generates candidate ref no)
      if (associate) {
        const r = await authFetch(`/api/associates/${associate.associateId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message);
      }
      toast.success(`${user.profile?.fullName} approved!`);
      setItems(prev => prev.filter(x => x.user._id !== user._id));
    } catch (err) { toast.error(err.message); }
  };

  const handleReject = async ({ user, associate }) => {
    if (!confirm(`Reject ${user.profile?.fullName}? They can re-submit their form.`)) return;
    try {
      if (associate) {
        await authFetch(`/api/associates/${associate.associateId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' }),
        });
      }
      toast.success(`${user.profile?.fullName}'s application rejected`);
      setItems(prev => prev.filter(x => x.user._id !== user._id));
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Pending Approvals</h1>
          <p className="text-xs text-gray-400 mt-0.5">{items.length} application{items.length !== 1 ? 's' : ''} awaiting review</p>
        </div>
        <button onClick={load} className="btn-ghost border border-gray-200 p-2 rounded-lg">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle size={32} className="mx-auto text-green-400 mb-3" />
          <p className="text-gray-400 text-sm">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ user: u, associate: a }) => {
            const initials = u.profile?.fullName?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
            return (
              <div key={u._id} className="card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{u.profile?.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      <Clock size={10} /> Pending Review
                    </span>
                    {a && <span className="text-xs text-gray-400">Form ID: {a.associateId}</span>}
                    {a?.referral?.circle && <span className="text-xs text-gray-400">Circle: {a.referral.circle}</span>}
                  </div>
                  {a && (
                    <p className="text-xs text-gray-300 mt-0.5">
                      Submitted: {new Date(a.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove({ user: u, associate: a })}
                    disabled={!a}
                    title={!a ? 'Form not submitted yet' : 'Approve application'}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject({ user: u, associate: a })}
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
