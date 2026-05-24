import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TYPE_STYLE = {
  success: 'bg-green-50 border-green-200 text-green-700',
  info:    'bg-blue-50  border-blue-200  text-blue-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  error:   'bg-red-50   border-red-200   text-red-600',
};

export default function NotificationBell() {
  const { authFetch } = useAuth();
  const [open, setOpen]           = useState(false);
  const [notifications, setNots]  = useState([]);
  const [unread, setUnread]       = useState(0);
  const ref = useRef();

  const load = async () => {
    try {
      const res  = await authFetch('/api/notifications');
      const data = await res.json();
      if (data.success) { setNots(data.data); setUnread(data.unread); }
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    await authFetch('/api/notifications/read-all', { method: 'PATCH' });
    setNots(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const markOne = async (id) => {
    await authFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNots(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-blue-100 hover:bg-white/10 transition-colors">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e85d26] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-[#1a3a5c] text-sm">Notifications</p>
            <div className="flex gap-2">
              {unread > 0 && (
                <button onClick={markAll} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <CheckCheck size={12}/> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={15}/></button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n._id}
                  onClick={() => { if (!n.read) markOne(n._id); }}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
