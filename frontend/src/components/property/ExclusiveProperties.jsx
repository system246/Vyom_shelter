import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, BadgeCheck, ArrowRight, Star, Building2 } from 'lucide-react';
import { resolveFileUrl } from '../../utils/resolveFileUrl';

const BASE = import.meta.env.VITE_API_URL || '/api';

const formatPrice = (price) => {
  if (!price) return 'Price on Request';
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} Lac`;
  return `₹${price.toLocaleString('en-IN')}`;
};

function ExclusiveCard({ property }) {
  const img = property.media?.images?.[0];
  return (
    <Link
      to={`/properties/${property.propertyId}`}
      className="group card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-72"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {img ? (
          <img
            src={resolveFileUrl(img)}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a3a5c] to-[#2563a8]">
            <Building2 size={36} className="text-white/40" />
          </div>
        )}

        {/* Exclusive badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-[#e85d26] to-[#f3792e] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
          <Star size={9} className="fill-white" /> EXCLUSIVE
        </div>

        {/* Verified badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#1a3a5c] text-[10px] font-semibold px-2 py-1 rounded-full">
          <BadgeCheck size={10} className="text-green-600" /> Verified
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-white font-bold text-base">{formatPrice(property.price)}</p>
          <p className="text-white/70 text-[10px] capitalize">{property.listingType === 'rent' ? '/month' : ''}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-400 mb-3">
          <MapPin size={11} />
          <span className="text-xs line-clamp-1">
            {property.location?.locality}, {property.location?.city}
          </span>
        </div>
        <div className="flex items-center justify-between">
          {property.area?.value && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Maximize size={11} />
              {property.area.value} {property.area.unit}
            </div>
          )}
          <span className="text-xs text-[#1a3a5c] font-medium group-hover:underline flex items-center gap-0.5">
            View Details <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Exclusive Properties section — shows only properties marked as
 * `isExclusive: true` in the database. These are Vyom Shelter's own
 * listings, separate from user-submitted properties. Shown on the homepage
 * in a horizontally scrollable card row with a distinct orange accent header.
 */
export default function ExclusiveProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/properties?isExclusive=true&status=approved&limit=8`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data) setProperties(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all if there are no exclusive properties yet
  if (!loading && properties.length === 0) return null;

  return (
    <div className="py-12 bg-gradient-to-b from-[#0a1a2c] to-[#132d49] relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-20" />
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#e85d26]/10 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e85d26]/20 text-[#ffb648] text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wider border border-[#e85d26]/30">
              <Star size={11} className="fill-[#ffb648]" /> Vyom Shelter Exclusive
            </div>
            <h2 className="text-xl font-bold text-white">Our Own Properties</h2>
            <p className="text-xs text-blue-300 mt-1">Handpicked & directly managed by Vyom Shelter</p>
          </div>
          <Link
            to="/properties?isExclusive=true"
            className="flex items-center gap-1.5 text-xs font-medium text-[#ffb648] hover:text-orange-300 transition-colors"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {/* Scrollable card row */}
        {loading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-72 h-64 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {properties.map(p => (
              <div key={p._id} className="snap-start">
                <ExclusiveCard property={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
