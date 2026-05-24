import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { declarationSchema } from '../../utils/validations';

export default function Declaration({ data, onNext, onPrev, onSaveDraft, saving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(declarationSchema),
    defaultValues: data || { acceptTerms: false },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><ShieldCheck size={15} /> Declaration & Terms</h3>

        <div className="prose prose-sm text-gray-600 text-sm leading-relaxed mb-6 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-4 bg-gray-50">
          <p className="font-medium text-gray-700 mb-2">Terms & Conditions</p>
          <p>I hereby declare that all information provided in this registration form is true, correct and complete to the best of my knowledge and belief. I understand that any false or misleading information may result in the rejection of my application or termination of my associateship.</p>
          <p className="mt-2">I agree to abide by the rules, regulations and code of conduct laid down by the organization. I understand that my registration is subject to verification and approval by the concerned authorities.</p>
          <p className="mt-2">I consent to the processing of my personal data including Aadhaar and PAN details as required for registration and compliance purposes under applicable laws.</p>
          <p className="mt-2">I acknowledge that I have read and understood all the terms and conditions associated with becoming an associate and agree to comply with them.</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 accent-[#1a3a5c] cursor-pointer"
            {...register('acceptTerms')}
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            I have read, understood and agree to the <strong>Terms & Conditions</strong> of the Associate Registration Program. I declare that all information provided is accurate and complete.
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="error-msg mt-2 ml-7">{errors.acceptTerms.message}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" onClick={onPrev} className="btn-secondary">← Previous</button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving}
            className="btn-ghost border border-gray-200"
          >
            {saving ? '...' : '💾'} Save Draft
          </button>
          <button type="submit" className="btn-primary">
            Review & Submit →
          </button>
        </div>
      </div>
    </form>
  );
}
