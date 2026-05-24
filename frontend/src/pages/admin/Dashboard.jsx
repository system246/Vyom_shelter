import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Clock, CheckCircle, XCircle, UserPlus, ArrowRight, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

const COLORS = ['#f59e0b', '#22c55e', '#ef4444'];

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [stats, setStats]   = useState(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, uRes, pRes] = await Promise.all([
          authFetch('/api/associates'),
          user.role !== 'associate' ? authFetch('/api/users') : Promise.resolve(null),
          _userRoles.includes('head_admin') ? authFetch('/api/users?pending=true') : Promise.resolve(null),
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
    };
    load();
  }, []);

  const _userRoles = [...new Set([user?.role, ...(user?.roles || [])])];
  const isHead  = _userRoles.includes('head_admin');
  const isAdmin = _userRoles.includes('admin') || isHead;

  const pieData = stats ? [
    { name: 'Pending',  value: stats.pending  },
    { name: 'Approved', value: stats.approved },
    { name: 'Rejected', value: stats.rejected },
  ] : [];

  const barData = stats ? [
    { name: 'Pending',  count: stats.pending  },
    { name: 'Approved', count: stats.approved },
    { name: 'Rejected', count: stats.rejected },
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
        <StatCard icon={Users}       label="Total"    value={stats?.total}    color="bg-[#1a3a5c]" />
        <StatCard icon={Clock}       label="Pending"  value={stats?.pending}  color="bg-amber-500" />
        <StatCard icon={CheckCircle} label="Approved" value={stats?.approved} color="bg-green-500" />
        <StatCard icon={XCircle}     label="Rejected" value={stats?.rejected} color="bg-red-400"   />
      </div>

      {/* Charts */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-600 mb-4">Status Distribution</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-600 mb-4">Associates Overview</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a3a5c" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/associates" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div><p className="font-semibold text-gray-800 mb-1">Associates</p><p className="text-xs text-gray-400">View & manage registrations</p></div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
          </div>
        </Link>

        {(isHead || isAdmin) && (
          <Link to="/register" className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-gray-800 mb-1">New Registration</p><p className="text-xs text-gray-400">Register an associate</p></div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
            </div>
          </Link>
        )}

        {(isHead || isAdmin) && (
          <Link to="/admin/users" className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-gray-800 mb-1">{isHead ? 'Manage Users' : 'My Team'}</p><p className="text-xs text-gray-400">{isHead ? `${stats?.users || 0} users total` : 'View your associates'}</p></div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
            </div>
          </Link>
        )}

        {(isHead || isAdmin) && (
          <Link to="/admin/users/create" className="card p-5 hover:shadow-md transition-shadow group border-dashed border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-gray-800 mb-1">Create User</p><p className="text-xs text-gray-400">{isHead ? 'Add admin or associate' : 'Add associate'}</p></div>
              <UserPlus size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
            </div>
          </Link>
        )}

        {isHead && (
          <Link to="/admin/activity" className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-gray-800 mb-1">Activity Log</p><p className="text-xs text-gray-400">Audit trail of all actions</p></div>
              <Activity size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
            </div>
          </Link>
        )}

        <Link to="/my-profile" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div><p className="font-semibold text-gray-800 mb-1">My Profile</p><p className="text-xs text-gray-400">{user?.email}</p></div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
