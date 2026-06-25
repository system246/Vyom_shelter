import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Menu, X, Users, LayoutDashboard, LogOut, UserPlus, User, UserCheck, Bell, Building2, Key, MessageSquare, ConciergeBell } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const [open, setOpen]   = useState(false);
  const { pathname }      = useLocation();
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  // Public property links — always visible, no login required
  const publicLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/properties?listingType=sale', label: 'Buy', icon: Building2 },
    { to: '/sell', label: 'Sell', icon: Home },
    { to: '/properties?listingType=rent', label: 'Rent', icon: Key },
    { to: '/services', label: 'Our Services', icon: ConciergeBell },
  ];

  const links = [];
  if (!user) {
    links.push(...publicLinks);
  } else {
    links.push({ to: '/', label: 'View Site', icon: Home });
    links.push({ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    links.push({ to: '/admin/properties', label: 'Properties', icon: Building2 });
    links.push({ to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare });
    links.push({
      to: user.role === 'head_admin' ? '/admin/services' : '/services',
      label: 'Services',
      icon: ConciergeBell,
    });
    if (user.role !== 'associate') {
      links.push({ to: '/admin/associates', label: 'Associates', icon: Users });
      links.push({ to: '/admin/users', label: user.role === 'head_admin' ? 'Users' : 'My Team', icon: UserPlus });
    }
    // Everyone gets the Register link — associates fill their own form here;
    // admin/head_admin use it to register a walk-in associate on someone's behalf.
    links.push({ to: '/register', label: 'Register', icon: UserPlus });
    if (user.role === 'head_admin') links.push({ to: '/admin/pending', label: 'Approvals', icon: UserCheck });
    links.push({ to: '/my-profile', label: 'Profile', icon: User });
  }

  const active = (to) => {
    const [path, query] = to.split('?');
    if (pathname !== path && !pathname.startsWith(path + '/')) return false;
    if (!query) return true;
    return new URLSearchParams(window.location.search).toString() === new URLSearchParams(query).toString();
  };

  return (
    <nav className="glass-nav text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* soft glow halo behind the glass chip */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ffb648]/40 to-[#2563a8]/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0
                              bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]
                              ring-1 ring-white/10 p-1.5 transition-all duration-300 group-hover:bg-white/15 group-hover:scale-105">
                <img
                  src={logo}
                  alt="Vyom Shelter"
                  className="w-full h-full object-cover object-center"
                  style={{ objectPosition: "center 35%" }}
                />
              </div>
            </div>
            <div>
              <p className="font-semibold text-white leading-tight text-sm">Vyom Shelter</p>
              <p className="text-[10px] text-blue-200 leading-tight capitalize">
                {user ? user.role.replace('_', ' ') : 'Verified Property Broker'}
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active(to) ? 'bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'
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
                <UserPlus size={15} /> Become an Associate
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
              <UserPlus size={16} /> Become an Associate
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}