import { useEffect, useState, useCallback } from 'react';
import BackButton from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, RefreshCw, Home, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAdminProperties, updatePropertyStatus } from '../../services/propertyApi';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '../../utils/constants';

const TABS = ['pending', 'approved', 'rejected', 'sold', 'rented'];

export default function PropertiesAdmin() {
  const { authFetch, user } = useAuth();
  const canModify = user?.role === 'head_admin' || user?.role === 'admin';
  const [tab, setTab] = useState('pending');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminProperties(authFetch, { status: tab });
      setProperties(res.data || []);
    } catch { toast.error('Failed to load properties'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const act = async (propertyId, status) => {
    try {
      await updatePropertyStatus(authFetch, propertyId, { status });
      toast.success(`Property ${status}`);
      setProperties((p) => p.filter((x) => x.propertyId !== propertyId));
    } catch (err) { toast.error(err.message); }
  };

  const toggleFeatured = async (propertyId, featured) => {
    try {
      await updatePropertyStatus(authFetch, propertyId, { featured: !featured });
      toast.success(!featured ? 'Marked as featured' : 'Removed from featured');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackButton />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Property Verification</h1>
          <p className="text-xs text-gray-400 mt-0.5">{properties.length} properties in "{PROPERTY_STATUS_LABELS[tab]}"</p>
        </div>
        <button onClick={load} className="btn-ghost border border-gray-200"><RefreshCw size={14} /></button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${tab === t ? 'bg-[#1a3a5c] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {PROPERTY_STATUS_LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : properties.length === 0 ? (
        <div className="card p-12 text-center">
          <Home size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No properties here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p._id} className="card p-4 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {p.media?.images?.[0] ? (
                  <img src={`/uploads/${p.media.images[0]}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Home size={24} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800 text-sm">{p.title}</p>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase font-medium">{p.listingType}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{PROPERTY_TYPE_LABELS[p.propertyType]}</span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {p.location?.locality}, {p.location?.city}
                </p>
                <p className="text-sm font-bold text-[#1a3a5c] mt-1">₹{p.price?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400 mt-1">Seller: {p.seller?.name} · {p.seller?.mobile}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{p.propertyId}</p>
              </div>
              {canModify && (
                <div className="flex sm:flex-col gap-2 flex-shrink-0 justify-end">
                  {tab === 'pending' && (
                    <>
                      <button onClick={() => act(p.propertyId, 'approved')} className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => act(p.propertyId, 'rejected')} className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                  {tab === 'approved' && (
                    <button onClick={() => toggleFeatured(p.propertyId, p.featured)} className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${p.featured ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                      <Star size={13} /> {p.featured ? 'Featured' : 'Make Featured'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
