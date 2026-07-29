import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, BadgeCheck, ArrowRight, Star, Building2, Phone } from 'lucide-react';
import { resolveFileUrl } from '../../utils/resolveFileUrl';

const BASE = import.meta.env.VITE_API_URL || '/api';

const formatPrice = (price) => {
  if (!price) return 'Price on Request';
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} Lac`;
  return `₹${price.toLocaleString('en-IN')}`;
};

// Static fallback — always shows even before any DB exclusive properties exist.
// These are your own properties. Add more here or mark DB properties as
// isExclusive=true from the admin panel to have them appear dynamically.
const STATIC_LISTINGS = [
  {
    _id: 'static-gamri-mor',
    title: 'Residential Plots — Gamri Mor, Agra',
    location: { city: 'Agra', locality: 'Malpura Jagner Road, Gamri Mor' },
    price: null,
    listingType: 'sale',
    area: { value: '100–200', unit: 'sqyd' },
    media: { images: ['/promo-gamri-mor.jpg'] },
    isStatic: true,
    phone: '9358344037',
    highlights: ['धारा 143 के साथ आवासीय घोषित', '5 min from New South Bypass', 'Electricity & Street Lights', 'Pucca RCC Roads'],
  },
];

function ExclusiveCard({ property }) {
  const img = property.media?.images?.[0];
  const imgSrc = img?.startsWith('/') ? img : resolveFileUrl(img);

  const Inner = () => (
    <>
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {img ? (
          <img src={imgSrc} alt={property.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] to-[#2563a8]">
            <Building2 size={36} className="text-white/40" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-[#e85d26] to-[#f3792e] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
          <Star size={9} className="fill-white" /> EXCLUSIVE
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#1a3a5c] text-[10px] font-semibold px-2 py-1 rounded-full">
          <BadgeCheck size={10} className="text-green-600" /> Verified
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white font-bold text-base">{formatPrice(property.price)}</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-400 mb-2">
          <MapPin size={11} />
          <span className="text-xs line-clamp-1">{property.location?.locality}, {property.location?.city}</span>
        </div>
        {property.area?.value && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <Maximize size={11} /> {property.area.value} {property.area.unit}
          </div>
        )}
        {property.highlights && (
          <div className="space-y-1 mb-3">
            {property.highlights.slice(0, 3).map(h => (
              <p key={h} className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#e85d26] flex-shrink-0" /> {h}
              </p>
            ))}
          </div>
        )}
        {property.phone ? (
          <a href={`tel:${property.phone}`}
            className="flex items-center justify-center gap-2 w-full bg-[#e85d26] hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
            <Phone size={12} /> Call to Enquire: {property.phone}
          </a>
        ) : (
          <span className="text-xs text-[#1a3a5c] font-medium flex items-center gap-0.5">
            View Details <ArrowRight size={11} />
          </span>
        )}
      </div>
    </>
  );

  if (property.isStatic) {
    return (
      <div className="group card overflow-hidden flex-shrink-0 w-72 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <Inner />
      </div>
    );
  }

  return (
    <Link to={`/properties/${property.propertyId}`}
      className="group card overflow-hidden flex-shrink-0 w-72 block transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Inner />
    </Link>
  );
}

export default function ExclusiveProperties() {
  const [dbProperties, setDbProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/properties?isExclusive=true&status=approved&limit=8`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.data) setDbProperties(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // DB exclusive properties first, then static fallbacks always shown
  const all = [...dbProperties, ...STATIC_LISTINGS];

  return (
    <div className="py-12 bg-gradient-to-b from-[#0a1a2c] to-[#132d49] relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#e85d26]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#7c3aed]/10 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e85d26]/20 text-[#ffb648] text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wider border border-[#e85d26]/30">
              <Star size={11} className="fill-[#ffb648]" /> Vyom Shelter Exclusive
            </div>
            <h2 className="text-xl font-bold text-white">Our Own Properties</h2>
            <p className="text-xs text-blue-300 mt-1">Handpicked & directly managed by Vyom Shelter Pvt. Ltd.</p>
          </div>
          <a href="tel:9358344037"
            className="flex items-center gap-1.5 text-xs font-medium bg-[#e85d26] hover:bg-orange-500 text-white px-4 py-2 rounded-xl transition-colors">
            <Phone size={13} /> 9358344037
          </a>
        </div>

        {loading ? (
          <div className="flex gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-72 h-72 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {all.map((p, i) => (
              <div key={p._id || i} className="snap-start">
                <ExclusiveCard property={p} />
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-blue-400 mt-5 text-center">
          Contact us — <a href="mailto:info@vyomshelter.com" className="underline hover:text-blue-200">info@vyomshelter.com</a>
        </p>
      </div>
    </div>
  );
}
