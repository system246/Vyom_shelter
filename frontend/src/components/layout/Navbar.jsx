import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Menu, X, Users, LayoutDashboard, LogOut, UserPlus, User, UserCheck, Bell } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [open, setOpen]   = useState(false);
  const { pathname }      = useLocation();
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const links = [];
  if (!user) {
    links.push({ to: '/', label: 'Home', icon: Home });
  } else {
    links.push({ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    if (user.role !== 'associate') {
      links.push({ to: '/admin/associates', label: 'Associates', icon: Users });
      links.push({ to: '/admin/users', label: user.role === 'head_admin' ? 'Users' : 'My Team', icon: UserPlus });
    } else {
      links.push({ to: '/admin/associates', label: 'My Associates', icon: Users });
    }
    if (user.role !== 'associate') links.push({ to: '/register', label: 'Register', icon: UserPlus });
    if (user.role === 'head_admin') links.push({ to: '/admin/pending', label: 'Approvals', icon: UserCheck });
    links.push({ to: '/my-profile', label: 'Profile', icon: User });
  }

  const active = (to) => pathname === to || pathname.startsWith(to + '/');

  return (
    <nav className="bg-[#1a3a5c] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? '/admin/dashboard' : '/'} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e85d26] rounded-lg flex items-center justify-center font-bold text-white text-lg">A</div>
            <div>
              <p className="font-semibold text-white leading-tight text-sm">Associate Portal</p>
              <p className="text-[10px] text-blue-200 leading-tight capitalize">
                {user ? user.role.replace('_', ' ') : 'Registration System'}
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active(to) ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon size={15} /> {label}
              </Link>
            ))}
            {user && <NotificationBell />}
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all ml-2">
                <LogOut size={15} /> Logout
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#e85d26] hover:bg-orange-500 text-white transition-all ml-2">
                Sign In
              </Link>
            )}
          </div>

          <button className="md:hidden text-white p-2 rounded-lg hover:bg-white/10" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active(to) ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
              }`}>
              <Icon size={16} /> {label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { handleLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#e85d26] text-white">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
