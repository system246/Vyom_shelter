import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark } from 'lucide-react';
import InputField from '../ui/InputField';
import { bankSchema } from '../../utils/validations';

export default function BankDetails({ data, onNext, onPrev }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: data || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Landmark size={15} /> Bank Account Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField
            label="Bank Name" required
            placeholder="e.g. State Bank of India"
            error={errors.bankName?.message}
            {...register('bankName')}
          />
          <InputField
            label="Branch Name" required
            placeholder="e.g. Connaught Place, Delhi"
            error={errors.branch?.message}
            {...register('branch')}
          />
          <InputField
            label="IFSC Code" required
            type="text" maxLength={11}
            placeholder="e.g. SBIN0001234"
            hint="11-character IFSC code"
            error={errors.ifscCode?.message}
            style={{ textTransform: 'uppercase' }}
            {...register('ifscCode')}
          />
          <InputField
            label="Account Number" required
            type="text" maxLength={18}
            placeholder="9–18 digit account number"
            error={errors.accountNumber?.message}
            {...register('accountNumber')}
          />
        </div>

        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 font-medium">⚠ Please double-check your bank details. Incorrect details may delay payments.</p>
        </div>
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onPrev} className="btn-secondary">← Previous</button>
        <button type="submit" className="btn-primary">Next Step →</button>
      </div>
    </form>
  );
}
