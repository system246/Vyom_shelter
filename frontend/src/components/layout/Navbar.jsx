import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Menu, X, Users, LayoutDashboard, LogOut, LogIn, UserPlus, User, UserCheck,
  Building2, Key, MessageSquare, ConciergeBell, LayoutGrid, ChevronDown, Activity,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import Dropdown from '../ui/Dropdown';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

const publicLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/properties?listingType=sale', label: 'Buy', icon: Building2 },
  { to: '/sell', label: 'Sell', icon: Home },
  { to: '/properties?listingType=rent', label: 'Rent', icon: Key },
  { to: '/services', label: 'Our Services', icon: ConciergeBell },
];

export default function Navbar() {
  const [open, setOpen]   = useState(false);
  const { pathname }      = useLocation();
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  // Primary links always stay visible on the topbar. Everything else groups
  // into the "Manage" dropdown so the bar never overflows, regardless of role.
  const primaryLinks = useMemo(() => {
    if (!user) return [];
    return [
      { to: '/', label: 'View Site', icon: Home },
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];
  }, [user?.role]);

  const manageLinks = useMemo(() => {
    if (!user) return [];
    const arr = [
      { to: '/admin/properties', label: 'Properties', icon: Building2 },
      { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
      { to: user.role === 'head_admin' ? '/admin/services' : '/services', label: 'Services', icon: ConciergeBell },
    ];
    if (user.role !== 'associate') {
      arr.push({ to: '/admin/associates', label: 'Associates', icon: Users });
      arr.push({ to: '/admin/users', label: user.role === 'head_admin' ? 'Users' : 'My Team', icon: UserPlus });
    }
    arr.push({ to: '/register', label: 'Register Associate', icon: UserPlus });
    if (user.role === 'head_admin') {
      arr.push({ to: '/admin/pending', label: 'Approvals', icon: UserCheck });
      arr.push({ to: '/admin/activity', label: 'Activity Log', icon: Activity });
    }
    return arr;
  }, [user?.role]);

  const active = (to) => {
    const [path, query] = to.split('?');
    if (pathname !== path && !pathname.startsWith(path + '/')) return false;
    if (!query) return true;
    return new URLSearchParams(window.location.search).toString() === new URLSearchParams(query).toString();
  };

  const linkClass = (to) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      active(to)
        ? 'bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-sm'
        : 'text-blue-100 hover:bg-white/10 hover:text-white'
    }`;

  const dropdownItemClass = (to) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
      active(to) ? 'bg-[#e8f0fb] text-[#1a3a5c]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a3a5c]'
    }`;

  return (
    <nav className="glass-nav text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ffb648]/40 to-[#2563a8]/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0
                              bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]
                              ring-1 ring-white/10 p-1.5 transition-all duration-300 group-hover:bg-white/15 group-hover:scale-105">
                <img src={logo} alt="Vyom Shelter" className="w-full h-full object-cover object-center" style={{ objectPosition: "center 35%" }} />
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-white leading-tight text-sm">Vyom Shelter</p>
              <p className="text-[10px] text-blue-200 leading-tight capitalize">
                {user ? user.role.replace('_', ' ') : 'Verified Property Broker'}
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {!user && publicLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={linkClass(to)}>
                <Icon size={15} /> {label}
              </Link>
            ))}

            {user && primaryLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={linkClass(to)}>
                <Icon size={15} /> {label}
              </Link>
            ))}

            {user && manageLinks.length > 0 && (
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all">
                    <LayoutGrid size={15} /> Manage <ChevronDown size={13} />
                  </button>
                }
              >
                {manageLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={dropdownItemClass(to)}>
                    <Icon size={15} /> {label}
                  </Link>
                ))}
              </Dropdown>
            )}

            {user && <NotificationBell />}

            {user ? (
              <Dropdown
                align="right"
                trigger={
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all ml-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffb648] to-[#e85d26] flex items-center justify-center text-white text-xs font-bold">
                      {user.profile?.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown size={13} />
                  </button>
                }
              >
                <Link to="/my-profile" className={dropdownItemClass('/my-profile')}>
                  <User size={15} /> My Profile
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={15} /> Logout
                </button>
              </Dropdown>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all ml-2">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[#e85d26] to-[#f3792e] hover:from-[#d54e1a] hover:to-[#e86820] text-white transition-all shadow-[0_4px_14px_-2px_rgba(232,93,38,0.45)]">
                  <UserPlus size={15} /> Become an Associate
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white p-2 rounded-lg hover:bg-white/10" onClick={() => setOpen(o => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          {(!user ? publicLinks : [...primaryLinks, ...manageLinks, { to: '/my-profile', label: 'My Profile', icon: User }]).map(({ to, label, icon: Icon }) => (
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
            <>
              <Link to="/login" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10">
                <LogIn size={16} /> Login
              </Link>
              <Link to="/login" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#e85d26] text-white">
                <UserPlus size={16} /> Become an Associate
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
