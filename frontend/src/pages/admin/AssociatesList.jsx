import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Eye, Trash2, RefreshCw, CheckCircle, XCircle, Clock, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS = {
  pending:  { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  approved: { cls: 'bg-green-50 text-green-700 border-green-200',  icon: CheckCircle },
  rejected: { cls: 'bg-red-50   text-red-700   border-red-200',    icon: XCircle },
};

const Badge = ({ s }) => {
  const cfg = STATUS[s] || STATUS.pending;
  const Icon = cfg.icon;
  const exportCSV = () => {
    const headers = ['ID','Name','Mobile','Email','Circle','Status','Submitted'];
    const rows = list.map(a => [
      a.associateId, a.personal?.fullName, a.personal?.mobile,
      a.personal?.email, a.referral?.circle, a.status,
      new Date(a.createdAt).toLocaleDateString('en-IN')
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'associates.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon size={10} /> {s}
    </span>
  );
};

const Row = ({ label, value }) => (
  <div className="flex py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-400 uppercase tracking-wide w-36 flex-shrink-0 pt-0.5">{label}</span>
    <span className="text-sm text-gray-800 font-medium flex-1">{value || '—'}</span>
  </div>
);

export default function AssociatesList() {
  const { authFetch, user } = useAuth();
  const isHead = user?.role === 'head_admin';

  const [list, setList]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]   = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (status) params.set('status', status);
      const res  = await authFetch(`/api/associates?${params}`);
      const data = await res.json();
      setList(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { toast.error('Failed to load associates'); }
    finally  { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (associateId) => {
    setSelected(associateId);
    setLoadingDetail(true);
    try {
      const res  = await authFetch(`/api/associates/${associateId}`);
      const data = await res.json();
      setDetail(data.data);
    } catch { toast.error('Failed to load details'); }
    finally  { setLoadingDetail(false); }
  };

  const handleStatus = async (associateId, newStatus) => {
    setUpdating(true);
    try {
      const res  = await authFetch(`/api/associates/${associateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Status updated to ${newStatus}`);
      setDetail(d => d ? { ...d, status: newStatus } : d);
      setList(l => l.map(a => a.associateId === associateId ? { ...a, status: newStatus } : a));
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(false); }
  };

  const handleDelete = async (associateId) => {
    if (!confirm(`Delete associate ${associateId}? This cannot be undone.`)) return;
    try {
      const res  = await authFetch(`/api/associates/${associateId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Deleted');
      setSelected(null); setDetail(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  // Local search filter
  const filtered = list.filter(a =>
    !search ||
    a.personal?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    a.associateId?.toLowerCase().includes(search.toLowerCase()) ||
    a.personal?.mobile?.includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Associates</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} total records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost border border-gray-200"><Download size={14}/> Export CSV</button>
          <button onClick={load} className="btn-ghost border border-gray-200"><RefreshCw size={14}/> Refresh</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-base pl-9"
            placeholder="Search name, ID, mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-base w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No associates found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['ID', 'Name', 'Mobile', 'Email', 'Circle', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.associateId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.associateId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.personal?.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.personal?.mobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">{a.personal?.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.referral?.circle}</td>
                    <td className="px-4 py-3"><Badge s={a.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openDetail(a.associateId)} className="btn-ghost px-2 py-1 text-xs">
                          <Eye size={13} /> View
                        </button>
                        {isHead && (
                          <button onClick={() => handleDelete(a.associateId)} className="btn-ghost px-2 py-1 text-xs text-red-500 hover:text-red-700">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1}     onClick={() => setPage(p => p-1)} className="btn-ghost px-2 py-1"><ChevronLeft size={14} /></button>
              <button disabled={page === pages} onClick={() => setPage(p => p+1)} className="btn-ghost px-2 py-1"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setSelected(null); setDetail(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <p className="font-semibold text-[#1a3a5c]">{detail?.personal?.fullName || '...'}</p>
                <p className="text-xs text-gray-400 font-mono">{selected}</p>
              </div>
              <div className="flex items-center gap-3">
                {detail && <Badge s={detail.status} />}
                <button onClick={() => { setSelected(null); setDetail(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center text-gray-400">Loading...</div>
            ) : detail ? (
              <div className="p-6 space-y-5">
                {/* Status actions - head admin only */}
                {isHead && (
                  <div className="flex gap-2 flex-wrap">
                    {['pending', 'approved', 'rejected'].map(s => (
                      <button
                        key={s}
                        disabled={detail.status === s || updating}
                        onClick={() => handleStatus(detail.associateId, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize
                          ${detail.status === s
                            ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                    <button onClick={() => handleDelete(detail.associateId)} disabled={updating}
                      className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-1">
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                )}

                <div>
                  <p className="section-title">Personal Details</p>
                  <Row label="Full Name"    value={detail.personal?.fullName} />
                  <Row label="S/D/W/O"     value={detail.personal?.sdwo} />
                  <Row label="Date of Birth" value={detail.personal?.dob} />
                  <Row label="Gender"       value={detail.personal?.gender} />
                  <Row label="Mobile"       value={detail.personal?.mobile} />
                  <Row label="WhatsApp"     value={detail.personal?.whatsapp} />
                  <Row label="Email"        value={detail.personal?.email} />
                  <Row label="Address"      value={detail.personal?.address} />
                  <Row label="Pincode"      value={detail.personal?.pincode} />
                </div>
                <div>
                  <p className="section-title">Professional</p>
                  <Row label="Profession"   value={detail.professional?.profession} />
                  <Row label="Education"    value={detail.professional?.education} />
                  <Row label="Nominee"      value={detail.professional?.nomineeName} />
                  <Row label="Relation"     value={detail.professional?.nomineeRelation} />
                </div>
                <div>
                  <p className="section-title">Documents</p>
                  <Row label="Aadhaar No"   value={detail.documents?.aadhaarNumber} />
                  <Row label="PAN No"       value={detail.documents?.panNumber} />
                  <div className="flex gap-3 mt-2">
                    {detail.documents?.aadhaarFile ? (
                      <a href={`${import.meta.env.VITE_API_URL?.replace('/api','') || ''}/uploads/${detail.documents.aadhaarFile}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-ghost border border-gray-200 px-3 py-1.5 text-xs flex items-center gap-1">
                        <Eye size={13} /> View Aadhaar
                      </a>
                    ) : <span className="text-xs text-gray-400">Aadhaar not uploaded</span>}
                    {detail.documents?.panFile ? (
                      <a href={`${import.meta.env.VITE_API_URL?.replace('/api','') || ''}/uploads/${detail.documents.panFile}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-ghost border border-gray-200 px-3 py-1.5 text-xs flex items-center gap-1">
                        <Eye size={13} /> View PAN
                      </a>
                    ) : <span className="text-xs text-gray-400">PAN not uploaded</span>}
                  </div>
                </div>
                <div>
                  <p className="section-title">Bank Details</p>
                  <Row label="Bank"         value={detail.bank?.bankName} />
                  <Row label="Branch"       value={detail.bank?.branch} />
                  <Row label="IFSC"         value={detail.bank?.ifscCode} />
                  <Row label="Account No"   value={detail.bank ? '••••' + detail.bank.accountNumber?.slice(-4) : ''} />
                </div>
                <div>
                  <p className="section-title">Referral</p>
                  <Row label="Ref No"       value={detail.referral?.associateRefNo} />
                  <Row label="Associate"    value={detail.referral?.associateName} />
                  <Row label="Circle"       value={detail.referral?.circle} />
                  <Row label="Candidate Ref" value={detail.referral?.newCandidateRefNo} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted: {new Date(detail.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
