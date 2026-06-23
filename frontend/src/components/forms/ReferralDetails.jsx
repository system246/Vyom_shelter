import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Building2 } from 'lucide-react';
import InputField from '../ui/InputField';
import { referralSchema } from '../../utils/validations';
import { HEAD_REFERRAL_CODE, HEAD_REFERRAL_NAME } from '../../utils/constants';
import { generateCandidateRefNo } from '../../utils/localStorage';

export default function ReferralDetails({ data, onNext, onPrev }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      associateRefNo: '',
      associateName: '',
      // Auto-generated once and reused — the candidate never has to invent this themselves
      newCandidateRefNo: generateCandidateRefNo(),
      isDirect: false,
      ...data,
    },
  });

  const isDirect = watch('isDirect');

  // When toggling "no referrer", fill the referrer fields with the Head Office code.
  useEffect(() => {
    if (isDirect) {
      setValue('associateRefNo', HEAD_REFERRAL_CODE);
      setValue('associateName', HEAD_REFERRAL_NAME);
    }
  }, [isDirect]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Users size={15} /> Referring Associate</h3>

        <label className="flex items-start gap-2.5 mb-4 p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 cursor-pointer">
          <input type="checkbox" className="mt-0.5" {...register('isDirect')} />
          <span className="text-sm text-gray-600">
            <span className="font-medium text-gray-800 flex items-center gap-1.5"><Building2 size={14} /> I wasn't referred by any associate</span>
            Registering directly under Vyom Shelter's Head Office — no referrer needed.
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField
            label="Associate Ref No" required
            placeholder="e.g. ASC123456"
            disabled={isDirect}
            error={errors.associateRefNo?.message}
            {...register('associateRefNo')}
          />
          <InputField
            label="Associate Name" required
            placeholder="Name of referring associate"
            disabled={isDirect}
            error={errors.associateName?.message}
            {...register('associateName')}
          />
          <InputField
            label="Your Referral Code"
            readOnly
            hint="Auto-generated — you'll use this if you refer someone else later."
            {...register('newCandidateRefNo')}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onPrev} className="btn-secondary">← Previous</button>
        <button type="submit" className="btn-primary">Next Step →</button>
      </div>
    </form>
  );
}
