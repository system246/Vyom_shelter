import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, UserCheck, Clock, CheckCircle, XCircle, UserPlus, ArrowRight } from 'lucide-react';

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

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const [stats, setStats]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, uRes] = await Promise.all([
          authFetch('/api/associates'),
          user.role !== 'associate' ? authFetch('/api/users') : Promise.resolve(null),
        ]);
        const aData = await aRes.json();
        const uData = uRes ? await uRes.json() : null;

        const associates = aData.data || [];
        setStats({
          total:     aData.total || 0,
          pending:   associates.filter(a => a.status === 'pending').length,
          approved:  associates.filter(a => a.status === 'approved').length,
          rejected:  associates.filter(a => a.status === 'rejected').length,
          users:     uData?.data?.length || 0,
          admins:    uData?.data?.filter(u => u.role === 'admin').length || 0,
        });
      } catch {}
    };
    load();
  }, []);

  const isHead  = user?.role === 'head_admin';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a3a5c]">
          Welcome, {user?.profile?.fullName} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1 capitalize">
          {user?.role?.replace('_', ' ')} Dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users}     label="Total Associates" value={stats?.total}    color="bg-[#1a3a5c]" />
        <StatCard icon={Clock}     label="Pending"          value={stats?.pending}  color="bg-amber-500" />
        <StatCard icon={CheckCircle} label="Approved"       value={stats?.approved} color="bg-green-500" />
        <StatCard icon={XCircle}   label="Rejected"         value={stats?.rejected} color="bg-red-400" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* View Associates */}
        <Link to="/admin/associates" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 mb-1">Associates</p>
              <p className="text-xs text-gray-400">View & manage registrations</p>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
          </div>
        </Link>

        {/* Register new associate */}
        {(isHead || isAdmin) && (
          <Link to="/register" className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 mb-1">New Registration</p>
                <p className="text-xs text-gray-400">Register an associate</p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
            </div>
          </Link>
        )}

        {/* Manage users — head_admin and admin */}
        {(isHead || isAdmin) && (
          <Link to="/admin/users" className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 mb-1">
                  {isHead ? 'Manage Users' : 'My Team'}
                </p>
                <p className="text-xs text-gray-400">
                  {isHead ? `${stats?.users || 0} users total` : 'View your associates'}
                </p>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
            </div>
          </Link>
        )}

        {/* Create user — head_admin creates admin/associate, admin creates associate */}
        {(isHead || isAdmin) && (
          <Link to="/admin/users/create" className="card p-5 hover:shadow-md transition-shadow group border-dashed border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Create User</p>
                <p className="text-xs text-gray-400">
                  {isHead ? 'Add admin or associate' : 'Add associate'}
                </p>
              </div>
              <UserPlus size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
            </div>
          </Link>
        )}

        {/* My profile */}
        <Link to="/my-profile" className="card p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 mb-1">My Profile</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1a3a5c] transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
