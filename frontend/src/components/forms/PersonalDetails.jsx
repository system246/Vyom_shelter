import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, MapPin, Phone } from 'lucide-react';
import InputField from '../ui/InputField';
import { personalSchema } from '../../utils/validations';
import { GENDER_OPTIONS } from '../../utils/constants';

export default function PersonalDetails({ data, onNext }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: data || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      {/* Basic Info */}
      <div className="card p-6 mb-4">
        <h3 className="section-title"><User size={15} /> Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField
            label="Full Name" required
            placeholder="e.g. Ramesh Kumar"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <InputField
            label="S/D/W/O (Son/Daughter/Wife of)" required
            placeholder="e.g. Suresh Kumar"
            error={errors.sdwo?.message}
            {...register('sdwo')}
          />
          <InputField
            label="Date of Birth" required
            type="date"
            error={errors.dob?.message}
            {...register('dob')}
          />
          <div className="mb-4">
            <label className="label-base">Gender <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mt-2">
              {GENDER_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={opt.value}
                    className="accent-[#1a3a5c]"
                    {...register('gender')}
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.gender && <p className="error-msg mt-1">{errors.gender.message}</p>}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Phone size={15} /> Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField
            label="Mobile Number" required
            type="tel" maxLength={10}
            placeholder="10-digit mobile"
            error={errors.mobile?.message}
            hint="10 digits, no spaces"
            {...register('mobile')}
          />
          <InputField
            label="WhatsApp Number" required
            type="tel" maxLength={10}
            placeholder="10-digit WhatsApp"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />
          <InputField
            label="Email ID" required
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            className="sm:col-span-2"
            {...register('email')}
          />
        </div>
      </div>

      {/* Address */}
      <div className="card p-6 mb-4">
        <h3 className="section-title"><MapPin size={15} /> Address</h3>
        <div className="mb-4">
          <label className="label-base">Full Address <span className="text-red-500">*</span></label>
          <textarea
            className={`input-base resize-none h-24 ${errors.address ? 'input-error' : ''}`}
            placeholder="House/Flat No, Street, Locality, City, State"
            {...register('address')}
          />
          {errors.address && <p className="error-msg">{errors.address.message}</p>}
        </div>
        <InputField
          label="Pincode" required
          type="text" maxLength={6}
          placeholder="6-digit pincode"
          error={errors.pincode?.message}
          className="max-w-xs"
          {...register('pincode')}
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Next Step →
        </button>
      </div>
    </form>
  );
}
