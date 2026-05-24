import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import InputField from '../ui/InputField';
import { referralSchema } from '../../utils/validations';

export default function ReferralDetails({ data, onNext, onPrev }) {
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(referralSchema),
    defaultValues: data || {},
  });

  const [lookupState, setLookupState] = useState('idle'); // 'idle' | 'loading' | 'found' | 'not_found'
  const lastLookedUp = useRef('');

  const doLookup = async (refNo) => {
    const trimmed = refNo?.trim();
    if (!trimmed || trimmed === lastLookedUp.current) return;
    lastLookedUp.current = trimmed;

    setLookupState('loading');
    try {
      const res  = await fetch(`/api/associates/lookup?refNo=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setValue('associateName', data.data.associateName, { shouldValidate: true });
        setValue('circle', data.data.circle, { shouldValidate: true });
        setLookupState('found');
      } else {
        // Clear fields if not found
        setValue('associateName', '', { shouldValidate: false });
        setValue('circle', '', { shouldValidate: false });
        setLookupState('not_found');
      }
    } catch {
      setLookupState('not_found');
    }
  };

  const refNoProps = register('associateRefNo');

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Users size={15} /> Referring Associate</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">

          {/* Referral No with lookup trigger */}
          <div className="relative">
            <InputField
              label="Associate Ref No"
              required
              placeholder="e.g. ASC123456"
              error={errors.associateRefNo?.message}
              {...refNoProps}
              onBlur={(e) => {
                refNoProps.onBlur(e);
                doLookup(e.target.value);
              }}
            />
            {lookupState === 'loading' && (
              <span className="absolute right-3 top-8 text-gray-400">
                <Loader2 size={14} className="animate-spin" />
              </span>
            )}
            {lookupState === 'found' && (
              <span className="text-xs text-green-600 mt-0.5 block">✓ Associate found — details filled automatically</span>
            )}
            {lookupState === 'not_found' && (
              <span className="text-xs text-amber-600 mt-0.5 block">No associate found with this ref no — enter details manually</span>
            )}
          </div>

          {/* Associate Name — auto-filled or manual */}
          <InputField
            label="Associate Name"
            required
            placeholder="Auto-filled from ref no, or enter manually"
            error={errors.associateName?.message}
            {...register('associateName')}
          />

          {/* Circle — auto-filled or manual */}
          <InputField
            label="Circle"
            required
            placeholder="Auto-filled from ref no, or enter manually"
            error={errors.circle?.message}
            {...register('circle')}
          />

          <InputField
            label="New Candidate Referral No"
            required
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
