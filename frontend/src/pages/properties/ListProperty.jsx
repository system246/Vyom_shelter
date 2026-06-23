import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, CheckCircle2, Home, Sparkles, MapPinned } from 'lucide-react';
import toast from 'react-hot-toast';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TagMultiSelect from '../../components/ui/TagMultiSelect';
import LandmarkPicker from '../../components/ui/LandmarkPicker';
import { submitProperty } from '../../services/propertyApi';
import { PROPERTY_TYPES, AREA_UNITS, FACING_OPTIONS, LISTING_TYPES, FACILITIES, POSSESSION_TYPES } from '../../utils/constants';

const emptyForm = {
  listingType: 'sale',
  propertyType: '',
  title: '',
  description: '',
  location: { state: '', district: '', city: '', locality: '', address: '', pincode: '' },
  area: { value: '', unit: 'sqft' },
  frontRoadWidth: '',
  facing: '',
  facilities: [],
  nearbyLandmarks: [],
  price: '',
  negotiable: false,
  seller: { name: '', mobile: '', email: '' },
  ownership: {
    ownerName: '', details: '',
    previousOwnerName: '', ownershipChain: '', possessionType: '',
    numberOfPreviousOwners: '', yearOfPurchase: '', litigationFree: true,
  },
  images: [],
  video: null,
  documents: {},
};

const DOC_FIELDS = [
  { key: 'saleDeed', label: 'Sale Deed' },
  { key: 'khataKhasra', label: 'Khata / Khasra' },
  { key: 'registry', label: 'Registry Document' },
  { key: 'taxReceipt', label: 'Property Tax Receipt' },
  { key: 'ownershipProof', label: 'Ownership Proof' },
  { key: 'encumbranceCertificate', label: 'Encumbrance Certificate' },
];

function MultiImagePicker({ images, onChange }) {
  const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 10 - images.length);
    onChange([...images, ...arr]);
  };
  return (
    <div className="mb-4">
      <label className="label-base">Property Images (up to 10)</label>
      <div className="flex flex-wrap gap-2">
        {images.map((file, idx) => (
          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
            <img src={previews[idx]} className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(images.filter((_, i) => i !== idx))}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
              <X size={11} />
            </button>
          </div>
        ))}
        {images.length < 10 && (
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#1a3a5c]/50 hover:bg-[#1a3a5c]/5 transition-colors">
            <Upload size={18} className="text-gray-400" />
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </label>
        )}
      </div>
    </div>
  );
}

function SingleDocPicker({ label, file, onChange }) {
  return (
    <div className="mb-3">
      <label className="label-base">{label}</label>
      {!file ? (
        <label className="drop-zone cursor-pointer flex items-center gap-2 p-3 text-sm text-gray-500">
          <Upload size={15} /> Upload {label}
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onChange(e.target.files[0])} />
        </label>
      ) : (
        <div className="flex items-center gap-2 border border-green-200 bg-green-50 rounded-lg p-2.5">
          <FileText size={16} className="text-green-700" />
          <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
          <button type="button" onClick={() => onChange(null)}><X size={14} className="text-red-400" /></button>
        </div>
      )}
    </div>
  );
}

export default function ListProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const set = (path, value) => {
    setForm((f) => {
      const next = { ...f };
      if (path.includes('.')) {
        const [a, b] = path.split('.');
        next[a] = { ...next[a], [b]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.propertyType) return toast.error('Please select a property type');
    if (!form.seller.name || !form.seller.mobile) return toast.error('Seller name and mobile are required');
    setSubmitting(true);
    try {
      const res = await submitProperty(form);
      setDone(res.propertyId);
      toast.success('Property submitted for verification!');
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle2 size={40} className="mx-auto text-green-600 mb-4" />
        <h1 className="text-xl font-bold text-[#1a3a5c] mb-2">Property Submitted!</h1>
        <p className="text-sm text-gray-500 mb-1">Your reference ID:</p>
        <p className="font-mono text-sm bg-gray-100 inline-block px-3 py-1 rounded-md mb-5">{done}</p>
        <p className="text-sm text-gray-500 mb-6">
          Our Vyom Shelter team will verify your documents and details. Once approved, your listing will go live on the portal.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mx-auto">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fb] text-[#1a3a5c] text-xs font-semibold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
          <Home size={13} /> List Your Property — No Login Required
        </div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Sell or Rent Out Your Property</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below. Our team verifies every listing before it goes live.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Listing type */}
        <div>
          <label className="label-base">I want to</label>
          <div className="flex gap-2">
            {LISTING_TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => set('listingType', t.value)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${form.listingType === t.value ? 'bg-[#1a3a5c] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {t.value === 'sale' ? 'Sell' : 'Rent Out'}
              </button>
            ))}
          </div>
        </div>

        <div className="section-title">Property Details</div>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Property Title" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 3BHK Flat near City Center" className="sm:col-span-2" />
          <SelectField label="Property Type" required options={PROPERTY_TYPES} value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)} />
          <SelectField label="Facing" options={FACING_OPTIONS} value={form.facing} onChange={(e) => set('facing', e.target.value)} />
          <div className="sm:col-span-2 mb-4">
            <label className="label-base">Description <span className="text-red-500">*</span></label>
            <textarea required rows={4} className="input-base" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the property — rooms, amenities, nearby landmarks..." />
          </div>
        </div>

        <div className="section-title">Location</div>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="State" required value={form.location.state} onChange={(e) => set('location.state', e.target.value)} />
          <InputField label="District" required value={form.location.district} onChange={(e) => set('location.district', e.target.value)} />
          <InputField label="City" required value={form.location.city} onChange={(e) => set('location.city', e.target.value)} />
          <InputField label="Locality" required value={form.location.locality} onChange={(e) => set('location.locality', e.target.value)} />
          <InputField label="Pin Code" required value={form.location.pincode} onChange={(e) => set('location.pincode', e.target.value)} />
          <InputField label="Full Address" required value={form.location.address} onChange={(e) => set('location.address', e.target.value)} className="sm:col-span-2" />
        </div>

        <div className="section-title">Area & Pricing</div>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Area" required type="number" value={form.area.value} onChange={(e) => set('area.value', e.target.value)} />
          <SelectField label="Unit" options={AREA_UNITS} value={form.area.unit} onChange={(e) => set('area.unit', e.target.value)} />
          <InputField label="Front Road Width" value={form.frontRoadWidth} onChange={(e) => set('frontRoadWidth', e.target.value)} placeholder="e.g. 30 ft" />
          <InputField label={`Price (₹) ${form.listingType === 'rent' ? '/ month' : ''}`} required type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <input type="checkbox" checked={form.negotiable} onChange={(e) => set('negotiable', e.target.checked)} /> Price is negotiable
          </label>
        </div>

        <div className="section-title"><Sparkles size={14} /> Facilities</div>
        <p className="text-xs text-gray-400 -mt-2 mb-3">Select everything available at this property.</p>
        <TagMultiSelect options={FACILITIES} selected={form.facilities} onChange={(v) => set('facilities', v)} />

        <div className="section-title"><MapPinned size={14} /> Nearby Locations</div>
        <p className="text-xs text-gray-400 -mt-2 mb-3">Add nearby places and how far they are (e.g. Metro Station, 1 km).</p>
        <LandmarkPicker value={form.nearbyLandmarks} onChange={(v) => set('nearbyLandmarks', v)} />

        <div className="section-title">Photos & Video</div>
        <MultiImagePicker images={form.images} onChange={(imgs) => set('images', imgs)} />
        <SingleDocPicker label="Property Video (optional)" file={form.video} onChange={(f) => set('video', f)} />

        <div className="section-title">Ownership History & Evidence</div>
        <p className="text-xs text-gray-400 -mt-2 mb-2">Stronger ownership evidence speeds up verification and builds buyer trust.</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Current Owner Name" value={form.ownership.ownerName} onChange={(e) => set('ownership.ownerName', e.target.value)} />
          <SelectField label="Possession Type" options={POSSESSION_TYPES} value={form.ownership.possessionType} onChange={(e) => set('ownership.possessionType', e.target.value)} />
          <InputField label="Previous Owner Name (if any)" value={form.ownership.previousOwnerName} onChange={(e) => set('ownership.previousOwnerName', e.target.value)} placeholder="Leave blank if first owner" />
          <InputField label="No. of Previous Owners" type="number" min="0" value={form.ownership.numberOfPreviousOwners} onChange={(e) => set('ownership.numberOfPreviousOwners', e.target.value)} />
          <InputField label="Year of Purchase / Acquisition" type="number" placeholder="e.g. 2015" value={form.ownership.yearOfPurchase} onChange={(e) => set('ownership.yearOfPurchase', e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 mt-6">
            <input type="checkbox" checked={form.ownership.litigationFree} onChange={(e) => set('ownership.litigationFree', e.target.checked)} />
            Property is free of any litigation / legal dispute
          </label>
          <div className="sm:col-span-2 mb-4">
            <label className="label-base">Ownership Chain / History</label>
            <textarea rows={3} className="input-base" value={form.ownership.ownershipChain}
              onChange={(e) => set('ownership.ownershipChain', e.target.value)}
              placeholder="Briefly describe how ownership passed — e.g. inherited from father in 2010, purchased from XYZ in 2015..." />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2 mb-2">Upload supporting documents (optional but speeds up verification):</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          {DOC_FIELDS.map((d) => (
            <SingleDocPicker key={d.key} label={d.label} file={form.documents[d.key]}
              onChange={(f) => set('documents', { ...form.documents, [d.key]: f })} />
          ))}
        </div>

        <div className="section-title">Your Contact Details</div>
        <p className="text-xs text-gray-400 -mt-2 mb-2">No account needed — Vyom Shelter will reach out using these details.</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Your Name" required value={form.seller.name} onChange={(e) => set('seller.name', e.target.value)} />
          <InputField label="Mobile Number" required value={form.seller.mobile} onChange={(e) => set('seller.mobile', e.target.value)} />
          <InputField label="Email (optional)" value={form.seller.email} onChange={(e) => set('seller.email', e.target.value)} />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 text-base">
          {submitting ? 'Submitting...' : 'Submit Property for Verification'}
        </button>
      </form>
    </div>
  );
}
