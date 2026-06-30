import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, HardHat, Wrench, ShoppingBasket, Briefcase, MoreHorizontal,
  Phone, MessageCircle, Mail, X, Loader2, Layers, CheckCircle2,
} from 'lucide-react';
import { fetchServices } from '../../services/serviceApi';
import { resolveFileUrl } from '../../utils/resolveFileUrl';
import logo from '../../assets/logo.png';
import Seo from '../../components/seo/Seo';

const CATEGORIES = [
  { label: 'All',              icon: Layers        },
  { label: 'Labour',           icon: HardHat       },
  { label: 'Home Repair',      icon: Wrench        },
  { label: 'Daily Essentials', icon: ShoppingBasket },
  { label: 'Professional',     icon: Briefcase     },
  { label: 'Other',            icon: MoreHorizontal },
];

const CATEGORY_COLORS = {
  'Labour':           'bg-orange-50 text-orange-700 border-orange-200',
  'Home Repair':      'bg-blue-50 text-blue-700 border-blue-200',
  'Daily Essentials': 'bg-green-50 text-green-700 border-green-200',
  'Professional':     'bg-purple-50 text-purple-700 border-purple-200',
  'Other':            'bg-gray-50 text-gray-600 border-gray-200',
};

const CATEGORY_BG = {
  'Labour':           'from-orange-400 to-orange-600',
  'Home Repair':      'from-blue-400 to-blue-600',
  'Daily Essentials': 'from-green-400 to-green-600',
  'Professional':     'from-purple-400 to-purple-600',
  'Other':            'from-gray-400 to-gray-600',
};

// Update with Vyom Shelter's actual contact details
const CONTACT = {
  phone:   '+91 98765 43210',
  whatsapp: '919876543210',
  email:   'services@vyomshelter.com',
};

function ContactModal({ service, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1a3a5c]/10 flex items-center justify-center flex-shrink-0">
            {service.image ? (
              <img src={resolveFileUrl(service.image)} alt={service.title} className="w-full h-full object-cover" />
            ) : (
              <img src={logo} alt="Vyom Shelter" className="w-8 h-8 object-contain" />
            )}
          </div>
          <div>
            <p className="font-bold text-[#1a3a5c] text-sm">{service.title}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[service.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {service.category}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#e8f0fb] rounded-xl p-4 mb-5">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#1a3a5c] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#1a3a5c]">
              Contact <strong>Vyom Shelter</strong> through any channel below. We'll connect you with the right service provider — verified and trusted.
            </p>
          </div>
        </div>

        {/* Contact options */}
        <div className="space-y-3">
          <a
            href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
            className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 hover:border-[#1a3a5c] hover:bg-[#1a3a5c]/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#1a3a5c] flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Call Us</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1a3a5c]">{CONTACT.phone}</p>
            </div>
          </a>

          <a
            href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hi, I'm looking for "${service.title}" service.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">WhatsApp</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">{CONTACT.phone}</p>
            </div>
          </a>

          <a
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Service Enquiry: ${service.title}`)}`}
            className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#e85d26] flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Email Us</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#e85d26]">{CONTACT.email}</p>
            </div>
          </a>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-5">
          Vyom Shelter connects you with verified local service providers.
        </p>
      </div>
    </div>
  );
}

function ServiceCard({ service, onConnect }) {
  const catColor = CATEGORY_COLORS[service.category] || 'bg-gray-50 text-gray-600 border-gray-200';
  const catGrad  = CATEGORY_BG[service.category]     || 'from-gray-400 to-gray-600';
  const CatIcon  = CATEGORIES.find((c) => c.label === service.category)?.icon || MoreHorizontal;

  return (
    <div className="card overflow-hidden group hover:shadow-lg transition-shadow duration-200">
      {/* Image / placeholder */}
      <div className="h-40 relative overflow-hidden bg-gray-100">
        {service.image ? (
          <img
            src={resolveFileUrl(service.image)}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${catGrad}`}>
            <CatIcon size={48} className="text-white/80" />
          </div>
        )}
        <span className={`absolute top-2 left-2 text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${catColor}`}>
          {service.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-1 leading-snug">{service.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{service.description}</p>

        {service.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {service.providerName && (
          <p className="text-[11px] text-gray-400 mb-3 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-green-500" /> {service.providerName}
          </p>
        )}

        <button
          onClick={() => onConnect(service)}
          className="w-full btn-primary justify-center py-2 text-xs"
        >
          <Phone size={12} /> Get Connected
        </button>
      </div>
    </div>
  );
}

export default function Services() {
  const [params, setParams]     = useSearchParams();
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [q, setQ]               = useState('');
  const [data, setData]         = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchServices({ category: category === 'All' ? '' : category, q, page });
      setData(res);
    } catch { /* show empty state */ }
    finally { setLoading(false); }
  }, [category, q, page]);

  useEffect(() => { load(); }, [load]);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
    setParams(cat === 'All' ? {} : { category: cat });
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Seo
        title="Our Services"
        description="Find trusted local professionals — labour, home repair, daily essentials and more — verified and connected through Vyom Shelter."
        path="/services"
      />

      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fb] text-[#1a3a5c] text-xs font-semibold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
          <Layers size={13} /> Verified Local Services
        </div>
        <h1 className="text-3xl font-bold text-[#1a3a5c]">Our Services</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
          Find trusted local professionals for all your daily needs. Click <strong>Get Connected</strong> — Vyom Shelter bridges you with the right person.
        </p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => handleCategoryClick(label)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              category === label
                ? 'bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a3a5c]/40 hover:text-[#1a3a5c]'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="card p-3 mb-8 flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 border border-gray-200">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            placeholder="Search services, e.g. plumber, painter, cleaning..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <button type="submit" className="btn-primary px-5 text-sm">Search</button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading services...
        </div>
      ) : data.data.length === 0 ? (
        <div className="card p-16 text-center">
          <Layers size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">No services found in this category yet.</p>
          <p className="text-xs text-gray-300 mt-1">Check back soon — we're adding more every day.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">{data.total} service{data.total !== 1 ? 's' : ''} available</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.data.map((s) => (
              <ServiceCard key={s.serviceId} service={s} onConnect={setModal} />
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${page === p ? 'bg-[#1a3a5c] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* How it works — info strip */}
      <div className="mt-12 card p-6 bg-gradient-to-r from-[#1a3a5c]/5 to-[#1a3a5c]/10 border-[#1a3a5c]/20">
        <h2 className="text-sm font-bold text-[#1a3a5c] mb-4 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Browse Services', desc: 'Find the service you need from our verified catalogue.' },
            { step: '2', title: 'Contact Vyom Shelter', desc: 'Hit "Get Connected" and reach us via call, WhatsApp, or email.' },
            { step: '3', title: 'We Connect You', desc: 'We match you with the right local professional — verified & trusted.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-8 h-8 rounded-full bg-[#1a3a5c] text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {step}
              </div>
              <p className="text-sm font-semibold text-[#1a3a5c]">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {modal && <ContactModal service={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
