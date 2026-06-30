import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, X, Upload, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight,
  HardHat, Wrench, ShoppingBasket, Briefcase, MoreHorizontal, Layers, Image,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BackButton from '../../components/ui/BackButton';
import { resolveFileUrl } from '../../utils/resolveFileUrl';
import PageHeader from '../../components/ui/PageHeader';
import { fetchAllServicesAdmin, addServiceApi, updateServiceApi, deleteServiceApi } from '../../services/serviceApi';
import logo from '../../assets/logo.png';

const CATEGORIES = ['Labour', 'Home Repair', 'Daily Essentials', 'Professional', 'Other'];

const CATEGORY_COLORS = {
  'Labour':           'bg-orange-50 text-orange-700 border-orange-200',
  'Home Repair':      'bg-blue-50 text-blue-700 border-blue-200',
  'Daily Essentials': 'bg-green-50 text-green-700 border-green-200',
  'Professional':     'bg-purple-50 text-purple-700 border-purple-200',
  'Other':            'bg-gray-50 text-gray-600 border-gray-200',
};

const CATEGORY_ICONS = {
  'Labour':           HardHat,
  'Home Repair':      Wrench,
  'Daily Essentials': ShoppingBasket,
  'Professional':     Briefcase,
  'Other':            MoreHorizontal,
};

const EMPTY_FORM = {
  title: '', category: 'Labour', description: '',
  tags: '', providerName: '', providerPhone: '', providerDetails: '',
};

function LogoPicker({ file, preview, onChange }) {
  const inputRef = useRef();
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        Service Logo / Image
      </label>
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 flex-shrink-0">
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <Image size={24} className="text-gray-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a3a5c]/30 text-[#1a3a5c] text-xs font-medium hover:bg-[#1a3a5c]/5 transition-colors"
          >
            <Upload size={14} /> {file ? 'Change Logo' : 'Upload Logo'}
          </button>
          {file && (
            <button type="button" onClick={() => onChange(null)} className="text-xs text-red-400 hover:text-red-600 text-left">
              Remove
            </button>
          )}
          <p className="text-[10px] text-gray-400">JPG, PNG, WEBP · max 5 MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files[0] || null)}
      />
    </div>
  );
}

function ServiceForm({ initial, editing, onSave, onClose, submitting }) {
  const [form, setForm]       = useState(initial || EMPTY_FORM);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPrev] = useState(
    editing?.image ? resolveFileUrl(editing.image) : null
  );

  const handleImgChange = (file) => {
    setImgFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImgPrev(url);
    } else {
      setImgPrev(editing?.image ? resolveFileUrl(editing.image) : null);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'tags') {
        const arr = v.split(',').map((t) => t.trim()).filter(Boolean);
        fd.append('tags', JSON.stringify(arr));
      } else {
        fd.append(k, v);
      }
    });
    if (imgFile) fd.append('serviceImage', imgFile);
    onSave(fd, editing?.serviceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg h-full max-h-[calc(100vh-2rem)] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#1a3a5c]/10 flex items-center justify-center">
              <img src={logo} alt="Vyom Shelter" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1a3a5c]">{editing ? 'Edit Service' : 'Add New Service'}</h2>
              <p className="text-[10px] text-gray-400">Vyom Shelter — Service Management</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Logo picker */}
          <LogoPicker file={imgFile} preview={imgPreview} onChange={handleImgChange} />

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Service Title <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. House Painting, Plumbing Repair"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a5c] transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat] || MoreHorizontal;
                return (
                  <button
                    key={cat} type="button"
                    onClick={() => set('category', cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.category === cat ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a3a5c]/40'
                    }`}
                  >
                    <Icon size={12} /> {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe what this service covers — type of work, typical tasks, expertise..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a5c] transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tags <span className="text-gray-400">(comma-separated)</span></label>
            <input
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="e.g. painting, wall, interior, exterior"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a5c] transition-colors"
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[11px] text-gray-400 mb-3 font-medium uppercase tracking-wider">Provider Details (Internal — not shown publicly)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Provider / Worker Name</label>
                <input
                  value={form.providerName}
                  onChange={(e) => set('providerName', e.target.value)}
                  placeholder="Name of the service provider"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a5c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Provider Phone</label>
                <input
                  value={form.providerPhone}
                  onChange={(e) => set('providerPhone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a5c] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={form.providerDetails}
                  onChange={(e) => set('providerDetails', e.target.value)}
                  placeholder="Any notes about this provider — experience, area of work, availability..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3a5c] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-gray-100">
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2.5 text-sm justify-center">
                {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServicesAdmin() {
  const { authFetch, user } = useAuth();
  const isHeadAdmin = user?.role === 'head_admin';

  const [tab, setTab]           = useState('active');
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [submitting, setSub]    = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllServicesAdmin(authFetch, { status: tab });
      setServices(res.data || []);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  }, [tab, authFetch]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData, serviceId) => {
    setSub(true);
    try {
      if (serviceId) {
        await updateServiceApi(authFetch, serviceId, formData);
        toast.success('Service updated');
      } else {
        await addServiceApi(authFetch, formData);
        toast.success('Service added');
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSub(false); }
  };

  const handleToggle = async (service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      await updateServiceApi(authFetch, service.serviceId, fd);
      toast.success(`Service ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (serviceId) => {
    setDeleting(serviceId);
    try {
      await deleteServiceApi(authFetch, serviceId);
      toast.success('Service deleted');
      setServices((s) => s.filter((x) => x.serviceId !== serviceId));
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  const openAdd   = () => { setEditing(null); setShowForm(true); };
  const openEdit  = (s)  => {
    setEditing(s);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BackButton />

      <PageHeader
        icon={Layers}
        title="Our Services"
        subtitle={`${services.length} service${services.length !== 1 ? 's' : ''} · ${tab}`}
        gradient="from-violet-600 via-purple-600 to-purple-500"
        action={
          <div className="flex items-center gap-2">
            <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white transition-colors"><RefreshCw size={14} /></button>
            {isHeadAdmin && (
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white text-[#1a3a5c] hover:bg-purple-50 transition-colors">
                <Plus size={14} /> Add Service
              </button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['active', 'inactive'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize ${tab === t ? 'bg-[#1a3a5c] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : services.length === 0 ? (
        <div className="card p-16 text-center">
          <Layers size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No {tab} services yet.</p>
          {isHeadAdmin && tab === 'active' && (
            <button onClick={openAdd} className="btn-primary mt-4 mx-auto text-xs">
              <Plus size={13} /> Add First Service
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => {
            const CatColor = CATEGORY_COLORS[s.category] || 'bg-gray-50 text-gray-600 border-gray-200';
            const CatIcon  = CATEGORY_ICONS[s.category]  || MoreHorizontal;
            return (
              <div key={s._id} className="card p-4 flex flex-col sm:flex-row gap-4">
                {/* Logo */}
                <div className="w-full sm:w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {s.image ? (
                    <img src={resolveFileUrl(s.image)} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1a3a5c]/10">
                      <CatIcon size={28} className="text-[#1a3a5c]/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CatColor}`}>{s.category}</span>
                    {s.status === 'inactive' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{s.description}</p>
                  {s.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  {s.providerName && (
                    <p className="text-[10px] text-gray-400 mt-1.5">Provider: <span className="font-medium text-gray-600">{s.providerName}</span></p>
                  )}
                  {s.providerPhone && (
                    <p className="text-[10px] text-gray-400">Phone: {s.providerPhone}</p>
                  )}
                  <p className="text-[10px] font-mono text-gray-300 mt-1">{s.serviceId}</p>
                </div>

                {/* Actions — head_admin only */}
                {isHeadAdmin && (
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 justify-end">
                    <button
                      onClick={() => handleToggle(s)}
                      className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        s.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {s.status === 'active' ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {s.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => openEdit(s)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.serviceId)}
                      disabled={deleting === s.serviceId}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={13} /> {deleting === s.serviceId ? '...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ServiceForm
          editing={editing}
          initial={editing ? {
            title:           editing.title,
            category:        editing.category,
            description:     editing.description,
            tags:            (editing.tags || []).join(', '),
            providerName:    editing.providerName    || '',
            providerPhone:   editing.providerPhone   || '',
            providerDetails: editing.providerDetails || '',
          } : undefined}
          onSave={handleSave}
          onClose={closeForm}
          submitting={submitting}
        />
      )}
    </div>
  );
}
