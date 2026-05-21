import { useRef, useState } from 'react';
import { Upload, X, FileText, Crop } from 'lucide-react';
import ImageCropper from './ImageCropper';

export default function FileUpload({ label, required, value, onChange, accept = 'image/*,.pdf', error, hint }) {
  const inputRef  = useRef();
  const [dragging, setDragging]     = useState(false);
  const [cropFile, setCropFile]     = useState(null); // file pending crop

  const handleFile = (file) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setCropFile(file); // open cropper for images
    } else {
      onChange(file); // PDFs go straight through
    }
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
  const sizeKB = value ? (value.size / 1024).toFixed(1) : 0;
  const sizeMB = value ? (value.size / (1024*1024)).toFixed(2) : 0;

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
          <p className="text-xs text-gray-400 mt-1">{hint || 'PNG, JPG up to 5MB · Will be cropped & compressed'}</p>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
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
            <p className="text-xs text-gray-500 mt-0.5">
              {sizeKB < 1024 ? `${sizeKB} KB` : `${sizeMB} MB`}
              {isImage && <span className="ml-2 text-green-600 font-medium">✓ Compressed</span>}
            </p>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Crop size={11} /> Recrop
              </button>
            </div>
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          <button type="button" onClick={remove} className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Cropper modal */}
      {cropFile && (
        <ImageCropper
          file={cropFile}
          onDone={(croppedFile) => { setCropFile(null); onChange(croppedFile); }}
          onCancel={() => { setCropFile(null); if (inputRef.current) inputRef.current.value = ''; }}
          aspectRatio={4/3}
        />
      )}
    </div>
  );
}
