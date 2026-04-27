import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

const ImageUpload = ({ value, onChange, label = 'Photo' }) => {
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result); // base64 string like "data:image/jpeg;base64,..."
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange('');
    setError('');
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
        {label}
      </label>

      {value ? (
        <div className="relative w-24 h-24 group">
          <img
            src={value}
            alt="Uploaded"
            className="w-24 h-24 rounded-xl object-cover border border-gray-200"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#EDA300] hover:bg-[#EDA300]/5 transition-all w-full"
        >
          <Upload className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Click to upload image (max 2MB)</span>
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;