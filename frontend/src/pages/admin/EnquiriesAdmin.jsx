import { useEffect, useState, useCallback } from 'react';
import BackButton from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, Phone, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAdminEnquiries, updateEnquiryStatus } from '../../services/propertyApi';

const STATUS_OPTIONS = ['new', 'contacted', 'site_visit_scheduled', 'closed'];

export default function EnquiriesAdmin() {
  const { authFetch } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminEnquiries(authFetch);
      setEnquiries(res.data || []);
    } catch { toast.error('Failed to load enquiries'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    try {
      await updateEnquiryStatus(authFetch, id, status);
      setEnquiries((e) => e.map((x) => (x.enquiryId === id ? { ...x, status } : x)));
      toast.success('Status updated');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackButton />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Buyer / Tenant Enquiries</h1>
          <p className="text-xs text-gray-400 mt-0.5">{enquiries.length} leads</p>
        </div>
        <button onClick={load} className="btn-ghost border border-gray-200"><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : enquiries.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No enquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e._id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{e.name} <span className="text-xs text-gray-400 font-normal">· {e.type.replace('_', ' ')}</span></p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={11} /> {e.mobile} {e.email && `· ${e.email}`}</p>
                {e.property && <p className="text-xs text-gray-400 mt-0.5">Property: {e.property.title} ({e.property.propertyId})</p>}
                {e.message && <p className="text-xs text-gray-400 mt-1">"{e.message}"</p>}
              </div>
              <select value={e.status} onChange={(ev) => changeStatus(e.enquiryId, ev.target.value)} className="input-base !w-auto text-xs">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
