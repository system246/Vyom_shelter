import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, UserPlus, ShieldCheck, UserCheck,
  Activity, User, LogOut, Menu, X, IdCard, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false); // mobile drawer

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const userRoles   = user ? [...new Set([user.role, ...(user.roles || [])])] : [];
  const isHead      = userRoles.includes('head_admin');
  const isAdmin     = userRoles.includes('admin') || isHead;
  const isAssociate = user?.role === 'associate';

  const roleLabel = isHead ? 'Head Admin'
    : (userRoles.includes('admin') && isAssociate) ? 'Admin · Associate'
    : userRoles.includes('admin') ? 'Admin'
    : 'Associate';

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/admin/associates', label: 'Associates', icon: Users, show: true },
    { to: '/register', label: 'Register', icon: UserPlus, show: isAdmin && !isHead },
    { to: '/admin/users', label: isHead ? 'Users' : 'My Team', icon: UserPlus, show: isAdmin },
    { to: '/admin/users/create', label: 'Manage Admins', icon: ShieldCheck, show: isHead },
    { to: '/admin/pending', label: 'Approvals', icon: UserCheck, show: isHead },
    { to: '/admin/activity', label: 'Activity Log', icon: Activity, show: isHead },
    { to: '/my-profile', label: 'Profile', icon: User, show: true },
    { to: '/id-card', label: 'ID Card', icon: IdCard, show: true },
  ].filter(l => l.show);

  const active = (to) => pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));

  const NavLinks = ({ onClose }) => (
    <nav className="flex-1 py-4 overflow-y-auto">
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onClose}
          className={`flex items-center gap-3 mx-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-1
            ${active(to)
              ? 'bg-white/20 text-white'
              : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1a3a5c] min-h-screen sticky top-0 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-[#e85d26] rounded-lg flex items-center justify-center font-bold text-white text-lg flex-shrink-0">A</div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight truncate">Associate Portal</p>
            <p className="text-[10px] text-blue-200 leading-tight capitalize truncate">{roleLabel}</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-blue-300 truncate">{user?.profile?.fullName}</p>
          <p className="text-[10px] text-blue-400 truncate">{user?.email}</p>
        </div>

        <NavLinks onClose={() => {}} />

        {/* Bottom actions */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3 flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all flex-1"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden flex items-center justify-between bg-[#1a3a5c] text-white px-4 h-14 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#e85d26] rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
          <p className="font-semibold text-sm">Associate Portal</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setOpen(true)} className="p-2"><Menu size={20} /></button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-[#1a3a5c] flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#e85d26] rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
                <div>
                  <p className="font-semibold text-white text-sm">{user?.profile?.fullName}</p>
                  <p className="text-[10px] text-blue-300 capitalize">{roleLabel}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-blue-200 p-1"><X size={18} /></button>
            </div>

            <NavLinks onClose={() => setOpen(false)} />

            <div className="px-3 pb-6 border-t border-white/10 pt-3">
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 transition-all"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
