import { useEffect, useState } from 'react';
import BackButton from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
import { Activity, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_STYLE = {
  APPROVE_USER:      'bg-green-100 text-green-700',
  REJECT_ASSOCIATE:  'bg-red-100   text-red-700',
  DELETE_USER:       'bg-red-100   text-red-700',
  UPDATE_STATUS:     'bg-blue-100  text-blue-700',
};

export default function ActivityLog() {
  const { authFetch } = useAuth();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await authFetch('/api/activity-log');
      const data = await res.json();
      setLogs(data.data || []);
    } catch { toast.error('Failed to load activity log'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Activity Log</h1>
          <p className="text-xs text-gray-400 mt-0.5">All admin actions</p>
        </div>
        <button onClick={load} className="btn-ghost border border-gray-200"><RefreshCw size={14}/></button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <Activity size={32} className="mx-auto text-gray-300 mb-3"/>
          <p className="text-gray-400 text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Action', 'Performed By', 'Target', 'Details', 'Time'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_STYLE[l.action] || 'bg-gray-100 text-gray-600'}`}>
                      {l.action.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{l.performedBy?.profile?.fullName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.targetName || l.targetId}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{l.details || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
