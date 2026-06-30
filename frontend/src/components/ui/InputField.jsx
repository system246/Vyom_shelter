import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

const InputField = forwardRef(({ label, error, required, hint, id, className = '', ...props }, ref) => {
  const autoId = useId();
  const fieldId = id || props.name || autoId;
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="label-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={`input-base ${error ? 'input-error' : ''}`}
        {...props}
      />
      {hint && !error && <p id={`${fieldId}-hint`} className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && (
        <p id={`${fieldId}-error`} className="error-msg" role="alert">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;
