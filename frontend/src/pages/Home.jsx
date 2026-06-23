import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Building2, Key, ShieldCheck, UserPlus, BadgeCheck, Home as HomeIcon, Sparkles } from 'lucide-react';
import { fetchProperties } from '../services/propertyApi';
import PropertyCard from '../components/property/PropertyCard';
import Carousel from '../components/ui/Carousel';

const HERO_SLIDES = [
  { title: 'Find Your Next Home,', highlight: 'Verified & Hassle-Free', sub: 'Buy, Sell or Rent properties with confidence — every listing is personally verified by our team.' },
  { title: 'List Your Property in Minutes,', highlight: 'No Login Needed', sub: 'Sellers and landlords can submit a listing instantly — Vyom Shelter handles verification and buyer outreach.' },
  { title: 'One Platform,', highlight: 'Every Property Need', sub: 'Plots, flats, commercial shops, farm houses — search, compare and connect, all in one place.' },
];

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="card card-hover p-5">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8f0fb] to-[#d5e6fa] flex items-center justify-center mb-3">
      <Icon size={20} className="text-[#1a3a5c]" />
    </div>
    <h3 className="font-semibold text-gray-800 mb-1.5 text-sm">{title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchProperties({ featured: 'true', limit: 8 })
      .then((res) => setFeatured(res.data || []))
      .catch(() => setFeatured([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ listingType });
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    navigate(`/properties?${params}`);
  };

  return (
    <div>
      {/* Hero — banner slider */}
      <div className="relative bg-gradient-to-br from-[#132d49] via-[#1a3a5c] to-[#1f4a73] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #e85d26 0%, transparent 35%), radial-gradient(circle at 80% 70%, #2563a8 0%, transparent 40%)' }} />
        <div className="max-w-5xl mx-auto px-4 py-14 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <Sparkles size={12} /> Vyom Shelter Pvt. Ltd. &middot; Verified Property Broker
          </div>

          <Carousel
            items={HERO_SLIDES}
            mode="single"
            autoPlayMs={4500}
            showControls={false}
            className="mb-8"
            renderItem={(slide) => (
              <div className="px-2 py-2 min-h-[140px] flex flex-col items-center justify-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {slide.title}<br />
                  <span className="text-[#ff8a4c]">{slide.highlight}</span>
                </h1>
                <p className="text-blue-100 text-base max-w-xl mx-auto leading-relaxed">{slide.sub}</p>
              </div>
            )}
          />

          {/* Search */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 max-w-2xl mx-auto shadow-2xl">
            <div className="flex gap-2 mb-3 justify-center">
              {[{ v: 'sale', l: 'Buy' }, { v: 'rent', l: 'Rent' }].map((t) => (
                <button key={t.v} type="button" onClick={() => setListingType(t.v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${listingType === t.v ? 'bg-[#1a3a5c] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {t.l}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (e.g. Lucknow)" className="input-base flex-1" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Locality, project, keyword..." className="input-base flex-1" />
              <button type="submit" className="btn-accent justify-center px-6"><Search size={16} /> Search</button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Buy / Sell / Rent CTAs */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <Link to="/properties?listingType=sale" className="card card-hover p-6 text-center">
            <Building2 size={28} className="mx-auto text-[#1a3a5c] mb-2" />
            <p className="font-semibold text-gray-800">Buy a Property</p>
            <p className="text-xs text-gray-400 mt-1">Browse verified listings — no login required</p>
          </Link>
          <Link to="/sell" className="card card-hover p-6 text-center">
            <HomeIcon size={28} className="mx-auto text-[#1a3a5c] mb-2" />
            <p className="font-semibold text-gray-800">Sell / Rent Out</p>
            <p className="text-xs text-gray-400 mt-1">List your property — no login required</p>
          </Link>
          <Link to="/properties?listingType=rent" className="card card-hover p-6 text-center">
            <Key size={28} className="mx-auto text-[#1a3a5c] mb-2" />
            <p className="font-semibold text-gray-800">Rent a Property</p>
            <p className="text-xs text-gray-400 mt-1">Find a place to rent — no login required</p>
          </Link>
        </div>

        {/* Featured properties — scroll carousel */}
        {featured.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold gradient-text text-lg">Featured Properties</h2>
              <Link to="/properties" className="text-xs font-medium text-[#1a3a5c] underline">View all</Link>
            </div>
            <Carousel
              items={featured}
              mode="scroll"
              renderItem={(p) => <div className="w-72"><PropertyCard property={p} /></div>}
            />
          </div>
        )}

        {/* Why Vyom Shelter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Feature icon={ShieldCheck} title="Verified Listings" desc="Every property is document-checked & site-verified before going live." />
          <Feature icon={BadgeCheck} title="Trusted Broker" desc="Vyom Shelter facilitates the full transaction, end to end." />
          <Feature icon={Search} title="Smart Search" desc="Filter by location, budget, type and area to find the right match." />
          <Feature icon={Key} title="Buy, Sell or Rent" desc="One platform for every kind of property transaction." />
        </div>

        {/* Become an Associate */}
        <div className="card p-8 bg-gradient-to-r from-[#fff7ed] to-[#ffeede] border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h2 className="font-bold text-[#1a3a5c] text-lg mb-1">Want to work with us?</h2>
            <p className="text-sm text-gray-500">Become a Vyom Shelter Associate and earn through property deals in your area. Login required for this section only.</p>
          </div>
          <Link to="/login" className="btn-accent text-base px-6 py-3 rounded-xl flex-shrink-0">
            <UserPlus size={18} /> Become an Associate
          </Link>
        </div>
      </div>
    </div>
  );
}
