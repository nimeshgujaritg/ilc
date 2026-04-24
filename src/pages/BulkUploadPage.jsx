import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import client from '../api/client';

const BulkUploadPage = () => {
  const [bulkRows, setBulkRows]       = useState([]);
  const [bulkErrors, setBulkErrors]   = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult]   = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkResult(null);
    setBulkErrors([]);
    setBulkRows([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: 'arraybuffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        const rows = rawRows.map((row, idx) => {
          const normalized = {};
          Object.keys(row).forEach(k => { normalized[k.toLowerCase().trim()] = row[k]; });
          return {
            _rowNum:   idx + 2,
            name:      String(normalized.name      || '').trim(),
            email:     String(normalized.email     || '').trim().toLowerCase(),
            title:     String(normalized.title     || '').trim(),
            role:      String(normalized.role      || 'CEO').trim().toUpperCase(),
            // Accepts both "Photo" and "photo_url" column headers
            photo_url: String(normalized.photo || normalized.photo_url || '').trim(),
          };
        });

        const errors = [];
        rows.forEach((row) => {
          if (!row.name)  errors.push(`Row ${row._rowNum}: Name is missing`);
          if (!row.email) errors.push(`Row ${row._rowNum}: Email is missing`);
          else if (!/\S+@\S+\.\S+/.test(row.email)) errors.push(`Row ${row._rowNum}: Invalid email`);
          if (!row.title) errors.push(`Row ${row._rowNum}: Title is missing`);
          if (!['CEO', 'ADMIN'].includes(row.role)) errors.push(`Row ${row._rowNum}: Role must be CEO or ADMIN`);
        });

        setBulkErrors(errors);
        setBulkRows(rows);
      } catch (err) {
        setBulkErrors(['Could not read file — make sure it is a valid .xlsx file']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkSubmit = async () => {
    if (bulkErrors.length > 0 || bulkRows.length === 0) return;
    if (!window.confirm(`Create ${bulkRows.length} users? Welcome emails will be sent to each.`)) return;

    setBulkLoading(true);
    setBulkResult(null);
    try {
      const payload = bulkRows.map(({ name, email, title, role, photo_url }) => ({
        name, email, title, role,
        photo_url: photo_url || null
      }));
      const res = await client.post('/admin/users/bulk', { users: payload });
      setBulkResult({ success: true, message: res.data.message, skipped: res.data.skipped });
      setBulkRows([]);
      setBulkErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setBulkResult({ success: false, message: err.response?.data?.error || 'Bulk upload failed' });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Member Management</p>
        <h1 className="text-5xl font-serif text-[#2a0b38]">Bulk Upload</h1>
      </section>

      <div className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
        <p className="text-[12px] text-gray-400 mb-2">
          Upload an Excel file (.xlsx). Required columns:
        </p>
        <p className="text-[11px] font-mono bg-gray-50 border border-gray-100 px-4 py-2 rounded-sm text-gray-500 mb-2 inline-block">
          Name &nbsp;|&nbsp; Email &nbsp;|&nbsp; Title &nbsp;|&nbsp; Role &nbsp;|&nbsp; Photo (optional)
        </p>
        <p className="text-[11px] text-gray-400 mb-8">
          Photo column should contain a full image URL. Leave blank if no photo.
        </p>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-[#2a0b38] transition-colors group"
        >
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3 group-hover:text-[#2a0b38] transition-colors" />
          <p className="text-sm text-gray-500 font-bold">Click to upload .xlsx file</p>
          <p className="text-[11px] text-gray-300 mt-1">Excel files only</p>
          <input
            type="file" accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Validation errors */}
        {bulkErrors.length > 0 && (
          <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm space-y-1">
            {bulkErrors.map((err, i) => (
              <p key={i} className="text-[12px] text-red-600">{err}</p>
            ))}
          </div>
        )}

        {/* Preview */}
        {bulkRows.length > 0 && bulkErrors.length === 0 && (
          <div className="mt-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Preview — {bulkRows.length} row{bulkRows.length !== 1 ? 's' : ''} ready
            </p>
            <div className="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bulkRows.map((row, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">
                        {row.photo_url ? (
                          <img
                            src={row.photo_url}
                            alt={row.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            {row.name?.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-700 font-medium">{row.name}</td>
                      <td className="px-4 py-2 text-gray-500">{row.email}</td>
                      <td className="px-4 py-2 text-gray-500">{row.title}</td>
                      <td className="px-4 py-2">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{row.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleBulkSubmit}
              disabled={bulkLoading}
              className="mt-6 bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white px-8 py-4 rounded-sm text-[11px] font-bold tracking-[0.3em] uppercase transition-all"
            >
              {bulkLoading ? 'Uploading...' : `Create ${bulkRows.length} Members`}
            </button>
          </div>
        )}

        {/* Result */}
        {bulkResult && (
          <div className={`mt-6 px-4 py-3 rounded-sm border ${bulkResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-[12px] font-bold ${bulkResult.success ? 'text-emerald-700' : 'text-red-600'}`}>
              {bulkResult.message}
            </p>
            {bulkResult.skipped?.length > 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                Skipped (already exist): {bulkResult.skipped.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadPage;