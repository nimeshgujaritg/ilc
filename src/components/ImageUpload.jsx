import React, { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import client from '../api/client';

const ImageUpload = ({ value, onChange, label = 'Photo' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await client.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onChange(res.data.url);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#EDA300] hover:bg-[#EDA300]/5 transition-all disabled:opacity-50 w-full"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-[#EDA300] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-400">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </span>
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