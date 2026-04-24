import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, Plus, X, ChevronDown, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import client from '../api/client';

const AdminSpocs = () => {
  const [spocs, setSpocs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'create' | 'bulk'
  const [formLoading, setFormLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Single SPOC form
  const [form, setForm] = useState({ name: '', title: '', email: '', phone: '', photo_url: '' });

  // Bulk SPOC upload
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [spocsRes, usersRes] = await Promise.all([
        client.get('/admin/spocs'),
        client.get('/admin/users')
      ]);
      setSpocs(spocsRes.data.spocs);
      setUsers(usersRes.data.users.filter(u => u.role === 'CEO'));
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Create single SPOC
  const handleCreateSpoc = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setFormLoading(true);
    setError('');
    try {
      await client.post('/admin/spocs', form);
      setSuccess('SPOC created successfully');
      setForm({ name: '', title: '', email: '', phone: '', photo_url: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create SPOC');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Assign SPOC to CEO
  const handleAssignSpoc = async (userId, spocId) => {
    setAssignLoading(userId);
    setSuccess('');
    setError('');
    try {
      await client.patch(`/admin/users/${userId}/assign-spoc`, { spocId });
      setSuccess('SPOC assigned — CEO has been notified by email');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign SPOC');
    } finally {
      setAssignLoading(null);
    }
  };

  // ── Delete SPOC
  const handleDeleteSpoc = async (id) => {
    if (!window.confirm('Delete this SPOC? They will be unassigned from all CEOs.')) return;
    try {
      await client.delete(`/admin/spocs/${id}`);
      setSuccess('SPOC deleted');
      fetchData();
    } catch (err) {
      setError('Failed to delete SPOC');
    }
  };

  // ── Parse Excel for bulk SPOC upload
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
          const n = {};
          Object.keys(row).forEach(k => { n[k.toLowerCase().trim()] = row[k]; });
          return {
            _rowNum:   idx + 2,
            name:      String(n.name      || '').trim(),
            title:     String(n.title     || '').trim(),
            email:     String(n.email     || '').trim().toLowerCase(),
            phone:     String(n.phone     || '').trim(),
            photo_url: String(n.photo     || n.photo_url || '').trim(),
          };
        });

        const errors = [];
        rows.forEach(row => {
          if (!row.name) errors.push(`Row ${row._rowNum}: Name is missing`);
        });

        setBulkErrors(errors);
        setBulkRows(rows);
      } catch (err) {
        setBulkErrors(['Could not read file — make sure it is a valid .xlsx file']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Bulk create SPOCs
  const handleBulkSubmit = async () => {
    if (bulkErrors.length > 0 || bulkRows.length === 0) return;
    if (!window.confirm(`Create ${bulkRows.length} SPOCs?`)) return;

    setBulkLoading(true);
    setBulkResult(null);
    try {
      // Create each SPOC one by one
      let created = 0;
      for (const row of bulkRows) {
        await client.post('/admin/spocs', {
          name:      row.name,
          title:     row.title || null,
          email:     row.email || null,
          phone:     row.phone || null,
          photo_url: row.photo_url || null,
        });
        created++;
      }
      setBulkResult({ success: true, message: `${created} SPOCs created successfully` });
      setBulkRows([]);
      setBulkErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchData();
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
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Member Relations</p>
        <h1 className="text-5xl font-serif text-[#2a0b38]">Manage SPOCs</h1>
      </section>

      {/* Alerts */}
      {success && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-sm">
          <p className="text-[12px] text-emerald-700">{success}</p>
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-[12px] text-red-600">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex gap-8">
          {[
            { id: 'assign', label: 'Assign to CEOs' },
            { id: 'create', label: 'Add Single SPOC' },
            { id: 'bulk',   label: 'Bulk Upload SPOCs' },
            { id: 'list',   label: `All SPOCs (${spocs.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab.id
                  ? 'text-[#2a0b38] border-b-2 border-[#EDA300]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: ASSIGN */}
      {activeTab === 'assign' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-serif text-xl text-[#2a0b38]">Assign SPOCs to CEOs</h3>
            <p className="text-[12px] text-gray-400 mt-1">CEO will be notified by email when SPOC changes.</p>
          </div>

          {loading ? (
            <div className="p-16 text-center text-gray-400 text-sm">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-gray-400 text-sm">No CEO members found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <tr>
                  <th className="px-8 py-4">CEO</th>
                  <th className="px-8 py-4">Current SPOC</th>
                  <th className="px-8 py-4">Assign SPOC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => {
                  const currentSpoc = spocs.find(s => s.id === u.spoc_id);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          {u.photo_url ? (
                            <img src={u.photo_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-[10px] font-bold">
                              {u.initials}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-[#2a0b38]">{u.name}</p>
                            <p className="text-[11px] text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {currentSpoc ? (
                          <div className="flex items-center gap-2">
                            {currentSpoc.photo_url ? (
                              <img src={currentSpoc.photo_url} alt={currentSpoc.name} className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <UserCircle className="w-6 h-6 text-gray-300" />
                            )}
                            <div>
                              <p className="text-[12px] font-bold text-[#2a0b38]">{currentSpoc.name}</p>
                              <p className="text-[11px] text-gray-400">{currentSpoc.title}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300">Not assigned</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="relative inline-block">
                          <select
                            value={u.spoc_id || ''}
                            onChange={e => handleAssignSpoc(u.id, e.target.value || null)}
                            disabled={assignLoading === u.id || spocs.length === 0}
                            className="appearance-none bg-[#FAFAFA] border border-gray-100 text-sm text-gray-700 px-4 py-2 pr-8 rounded-sm outline-none focus:ring-1 focus:ring-[#2a0b38] disabled:opacity-50 cursor-pointer"
                          >
                            <option value="">— No SPOC —</option>
                            {spocs.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                        {spocs.length === 0 && (
                          <p className="text-[11px] text-amber-500 mt-1">No SPOCs created yet</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: CREATE SINGLE SPOC */}
      {activeTab === 'create' && (
        <div className="max-w-lg bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
          <h3 className="font-serif text-2xl text-[#2a0b38] mb-8">New SPOC</h3>
          <form onSubmit={handleCreateSpoc} className="space-y-4">
            {[
              { key: 'name',      label: 'Full Name',  placeholder: 'Rajesh Kumar',                  required: true },
              { key: 'title',     label: 'Title',      placeholder: 'Senior Relationship Manager' },
              { key: 'email',     label: 'Email',      placeholder: 'rajesh@ilc.in' },
              { key: 'phone',     label: 'Phone',      placeholder: '+91 98765 43210' },
              { key: 'photo_url', label: 'Photo URL',  placeholder: 'https://example.com/photo.jpg' },
            ].map(field => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text"
                  value={form[field.key]}
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="block w-full px-4 py-3 border border-gray-100 rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#2a0b38]"
                />
              </div>
            ))}
            <button
              type="submit" disabled={formLoading}
              className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              {formLoading ? 'Creating...' : 'Create SPOC'}
            </button>
          </form>
        </div>
      )}

      {/* ── TAB: BULK UPLOAD */}
      {activeTab === 'bulk' && (
        <div className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
          <h3 className="font-serif text-2xl text-[#2a0b38] mb-2">Bulk Upload SPOCs</h3>
          <p className="text-[12px] text-gray-400 mb-2">Upload an Excel file with SPOC details. Required columns:</p>
          <p className="text-[11px] font-mono bg-gray-50 border border-gray-100 px-4 py-2 rounded-sm text-gray-500 mb-8 inline-block">
            Name &nbsp;|&nbsp; Title &nbsp;|&nbsp; Email &nbsp;|&nbsp; Phone &nbsp;|&nbsp; Photo (optional)
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-[#2a0b38] transition-colors group"
          >
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3 group-hover:text-[#2a0b38] transition-colors" />
            <p className="text-sm text-gray-500 font-bold">Click to upload .xlsx file</p>
            <p className="text-[11px] text-gray-300 mt-1">Excel files only</p>
            <input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>

          {bulkErrors.length > 0 && (
            <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm space-y-1">
              {bulkErrors.map((err, i) => <p key={i} className="text-[12px] text-red-600">{err}</p>)}
            </div>
          )}

          {bulkRows.length > 0 && bulkErrors.length === 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Preview — {bulkRows.length} SPOCs ready
              </p>
              <div className="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Photo</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bulkRows.map((row, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2">
                          {row.photo_url ? (
                            <img src={row.photo_url} alt={row.name} className="w-8 h-8 rounded-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">{row.name?.charAt(0)}</div>
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-700">{row.name}</td>
                        <td className="px-4 py-2 text-gray-500">{row.title}</td>
                        <td className="px-4 py-2 text-gray-500">{row.email}</td>
                        <td className="px-4 py-2 text-gray-500">{row.phone}</td>
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
                {bulkLoading ? 'Creating...' : `Create ${bulkRows.length} SPOCs`}
              </button>
            </div>
          )}

          {bulkResult && (
            <div className={`mt-6 px-4 py-3 rounded-sm border ${bulkResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-[12px] font-bold ${bulkResult.success ? 'text-emerald-700' : 'text-red-600'}`}>
                {bulkResult.message}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ALL SPOCS */}
      {activeTab === 'list' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {spocs.length === 0 ? (
            <div className="p-16 text-center text-gray-400 text-sm">No SPOCs created yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <tr>
                  <th className="px-8 py-4">SPOC</th>
                  <th className="px-8 py-4">Contact</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {spocs.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {s.photo_url ? (
                          <img src={s.photo_url} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserCircle className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#2a0b38]">{s.name}</p>
                          <p className="text-[11px] text-gray-400">{s.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[12px] text-gray-600">{s.email}</p>
                      <p className="text-[11px] text-gray-400">{s.phone}</p>
                    </td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => handleDeleteSpoc(s.id)}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminSpocs;