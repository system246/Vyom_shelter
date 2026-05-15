import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const SelectField = forwardRef(({ label, error, required, options = [], className = '', ...props }, ref) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="label-base">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={`input-base ${error ? 'input-error' : ''}`}
      {...props}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && (
      <p className="error-msg">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
));

SelectField.displayName = 'SelectField';
export default SelectField;
