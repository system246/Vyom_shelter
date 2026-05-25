import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Loader2, Info } from 'lucide-react';
import { useState, useRef } from 'react';
import InputField from '../ui/InputField';
import { referralSchema } from '../../utils/validations';

export default function ReferralDetails({ data, onNext, onPrev }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(referralSchema),
    defaultValues: data || {},
  });

  const [lookupState, setLookupState] = useState('idle');
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
        setValue('associateName', '');
        setValue('circle', '');
        setLookupState('not_found');
      }
    } catch { setLookupState('not_found'); }
  };

  const refNoProps = register('associateRefNo');

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Users size={15} /> Referring Associate</h3>

        {/* Info notice */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-700">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">No referral? That's okay.</p>
            <p className="text-blue-600 mt-0.5">If you weren't referred by anyone, leave these fields blank and proceed.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {/* Referral No with lookup */}
          <div className="relative">
            <InputField
              label="Referring Associate Ref No"
              placeholder="e.g. VYOM12345PO (optional)"
              error={errors.associateRefNo?.message}
              {...refNoProps}
              onBlur={(e) => { refNoProps.onBlur(e); doLookup(e.target.value); }}
            />
            {lookupState === 'loading' && (
              <span className="absolute right-3 top-8 text-gray-400"><Loader2 size={14} className="animate-spin" /></span>
            )}
            {lookupState === 'found' && (
              <span className="text-xs text-green-600 mt-0.5 block">✓ Associate found — name & circle filled</span>
            )}
            {lookupState === 'not_found' && (
              <span className="text-xs text-amber-600 mt-0.5 block">Not found — enter manually or leave blank</span>
            )}
          </div>

          {/* Associate Name */}
          <InputField
            label="Referring Associate Name"
            placeholder="Auto-filled or enter manually (optional)"
            error={errors.associateName?.message}
            {...register('associateName')}
          />

          {/* Circle with explanation */}
          <div>
            <InputField
              label="Circle"
              placeholder="e.g. North Delhi, Mumbai West (optional)"
              error={errors.circle?.message}
              {...register('circle')}
            />
            <p className="text-xs text-gray-400 -mt-1 mb-2">
              Circle = the geographic region/branch your referring associate belongs to.
            </p>
          </div>
        </div>

        {/* Info about candidate ref no */}
        <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mt-2 text-xs text-gray-500">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <p>Your personal referral number (VYOM format) will be generated automatically once your application is approved by the admin.</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onPrev} className="btn-secondary">← Previous</button>
        <button type="submit" className="btn-primary">Next Step →</button>
      </div>
    </form>
  );
}
