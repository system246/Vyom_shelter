import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Clock, CheckCircle, XCircle, UserPlus, ArrowRight, Activity,
  Building2, MessageSquare, FileCheck2,
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import QuickActionCard from '../../components/ui/QuickActionCard';
import { DonutChart, StatusBarList } from '../../components/ui/Charts';
import { fetchAdminProperties, fetchAdminEnquiries } from '../../services/propertyApi';

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [stats, setStats]   = useState(null);
  const [pending, setPending] = useState(0);
  const [propStats, setPropStats] = useState(null);
  const [enqTotal, setEnqTotal]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, uRes, pRes] = await Promise.all([
          authFetch('/api/associates'),
          user.role !== 'associate' ? authFetch('/api/users') : Promise.resolve(null),
          user.role === 'head_admin' ? authFetch('/api/users?pending=true') : Promise.resolve(null),
        ]);
        const aData = await aRes.json();
        const uData = uRes ? await uRes.json() : null;
        const pData = pRes ? await pRes.json() : null;

        const associates = aData.data || [];
        const p = associates.filter(a => a.status === 'pending').length;
        const a = associates.filter(a => a.status === 'approved').length;
        const r = associates.filter(a => a.status === 'rejected').length;
        setStats({ total: aData.total || 0, pending: p, approved: a, rejected: r, users: uData?.data?.length || 0 });
        setPending(pData?.data?.length || 0);
      } catch {}

      try {
        const [pendingProp, approvedProp, enquiries] = await Promise.all([
          fetchAdminProperties(authFetch, { status: 'pending', limit: 1 }),
          fetchAdminProperties(authFetch, { status: 'approved', limit: 1 }),
          fetchAdminEnquiries(authFetch, { limit: 1 }),
        ]);
        setPropStats({ pending: pendingProp.total || 0, approved: approvedProp.total || 0 });
        setEnqTotal(enquiries.total || 0);
      } catch {}
    };
    load();
  }, []);

  const isHead  = user?.role === 'head_admin';
  const isAdmin = user?.role === 'admin';

  const associateDonut = stats ? [
    { name: 'Pending',  value: stats.pending,  color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#22c55e' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Welcome, {user?.profile?.fullName} 👋</h1>
        <p className="text-sm text-gray-400 mt-1 capitalize">{user?.role?.replace('_', ' ')} Dashboard</p>
      </div>

      {/* Pending approval alert */}
      {isHead && pending > 0 && (
        <Link to="/admin/pending" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 hover:bg-amber-100 transition-colors">
          <Clock size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">{pending} user{pending > 1 ? 's' : ''} awaiting approval</p>
          <ArrowRight size={14} className="text-amber-500 ml-auto" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}        label="Associates"        value={stats?.total}            gradient="from-[#1a3a5c] to-[#2563a8]" to="/admin/associates" />
        <StatCard icon={Clock}        label="Assoc. Pending"    value={stats?.pending}           gradient="from-amber-500 to-orange-400" to="/admin/associates" />
        <StatCard icon={Building2}    label="Properties Live"   value={propStats?.approved}      gradient="from-emerald-500 to-teal-500" to="/admin/properties" />
        <StatCard icon={MessageSquare}label="Buyer Leads"       value={enqTotal}                 gradient="from-[#e85d26] to-[#f3792e]" to="/admin/enquiries" />
      </div>

      {/* Charts */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-600 mb-4">Associate Status Breakdown</p>
            <DonutChart data={associateDonut} />
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-600 mb-4">Associates Overview</p>
            <StatusBarList data={associateDonut} />
            {propStats && (
              <>
                <div className="h-px bg-gray-100 my-4" />
                <p className="text-sm font-semibold text-gray-600 mb-3">Properties Awaiting Verification</p>
                <StatusBarList data={[
                  { name: 'Pending Verification', value: propStats.pending, color: '#f59e0b' },
                  { name: 'Live / Verified', value: propStats.approved, color: '#22c55e' },
                ]} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard to="/admin/associates" icon={Users} title="Associates"
          subtitle="View & manage registrations" gradient="from-[#1a3a5c] to-[#2563a8]" />

        <QuickActionCard to="/admin/properties" icon={Building2} title="Property Verification"
          subtitle={`${propStats?.pending ?? '—'} awaiting approval`} gradient="from-emerald-500 to-teal-500" />

        <QuickActionCard to="/admin/enquiries" icon={MessageSquare} title="Buyer / Tenant Leads"
          subtitle={`${enqTotal ?? '—'} total enquiries`} gradient="from-[#e85d26] to-[#f3792e]" />

        {(isHead || isAdmin) && (
          <QuickActionCard to="/register" icon={FileCheck2} title="New Registration"
            subtitle="Register an associate" gradient="from-violet-500 to-purple-500" />
        )}

        {(isHead || isAdmin) && (
          <QuickActionCard to="/admin/users" icon={Users} title={isHead ? 'Manage Users' : 'My Team'}
            subtitle={isHead ? `${stats?.users || 0} users total` : 'View your associates'} gradient="from-sky-500 to-blue-500" />
        )}

        {(isHead || isAdmin) && (
          <QuickActionCard to="/admin/users/create" icon={UserPlus} title="Create User"
            subtitle={isHead ? 'Add admin or associate' : 'Add associate'} gradient="from-gray-500 to-gray-600" dashed />
        )}

        {isHead && (
          <QuickActionCard to="/admin/activity" icon={Activity} title="Activity Log"
            subtitle="Audit trail of all actions" gradient="from-rose-500 to-pink-500" />
        )}

        <QuickActionCard to="/my-profile" icon={CheckCircle} title="My Profile"
          subtitle={user?.email} gradient="from-slate-500 to-slate-600" />
      </div>
    </div>
  );
}
