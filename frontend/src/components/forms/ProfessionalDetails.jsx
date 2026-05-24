import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase } from 'lucide-react';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import { professionalSchema } from '../../utils/validations';
import { EDUCATION_OPTIONS, RELATION_OPTIONS } from '../../utils/constants';

export default function ProfessionalDetails({ data, onNext, onPrev }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(professionalSchema),
    defaultValues: data || {},
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="form-section-enter">
      <div className="card p-6 mb-4">
        <h3 className="section-title"><Briefcase size={15} /> Professional Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField
            label="Profession" required
            placeholder="e.g. Teacher, Farmer, Businessman"
            error={errors.profession?.message}
            {...register('profession')}
          />
          <SelectField
            label="Education Qualification" required
            options={EDUCATION_OPTIONS}
            error={errors.education?.message}
            {...register('education')}
          />
        </div>
      </div>

      <div className="card p-6 mb-4">
        <h3 className="section-title">Nominee Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField
            label="Nominee Name" required
            placeholder="Full name of nominee"
            error={errors.nomineeName?.message}
            {...register('nomineeName')}
          />
          <SelectField
            label="Relation with Nominee" required
            options={RELATION_OPTIONS}
            error={errors.nomineeRelation?.message}
            {...register('nomineeRelation')}
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
