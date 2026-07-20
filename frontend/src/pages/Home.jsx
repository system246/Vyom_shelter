import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Building2, Key, ShieldCheck, UserPlus, BadgeCheck,
  Home as HomeIcon, Sparkles, Store, Warehouse, Users, MapPin,
  Quote, Plus, X, Star,
} from 'lucide-react';
import { fetchProperties } from '../services/propertyApi';
import PropertyCard from '../components/property/PropertyCard';
import CategoryCard from '../components/property/CategoryCard';
import Carousel from '../components/ui/Carousel';
import Marquee from '../components/ui/Marquee';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Reveal from '../components/ui/Reveal';
import FaqSection from '../components/property/FaqSection';
import AdPopup from '../components/ui/AdPopup';
import ExclusiveProperties from '../components/property/ExclusiveProperties';

const HERO_SLIDES = [
  {
    title: 'Find Your Next Home,', highlight: 'Verified & Hassle-Free',
    sub: 'Buy, Sell or Rent properties with confidence — every listing is personally verified by our team.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=70',
  },
  {
    title: 'List Your Property in Minutes,', highlight: 'No Login Needed',
    sub: 'Sellers and landlords can submit a listing instantly — Vyom Shelter handles verification and buyer outreach.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=70',
  },
  {
    title: 'Plots, Land & Farm Houses,', highlight: 'All in One Place',
    sub: 'Looking beyond apartments? Browse verified plots, agricultural land and farm houses too.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=70',
  },
  {
    title: 'Commercial Spaces,', highlight: 'For Your Next Venture',
    sub: 'Shops, showrooms and office spaces — verified and ready for business.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=70',
  },
];

const CATEGORIES = [
  { to: '/properties?propertyType=flat', title: 'Flats & Apartments', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=60' },
  { to: '/properties?propertyType=plot', title: 'Plots & Land', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=60' },
  { to: '/properties?propertyType=residential_house', title: 'Independent Houses', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=60' },
  { to: '/properties?propertyType=farm_house', title: 'Farm Houses', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=60' },
  { to: '/properties?propertyType=commercial_shop', title: 'Commercial Shops', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=60' },
  { to: '/properties?propertyType=agricultural_land', title: 'Agricultural Land', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=60' },
];

const TICKER = [
  { text: '100% Verified Listings' },
  { text: 'Trusted Property Broker' },
  { text: 'No Login for Buyers & Sellers' },
  { text: 'Pan-India Coverage' },
  { text: 'Site Visit Assistance' },
  { text: 'Transparent Pricing' },
];

const STATS = [
  { value: 500, suffix: '+', label: 'Properties Listed', icon: Building2 },
  { value: 50,  suffix: '+', label: 'Active Associates',  icon: Users },
  { value: 15,  suffix: '+', label: 'Cities Covered',    icon: MapPin },
  { value: 100, suffix: '%', label: 'Verified Listings', icon: ShieldCheck },
];

const TESTIMONIALS = [
  { name: 'Rohit Sharma',  role: 'Buyer, Lucknow',        text: 'Found a verified flat within a week — no broker drama, no hidden charges. The site-visit team was genuinely helpful.',                       gradient: 'from-[#1a3a5c] to-[#2563a8]' },
  { name: 'Priya Mehta',   role: 'Seller, Noida',         text: "Listed my plot without any login hassle. Got a serious buyer in 10 days through Vyom Shelter's verification process.",                     gradient: 'from-[#e85d26] to-[#f3792e]' },
  { name: 'Amit Verma',    role: 'Associate Partner',     text: 'Became an associate last year — the dashboard makes tracking leads and commissions so much easier than my old broker network.',             gradient: 'from-violet-600 to-purple-500' },
];

const Feature = ({ icon: Icon, title, desc, gradient }) => (
  <div className="card card-hover p-5">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
      <Icon size={20} className="text-white" />
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
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    fetchProperties({ featured: 'true', limit: 8 })
      .then(res => setFeatured(res.data || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ listingType });
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    navigate(`/properties?${params}`);
  };

  return (
    <div className="relative">
      {/* Promotional popup ad — Gamri Mor plots */}
      <AdPopup />

      {/* ── Hero ── */}
      <div className="relative text-white overflow-hidden">
        <Carousel
          items={HERO_SLIDES}
          mode="single"
          autoPlayMs={5500}
          showControls={false}
          className="rounded-none"
          renderItem={(slide) => (
            <div className="relative min-h-[560px] flex items-center justify-center">
              <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a2c]/85 via-[#132d49]/80 to-[#0a1a2c]/90" />
              <div className="relative z-10 max-w-5xl mx-auto px-4 py-14 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                  <Sparkles size={12} /> Vyom Shelter Pvt. Ltd. &middot; Verified Property Broker
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}<br />
                  <span className="text-[#ffb648]">{slide.highlight}</span>
                </h1>
                <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto leading-relaxed">{slide.sub}</p>
              </div>
            </div>
          )}
        />

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative z-20 bg-white rounded-2xl p-3 max-w-2xl mx-auto shadow-2xl -mt-16 mb-6">
          <div className="flex gap-2 mb-3 justify-center">
            {[{ v: 'sale', l: 'Buy' }, { v: 'rent', l: 'Rent' }].map(t => (
              <button key={t.v} type="button" onClick={() => setListingType(t.v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${listingType === t.v ? 'bg-[#1a3a5c] text-white' : 'bg-gray-100 text-gray-600'}`}>
                {t.l}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="City (e.g. Lucknow)" className="input-base flex-1" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Locality, project, keyword..." className="input-base flex-1" />
            <button type="submit" className="btn-accent justify-center px-6"><Search size={16} /> Search</button>
          </div>
        </form>
      </div>

      {/* ── Ticker ── */}
      <div className="relative bg-gradient-to-r from-[#0a1a2c] via-[#132d49] to-[#0a1a2c] border-y border-white/10 py-3 overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-20" />
        <Marquee items={TICKER} className="relative z-10" />
      </div>

      {/* ── Stats band ── */}
      <Reveal as="div" className="bg-vibrant-band relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#ffb648]/20 blur-3xl" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, suffix, label, icon: Icon }) => (
            <div key={label} className="text-center text-white">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <Icon size={20} />
              </div>
              <p className="text-3xl md:text-4xl font-bold"><AnimatedCounter value={value} suffix={suffix} /></p>
              <p className="text-xs text-white/70 mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="max-w-5xl mx-auto px-4 pt-12">
        {/* ── Quick CTAs ── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <Link to="/properties?listingType=sale" className="card card-hover p-6 text-center">
            <Building2 size={28} className="mx-auto text-[#1a3a5c] mb-2" />
            <p className="font-semibold text-gray-800">Buy a Property</p>
            <p className="text-xs text-gray-400 mt-1">Browse verified listings — no login required</p>
          </Link>
          <Link to="/sell" className="card card-hover p-6 text-center">
            <HomeIcon size={28} className="mx-auto text-[#e85d26] mb-2" />
            <p className="font-semibold text-gray-800">Sell / Rent Out</p>
            <p className="text-xs text-gray-400 mt-1">List your property — no login required</p>
          </Link>
          <Link to="/properties?listingType=rent" className="card card-hover p-6 text-center">
            <Key size={28} className="mx-auto text-[#0d9488] mb-2" />
            <p className="font-semibold text-gray-800">Rent a Property</p>
            <p className="text-xs text-gray-400 mt-1">Find a place to rent — no login required</p>
          </Link>
        </div>

        {/* ── Browse by type ── */}
        <div className="mb-12">
          <Reveal><h2 className="font-bold gradient-text text-xl mb-4">Browse by Property Type</h2></Reveal>
          <Reveal stagger className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map(c => <CategoryCard key={c.to} {...c} />)}
          </Reveal>
        </div>

        {/* ── Featured Properties ── */}
        {featured.length > 0 && (
          <Reveal className="mb-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold gradient-text text-xl">Featured Properties</h2>
              <Link to="/properties" className="text-xs font-medium text-[#1a3a5c] underline">View all</Link>
            </div>
            <Carousel
              items={featured}
              mode="scroll"
              renderItem={p => <div className="w-72"><PropertyCard property={p} /></div>}
            />
          </Reveal>
        )}
      </div>

      {/* ── Exclusive Properties (Vyom Shelter's own) ── */}
      <ExclusiveProperties />

      {/* ── Why Vyom Shelter ── */}
      <div className="bg-tint-blue py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal><h2 className="font-bold gradient-text text-xl mb-6 text-center">Why Vyom Shelter</h2></Reveal>
          <Reveal stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Feature icon={ShieldCheck} title="Verified Listings"  desc="Every property is document-checked & site-verified before going live."  gradient="from-[#1a3a5c] to-[#2563a8]" />
            <Feature icon={BadgeCheck}  title="Trusted Broker"     desc="Vyom Shelter facilitates the full transaction, end to end."             gradient="from-[#e85d26] to-[#f3792e]" />
            <Feature icon={Store}       title="Smart Search"       desc="Filter by location, budget, type and area to find the right match."     gradient="from-[#0d9488] to-[#14b8a6]" />
            <Feature icon={Warehouse}   title="Buy, Sell or Rent"  desc="One platform for every kind of property transaction."                   gradient="from-violet-500 to-purple-500" />
          </Reveal>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Reveal><h2 className="font-bold gradient-text text-xl mb-6 text-center">What People Say</h2></Reveal>
        <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card-pop p-6">
              <Quote size={22} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <div className="flex gap-0.5 ml-auto">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── Become an Associate CTA ── */}
      <div className="max-w-5xl mx-auto px-4 pb-14">
        <Reveal className="card p-8 bg-gradient-to-r from-[#fff7ed] to-[#ffeede] border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h2 className="font-bold text-[#1a3a5c] text-lg mb-1">Want to work with us?</h2>
            <p className="text-sm text-gray-500">Become a Vyom Shelter Associate and earn through property deals in your area.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/login" className="text-sm font-medium text-[#1a3a5c] hover:underline">Already an Associate? Login</Link>
            <Link to="/signup" className="btn-accent text-base px-6 py-3 rounded-xl">
              <UserPlus size={18} /> Become an Associate
            </Link>
          </div>
        </Reveal>
      </div>

      {/* ── Floating Action Button ── */}
      <div className="fixed bottom-6 right-6 z-40">
        {fabOpen && (
          <div className="mb-3 flex flex-col gap-2 items-end" style={{ animation: 'fadeSlide 0.2s ease forwards' }}>
            <Link to="/sell" onClick={() => setFabOpen(false)} className="btn-accent shadow-xl whitespace-nowrap">
              <HomeIcon size={15} /> List a Property
            </Link>
            <Link to="/properties" onClick={() => setFabOpen(false)} className="btn-primary shadow-xl whitespace-nowrap">
              <Search size={15} /> Browse Properties
            </Link>
          </div>
        )}
        <button onClick={() => setFabOpen(o => !o)}
          aria-label={fabOpen ? 'Close quick actions' : 'Open quick actions'}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#e85d26] to-[#f3792e] text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
          {fabOpen ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>
    </div>
  );
}
