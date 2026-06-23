import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Building2, Key, ShieldCheck, UserPlus, BadgeCheck, Home as HomeIcon, Sparkles, TreePine, Store, Warehouse } from 'lucide-react';
import { fetchProperties } from '../services/propertyApi';
import PropertyCard from '../components/property/PropertyCard';
import CategoryCard from '../components/property/CategoryCard';
import Carousel from '../components/ui/Carousel';
import Marquee from '../components/ui/Marquee';

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
  '✓ 100% Verified Listings', '✓ Trusted Property Broker', '✓ No Login for Buyers & Sellers',
  '✓ Pan-India Coverage', '✓ Site Visit Assistance', '✓ Transparent Pricing',
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
      {/* Hero — image-backed banner slider */}
      <div className="relative text-white overflow-hidden">
        <Carousel
          items={HERO_SLIDES}
          mode="single"
          autoPlayMs={5500}
          showControls={false}
          className="!rounded-none"
          renderItem={(slide) => (
            <div className="relative min-h-[480px] flex items-center justify-center">
              <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a2c]/85 via-[#132d49]/80 to-[#0a1a2c]/90" />
              <div className="relative z-10 max-w-5xl mx-auto px-4 py-14 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                  <Sparkles size={12} /> Vyom Shelter Pvt. Ltd. &middot; Verified Property Broker
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {slide.title}<br />
                  <span className="text-[#ffb648]">{slide.highlight}</span>
                </h1>
                <p className="text-blue-100 text-base max-w-xl mx-auto leading-relaxed">{slide.sub}</p>
              </div>
            </div>
          )}
        />

        {/* Search — floats over the hero */}
        <form onSubmit={handleSearch} className="relative z-20 bg-white rounded-2xl p-3 max-w-2xl mx-auto shadow-2xl -mt-16 mb-10">
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

      {/* Ticker strip */}
      <div className="bg-[#1a3a5c] border-y border-white/10 text-white/90 py-2.5">
        <Marquee items={TICKER} />
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

        {/* Browse by property type — image grid */}
        <div className="mb-12">
          <h2 className="font-bold gradient-text text-lg mb-4">Browse by Property Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((c) => <CategoryCard key={c.to} {...c} />)}
          </div>
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

        {/* Why Vyom Shelter — colorful gradient icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Feature icon={ShieldCheck} title="Verified Listings" desc="Every property is document-checked & site-verified before going live." gradient="from-[#1a3a5c] to-[#2563a8]" />
          <Feature icon={BadgeCheck} title="Trusted Broker" desc="Vyom Shelter facilitates the full transaction, end to end." gradient="from-[#e85d26] to-[#f3792e]" />
          <Feature icon={Store} title="Smart Search" desc="Filter by location, budget, type and area to find the right match." gradient="from-[#0d9488] to-[#14b8a6]" />
          <Feature icon={Warehouse} title="Buy, Sell or Rent" desc="One platform for every kind of property transaction." gradient="from-violet-500 to-purple-500" />
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
