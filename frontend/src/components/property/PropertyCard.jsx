import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, BadgeCheck } from 'lucide-react';
import { resolveFileUrl } from '../../utils/resolveFileUrl';

const formatPrice = (price) => {
  if (!price) return 'Price on Request';
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} Lac`;
  return `₹${price.toLocaleString('en-IN')}`;
};

function PropertyCard({ property }) {
  const img = property.media?.images?.[0];
  return (
    <Link to={`/properties/${property.propertyId}`} className="group card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {img
          ? <img src={resolveFileUrl(img)} alt={property.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full bg-gradient-to-br from-[#1a3a5c] to-[#2563a8]" />}
        {property.isVerified && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-full text-green-700">
            <BadgeCheck size={10} /> Verified
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-white font-bold">{formatPrice(property.price)}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{property.title}</p>
        <div className="flex items-center gap-1 text-gray-400 mb-2">
          <MapPin size={11} /><span className="text-xs">{property.location?.locality}, {property.location?.city}</span>
        </div>
        {property.area?.value && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Maximize size={11} />{property.area.value} {property.area.unit}
          </div>
        )}
      </div>
    </Link>
  );
}

export default memo(PropertyCard);
