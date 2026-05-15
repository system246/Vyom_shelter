import { useRef, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

export default function FileUpload({ label, required, value, onChange, accept = 'image/*,.pdf', error, hint }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const remove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = value && value.type?.startsWith('image/');
  const previewUrl = value && isImage ? URL.createObjectURL(value) : null;

  return (
    <div className="mb-4">
      {label && (
        <label className="label-base">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {!value ? (
        <div
          className={`drop-zone cursor-pointer p-6 text-center ${dragging ? 'dragging' : ''} ${error ? 'border-red-400' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 font-medium">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-400 mt-1">{hint || 'PNG, JPG, PDF up to 5MB'}</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="border border-green-200 bg-green-50 rounded-lg p-3 flex items-center gap-3">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-14 h-14 object-cover rounded-md border border-gray-200" />
          ) : (
            <div className="w-14 h-14 bg-blue-100 rounded-md flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{value.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{(value.size / 1024).toFixed(1)} KB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Change file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
          <button
            type="button"
            onClick={remove}
            className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p className="error-msg mt-1">
          <span className="text-red-500 text-xs">{error}</span>
        </p>
      )}
    </div>
  );
}
