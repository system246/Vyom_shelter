import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, CheckCircle2, Home, Sparkles, MapPinned } from 'lucide-react';
import toast from 'react-hot-toast';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TagMultiSelect from '../../components/ui/TagMultiSelect';
import LandmarkPicker from '../../components/ui/LandmarkPicker';
import Seo from '../../components/seo/Seo';
import { submitProperty } from '../../services/propertyApi';
import { listPropertySchema } from '../../utils/validations';
import { PROPERTY_TYPES, AREA_UNITS, FACING_OPTIONS, LISTING_TYPES, FACILITIES, POSSESSION_TYPES } from '../../utils/constants';

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
            <img src={previews[idx]} alt={`Property photo ${idx + 1} preview`} className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(images.filter((_, i) => i !== idx))}
              aria-label={`Remove photo ${idx + 1}`}
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
          <button type="button" onClick={() => onChange(null)} aria-label={`Remove ${file.name}`}><X size={14} className="text-red-400" /></button>
        </div>
      )}
    </div>
  );
}

const DOC_FIELDS = [
  { key: 'saleDeed',               label: 'Sale Deed' },
  { key: 'khataKhasra',            label: 'Khata / Khasra' },
  { key: 'registry',               label: 'Registry Document' },
  { key: 'taxReceipt',             label: 'Property Tax Receipt' },
  { key: 'ownershipProof',         label: 'Ownership Proof' },
  { key: 'encumbranceCertificate', label: 'Encumbrance Certificate' },
];

export default function ListProperty() {
  const navigate = useNavigate();
  const [images, setImages]       = useState([]);
  const [video, setVideo]         = useState(null);
  const [documents, setDocuments] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(listPropertySchema),
    defaultValues: {
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
    },
  });

  const listingType = watch('listingType');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await submitProperty({ ...data, images, video, documents });
      setDone(res.propertyId);
      toast.success('Property submitted for verification!');
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Seo noindex title="Property Submitted" />
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
      <Seo
        title="Sell or Rent Out Your Property"
        description="List your property for sale or rent with Vyom Shelter — no login required. Our team verifies every listing before it goes live."
        path="/sell"
      />
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#e8f0fb] text-[#1a3a5c] text-xs font-semibold px-4 py-1.5 rounded-full mb-3 uppercase tracking-wider">
          <Home size={13} /> List Your Property — No Login Required
        </div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Sell or Rent Out Your Property</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below. Our team verifies every listing before it goes live.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">

        {/* Listing type */}
        <div>
          <label className="label-base">I want to</label>
          <div className="flex gap-2">
            {LISTING_TYPES.map((t) => (
              <button key={t.value} type="button"
                onClick={() => setValue('listingType', t.value)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${listingType === t.value ? 'bg-[#1a3a5c] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {t.value === 'sale' ? 'Sell' : 'Rent Out'}
              </button>
            ))}
          </div>
        </div>

        <div className="section-title">Property Details</div>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField
            label="Property Title" required
            placeholder="e.g. 3BHK Flat near City Center"
            className="sm:col-span-2"
            error={errors.title?.message}
            {...register('title')}
          />
          <SelectField
            label="Property Type" required
            options={PROPERTY_TYPES}
            error={errors.propertyType?.message}
            {...register('propertyType')}
          />
          <SelectField
            label="Facing"
            options={FACING_OPTIONS}
            {...register('facing')}
          />
          <div className="sm:col-span-2 mb-4">
            <label className="label-base">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={4}
              className={`input-base ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the property — rooms, amenities, nearby landmarks..."
              {...register('description')}
            />
            {errors.description && <p className="error-msg">{errors.description.message}</p>}
          </div>
        </div>

        <div className="section-title">Location</div>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="State"    required error={errors.location?.state?.message}    {...register('location.state')} />
          <InputField label="District" required error={errors.location?.district?.message} {...register('location.district')} />
          <InputField label="City"     required error={errors.location?.city?.message}     {...register('location.city')} />
          <InputField label="Locality" required error={errors.location?.locality?.message} {...register('location.locality')} />
          <InputField label="Pin Code" required error={errors.location?.pincode?.message}  {...register('location.pincode')} />
          <InputField label="Full Address" required className="sm:col-span-2" error={errors.location?.address?.message} {...register('location.address')} />
        </div>

        <div className="section-title">Area & Pricing</div>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField
            label="Area" required type="number"
            error={errors.area?.value?.message}
            {...register('area.value')}
          />
          <SelectField
            label="Unit"
            options={AREA_UNITS}
            {...register('area.unit')}
          />
          <InputField
            label="Front Road Width"
            placeholder="e.g. 30 ft"
            {...register('frontRoadWidth')}
          />
          <InputField
            label={`Price (₹)${listingType === 'rent' ? ' / month' : ''}`} required type="number"
            error={errors.price?.message}
            {...register('price')}
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <input type="checkbox" {...register('negotiable')} /> Price is negotiable
          </label>
        </div>

        <div className="section-title"><Sparkles size={14} /> Facilities</div>
        <p className="text-xs text-gray-400 -mt-2 mb-3">Select everything available at this property.</p>
        <Controller
          name="facilities"
          control={control}
          render={({ field }) => (
            <TagMultiSelect options={FACILITIES} selected={field.value} onChange={field.onChange} />
          )}
        />

        <div className="section-title"><MapPinned size={14} /> Nearby Locations</div>
        <p className="text-xs text-gray-400 -mt-2 mb-3">Add nearby places and how far they are (e.g. Metro Station, 1 km).</p>
        <Controller
          name="nearbyLandmarks"
          control={control}
          render={({ field }) => (
            <LandmarkPicker value={field.value} onChange={field.onChange} />
          )}
        />

        <div className="section-title">Photos & Video</div>
        <MultiImagePicker images={images} onChange={setImages} />
        <SingleDocPicker label="Property Video (optional)" file={video} onChange={setVideo} />

        <div className="section-title">Ownership History & Evidence</div>
        <p className="text-xs text-gray-400 -mt-2 mb-2">Stronger ownership evidence speeds up verification and builds buyer trust.</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Current Owner Name"           {...register('ownership.ownerName')} />
          <SelectField label="Possession Type" options={POSSESSION_TYPES} {...register('ownership.possessionType')} />
          <InputField label="Previous Owner Name (if any)" placeholder="Leave blank if first owner" {...register('ownership.previousOwnerName')} />
          <InputField label="No. of Previous Owners" type="number" min="0" {...register('ownership.numberOfPreviousOwners')} />
          <InputField label="Year of Purchase / Acquisition" type="number" placeholder="e.g. 2015" {...register('ownership.yearOfPurchase')} />
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 mt-6">
            <input type="checkbox" {...register('ownership.litigationFree')} />
            Property is free of any litigation / legal dispute
          </label>
          <div className="sm:col-span-2 mb-4">
            <label className="label-base">Ownership Chain / History</label>
            <textarea rows={3} className="input-base"
              placeholder="Briefly describe how ownership passed — e.g. inherited from father in 2010, purchased from XYZ in 2015..."
              {...register('ownership.ownershipChain')}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2 mb-2">Upload supporting documents (optional but speeds up verification):</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          {DOC_FIELDS.map((d) => (
            <SingleDocPicker key={d.key} label={d.label} file={documents[d.key]}
              onChange={(f) => setDocuments(prev => ({ ...prev, [d.key]: f }))} />
          ))}
        </div>

        <div className="section-title">Your Contact Details</div>
        <p className="text-xs text-gray-400 -mt-2 mb-2">No account needed — Vyom Shelter will reach out using these details.</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Your Name"      required error={errors.seller?.name?.message}   {...register('seller.name')} />
          <InputField label="Mobile Number"  required error={errors.seller?.mobile?.message} {...register('seller.mobile')} />
          <InputField label="Email (optional)"        error={errors.seller?.email?.message}  {...register('seller.email')} />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 text-base">
          {submitting ? 'Submitting...' : 'Submit Property for Verification'}
        </button>
      </form>
    </div>
  );
}
