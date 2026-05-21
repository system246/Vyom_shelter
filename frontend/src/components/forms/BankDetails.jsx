import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputField from '../ui/InputField';
import FileUpload from '../ui/FileUpload';
import { bankSchema } from '../../utils/validations';

function MaskedField({ label, value, hint }) {
  const [show, setShow] = useState(false);
  const masked = value ? '•'.repeat(Math.max(0, value.length - 4)) + value.slice(-4) : '—';
  return (
    <div className="mb-4">
      <label className="label-base">{label}</label>
      <div className="relative">
        <input type="text" readOnly value={show ? (value || '—') : masked} className="input-base pr-10 bg-gray-50 cursor-default" />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function BankDetails({ data, onNext, onPrev }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: data || {},
  });
  const [bankDoc, setBankDoc] = useState(data?.bankDocument || null);

  const accountNumber = watch('accountNumber') || '';
  const ifscCode      = watch('ifscCode')      || '';

  const onSubmit = (formData) => onNext({ ...formData, bankDocument: bankDoc });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Landmark size={15} /> Bank Account Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField label="Bank Name" required placeholder="e.g. State Bank of India" error={errors.bankName?.message} {...register('bankName')} />
          <InputField label="Branch Name" required placeholder="e.g. Connaught Place, Delhi" error={errors.branch?.message} {...register('branch')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField label="IFSC Code" required type="text" maxLength={11} placeholder="e.g. SBIN0001234" hint="11-character IFSC code" error={errors.ifscCode?.message} style={{ textTransform: 'uppercase' }} {...register('ifscCode')} />
          <MaskedField label="IFSC Confirmation" value={ifscCode.toUpperCase()} hint="Masked preview of IFSC" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField label="Account Number" required type="text" maxLength={18} placeholder="9–18 digit account number" error={errors.accountNumber?.message} {...register('accountNumber')} />
          <MaskedField label="Account Confirmation" value={accountNumber} hint="Last 4 digits visible" />
        </div>

        <FileUpload
          label="Passbook / Cancelled Cheque"
          value={bankDoc}
          onChange={setBankDoc}
          accept="image/*,.pdf"
          hint="Upload passbook front page or cancelled cheque"
        />

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
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
