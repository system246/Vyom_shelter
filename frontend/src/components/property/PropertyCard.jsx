import { Link } from 'react-router-dom';
import { MapPin, Maximize, BadgeCheck, Home as HomeIcon } from 'lucide-react';
import { PROPERTY_TYPE_LABELS } from '../../utils/constants';

const formatPrice = (price) => {
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} Lac`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function PropertyCard({ property }) {
  const img = property.media?.images?.[0];
  return (
    <Link
      to={`/properties/${property.propertyId}`}
      className="card card-hover overflow-hidden block group"
    >
      <div className="h-40 bg-gray-100 relative overflow-hidden">
        {img ? (
          <img src={`/uploads/${img}`} alt={property.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <HomeIcon size={36} />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-[#1a3a5c] text-white text-[10px] font-semibold px-2 py-1 rounded-md uppercase">
          For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
        </span>
        {property.featured && (
          <span className="absolute top-2 right-2 bg-[#e85d26] text-white text-[10px] font-semibold px-2 py-1 rounded-md">Featured</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-green-700 font-medium mb-1">
          <BadgeCheck size={13} /> Verified by Vyom Shelter
        </div>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">{property.title}</h3>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <MapPin size={12} /> {property.location?.locality}, {property.location?.city}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[#1a3a5c] font-bold text-base">
            {formatPrice(property.price)}{property.listingType === 'rent' ? '/mo' : ''}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Maximize size={12} /> {property.area?.value} {property.area?.unit}
          </p>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">{PROPERTY_TYPE_LABELS[property.propertyType]}</p>
      </div>
    </Link>
  );
}
