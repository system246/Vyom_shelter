import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

const SelectField = forwardRef(({ label, error, required, options = [], id, className = '', ...props }, ref) => {
  const autoId = useId();
  const fieldId = id || props.name || autoId;
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="label-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`input-base ${error ? 'input-error' : ''}`}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <p id={`${fieldId}-error`} className="error-msg" role="alert">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';
export default SelectField;
