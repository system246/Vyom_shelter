import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FileCheck } from 'lucide-react';
import InputField from '../ui/InputField';
import FileUpload from '../ui/FileUpload';
import { documentSchema } from '../../utils/validations';

export default function DocumentUpload({ data, onNext, onPrev }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: data || {},
  });

  const [aadhaarFile, setAadhaarFile] = useState(data?.aadhaarFile || null);
  const [panFile, setPanFile] = useState(data?.panFile || null);
  const [fileErrors, setFileErrors] = useState({});

  const onSubmit = (formData) => {
    const errs = {};
    if (!aadhaarFile) errs.aadhaarFile = 'Aadhaar document is required';
    if (!panFile)     errs.panFile     = 'PAN document is required';
    if (Object.keys(errs).length) { setFileErrors(errs); return; }
    setFileErrors({});
    onNext({ ...formData, aadhaarFile, panFile });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-section-enter">
      {/* Aadhaar */}
      <div className="card p-6 mb-4">
        <h3 className="section-title"><FileCheck size={15} /> Aadhaar Card</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 items-start">
          <InputField
            label="Aadhaar Number" required
            type="text" maxLength={12}
            placeholder="12-digit Aadhaar"
            hint="Must be exactly 12 digits"
            error={errors.aadhaarNumber?.message}
            {...register('aadhaarNumber')}
          />
          <FileUpload
            label="Upload Aadhaar" required
            value={aadhaarFile}
            onChange={setAadhaarFile}
            accept="image/*,.pdf"
            hint="Front & back scan, max 5MB"
            error={fileErrors.aadhaarFile}
          />
        </div>
      </div>

      {/* PAN */}
      <div className="card p-6 mb-4">
        <h3 className="section-title"><FileCheck size={15} /> PAN Card</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 items-start">
          <InputField
            label="PAN Number" required
            type="text" maxLength={10}
            placeholder="e.g. ABCDE1234F"
            hint="Format: ABCDE1234F"
            error={errors.panNumber?.message}
            style={{ textTransform: 'uppercase' }}
            {...register('panNumber')}
          />
          <FileUpload
            label="Upload PAN Card" required
            value={panFile}
            onChange={setPanFile}
            accept="image/*,.pdf"
            hint="Clear scan, max 5MB"
            error={fileErrors.panFile}
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
