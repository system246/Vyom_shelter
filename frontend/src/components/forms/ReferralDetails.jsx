import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
import InputField from '../ui/InputField';
import { referralSchema } from '../../utils/validations';

export default function ReferralDetails({ data, onNext, onPrev }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(referralSchema),
    defaultValues: data || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Users size={15} /> Referring Associate</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField
            label="Associate Ref No" required
            placeholder="e.g. ASC123456"
            error={errors.associateRefNo?.message}
            {...register('associateRefNo')}
          />
          <InputField
            label="Associate Name" required
            placeholder="Name of referring associate"
            error={errors.associateName?.message}
            {...register('associateName')}
          />
          <InputField
            label="Circle" required
            placeholder="e.g. North Delhi, Mumbai West"
            error={errors.circle?.message}
            {...register('circle')}
          />
          <InputField
            label="New Candidate Referral No" required
            placeholder="e.g. NEW987654"
            error={errors.newCandidateRefNo?.message}
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
