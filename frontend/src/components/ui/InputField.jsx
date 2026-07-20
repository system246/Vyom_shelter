import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const InputField = forwardRef(({ label, error, required, hint, className = '', ...props }, ref) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="label-base">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      ref={ref}
      className={`input-base ${error ? 'input-error' : ''}`}
      {...props}
    />
    {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && (
      <p className="error-msg">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
));

InputField.displayName = 'InputField';
export default InputField;
