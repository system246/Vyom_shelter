import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Maximize, Compass, Ruler, BadgeCheck, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchPropertyById, submitEnquiry } from '../../services/propertyApi';
import { PROPERTY_TYPE_LABELS, FACILITIES, LANDMARK_TYPES } from '../../utils/constants';
import InputField from '../../components/ui/InputField';
import DynamicIcon from '../../components/ui/DynamicIcon';

const formatPrice = (price) => {
  if (price >= 1e7) return `₹${(price / 1e7).toFixed(2)} Cr`;
  if (price >= 1e5) return `₹${(price / 1e5).toFixed(2)} Lac`;
  return `₹${price?.toLocaleString('en-IN')}`;
};

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchPropertyById(id)
      .then((res) => setProperty(res.data))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile) return toast.error('Name and mobile number are required');
    setSubmitting(true);
    try {
      await submitEnquiry(id, { ...form, type: 'interest' });
      setSent(true);
      toast.success('Enquiry sent! Our team will contact you soon.');
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile) return toast.error('Name and mobile number are required');
    setSubmitting(true);
    try {
      await submitEnquiry(id, { ...form, type: 'site_visit' });
      setSent(true);
      toast.success('Site visit request sent!');
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-24 text-gray-400"><Loader2 className="animate-spin mr-2" size={18} /> Loading...</div>;
  if (!property) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-3">This property is not available or pending verification.</p>
      <Link to="/properties" className="text-[#1a3a5c] underline text-sm">Back to listings</Link>
    </div>
  );

  const images = property.media?.images || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      {/* Left: details */}
      <div className="md:col-span-2 space-y-5">
        <div className="card overflow-hidden">
          <div className="h-72 bg-gray-100 flex items-center justify-center">
            {images.length ? (
              <img src={`/uploads/${images[activeImg]}`} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <p className="text-gray-300 text-sm">No image available</p>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {images.map((img, idx) => (
                <button key={img} onClick={() => setActiveImg(idx)} className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${activeImg === idx ? 'border-[#1a3a5c]' : 'border-transparent'}`}>
                  <img src={`/uploads/${img}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium mb-2">
            <BadgeCheck size={14} /> Verified by Vyom Shelter
          </div>
          <h1 className="text-xl font-bold text-[#1a3a5c]">{property.title}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={14} /> {property.location?.locality}, {property.location?.city}, {property.location?.district}, {property.location?.state} — {property.location?.pincode}
          </p>
          <p className="text-2xl font-bold text-[#1a3a5c] mt-3">
            {formatPrice(property.price)}{property.listingType === 'rent' ? '/month' : ''}
            {property.negotiable && <span className="text-xs font-normal text-gray-400 ml-2">Negotiable</span>}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600"><Maximize size={15} className="text-gray-400" /> {property.area?.value} {property.area?.unit}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Compass size={15} className="text-gray-400" /> {property.facing || '—'} facing</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Ruler size={15} className="text-gray-400" /> Road: {property.frontRoadWidth || '—'}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">{PROPERTY_TYPE_LABELS[property.propertyType]}</div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-[#1a3a5c] text-sm mb-2 uppercase tracking-wide">Description</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
        </div>

        {property.facilities?.length > 0 && (
          <div className="card p-5">
            <h2 className="font-semibold text-[#1a3a5c] text-sm mb-3 uppercase tracking-wide">Facilities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.facilities.map((f) => {
                const def = FACILITIES.find((x) => x.value === f);
                return (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <DynamicIcon name={def?.icon} size={15} className="text-[#1a3a5c]" />
                    {def?.label || f}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {property.nearbyLandmarks?.length > 0 && (
          <div className="card p-5">
            <h2 className="font-semibold text-[#1a3a5c] text-sm mb-3 uppercase tracking-wide">Nearby Locations</h2>
            <div className="flex flex-wrap gap-2">
              {property.nearbyLandmarks.map((l, idx) => {
                const def = LANDMARK_TYPES.find((x) => x.value === l.type);
                return (
                  <span key={idx} className="flex items-center gap-1.5 bg-[#e8f0fb] text-[#1a3a5c] text-xs font-medium px-3 py-1.5 rounded-full">
                    <DynamicIcon name={def?.icon} size={13} />
                    {def?.label || l.type} &middot; {l.distanceKm} km
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right: enquiry */}
      <div className="space-y-4">
        <div className="card p-5 sticky top-20">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={16} className="text-[#1a3a5c]" />
            <h3 className="font-semibold text-gray-800 text-sm">Interested in this property?</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">No login needed — just share your details and Vyom Shelter will get in touch.</p>

          {sent ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Thanks! We'll contact you shortly.</p>
            </div>
          ) : (
            <form className="space-y-1">
              <InputField label="Full Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <InputField label="Mobile Number" required value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
              <InputField label="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <InputField label="Message (optional)" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />

              <div className="flex flex-col gap-2 mt-3">
                <button onClick={handleEnquiry} disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting ? 'Sending...' : "I'm Interested"}
                </button>
                <button onClick={handleScheduleVisit} disabled={submitting} className="btn-secondary w-full justify-center">
                  Schedule a Site Visit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
