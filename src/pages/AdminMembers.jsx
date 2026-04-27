import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Search, X, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import client from '../api/client';
import ImageUpload from '../components/ImageUpload';

const STATUS_BADGE = {
  APPROVED:  'bg-emerald-50 text-emerald-600',
  SUBMITTED: 'bg-amber-50 text-amber-600',
  PENDING:   'bg-gray-100 text-gray-500',
};

const STATUS_LABEL = {
  APPROVED:  'Approved',
  SUBMITTED: 'Awaiting Review',
  PENDING:   'Pending',
};

const TABS = [
  { id: 'all',   label: 'All Members' },
  { id: 'add',   label: 'Add Member' },
  { id: 'bulk',  label: 'Bulk Upload' },
];

// ─────────────────────────────────────────────
// TAB: ALL MEMBERS
// ─────────────────────────────────────────────
const AllMembersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
const [selectedIds, setSelectedIds] = useState([]);
const [bulkApproveLoading, setBulkApproveLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await client.patch(`/admin/users/${id}/approve`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this profile? User will need to re-submit.')) return;
    setActionLoading(id);
    try {
      await client.patch(`/admin/users/${id}/reject`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSubmitted = async (id) => {
    setActionLoading(id);
    try {
      await client.patch(`/admin/users/${id}/mark-submitted`);
      await fetchUsers();
    } catch (err) {
      alert('Failed to mark submitted');
    } finally {
      setActionLoading(null);
    }
  };
const submittedUsers = users.filter(u => u.profile_status === 'SUBMITTED');

const toggleSelect = (id) => {
  setSelectedIds(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
};

const toggleSelectAll = () => {
  const submittedIds = submittedUsers.map(u => u.id);
  const allSelected = submittedIds.every(id => selectedIds.includes(id));
  setSelectedIds(allSelected ? [] : submittedIds);
};

const handleBulkApprove = async () => {
  if (selectedIds.length === 0) return;
  if (!window.confirm(`Approve ${selectedIds.length} member${selectedIds.length > 1 ? 's' : ''}?`)) return;
  setBulkApproveLoading(true);
  try {
    await Promise.all(selectedIds.map(id => client.patch(`/admin/users/${id}/approve`)));
    setSelectedIds([]);
    await fetchUsers();
  } catch (err) {
    alert('Some approvals failed — please retry');
  } finally {
    setBulkApproveLoading(false);
  }
};

const handleExport = () => {
  const exportData = filteredUsers.map(u => ({
    Name:          u.name,
    Email:         u.email,
    Title:         u.title || '',
    Role:          u.role,
    Status:        STATUS_LABEL[u.profile_status],
    'Joined Date': new Date(u.created_at).toLocaleDateString('en-IN'),
  }));
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Members');
  XLSX.writeFile(wb, `ILC_Members_${new Date().toISOString().slice(0,10)}.xlsx`);
};
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-50 flex flex-wrap items-center gap-4">
  <div className="relative flex-1 min-w-[200px] max-w-sm">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
    <input
      type="text"
      placeholder="Search by name or email..."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-sm bg-[#FAFAFA] outline-none focus:ring-1 focus:ring-[#2a0b38]"
    />
  </div>
  {searchQuery && (
    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  )}
  <div className="flex items-center gap-3 ml-auto">
    {submittedUsers.length > 0 && (
      <button
        onClick={handleBulkApprove}
        disabled={selectedIds.length === 0 || bulkApproveLoading}
        className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold px-4 py-2 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-40"
      >
        <CheckCircle className="w-3 h-3" />
        {bulkApproveLoading ? 'Approving...' : `Approve Selected (${selectedIds.length})`}
      </button>
    )}
    <button
      onClick={handleExport}
      disabled={filteredUsers.length === 0}
      className="flex items-center gap-2 bg-[#1a0525] hover:bg-[#2a0b38] text-white text-[10px] font-bold px-4 py-2 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-40"
    >
      <Upload className="w-3 h-3" />
      Export Excel
    </button>
    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
      {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''}
    </span>
  </div>
</div>

      {loading ? (
        <div className="p-16 text-center text-gray-400 text-sm">Loading members...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-16 text-center text-gray-400 text-sm">No members found.</div>
      ) : (
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold">
  <tr>
    <th className="px-4 py-4">
      {submittedUsers.length > 0 && (
        <input
          type="checkbox"
          checked={submittedUsers.every(u => selectedIds.includes(u.id))}
          onChange={toggleSelectAll}
          className="w-4 h-4 accent-[#2a0b38] cursor-pointer"
        />
      )}
    </th>
    <th className="px-8 py-4">Member</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Joined</th>
              <th className="px-8 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(u.id) ? 'bg-emerald-50/30' : ''}`}>
  <td className="px-4 py-5">
    {u.profile_status === 'SUBMITTED' && (
      <input
        type="checkbox"
        checked={selectedIds.includes(u.id)}
        onChange={() => toggleSelect(u.id)}
        className="w-4 h-4 accent-[#2a0b38] cursor-pointer"
      />
    )}
  </td>
  <td className="px-8 py-5">
    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {u.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2a0b38]">{u.name}</p>
                      <p className="text-[11px] text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{u.role}</span>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${STATUS_BADGE[u.profile_status]}`}>
                    {STATUS_LABEL[u.profile_status]}
                  </span>
                </td>
                <td className="px-8 py-5 text-[11px] text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td className="px-8 py-5">
                  <div className="flex gap-2">
                    {u.profile_status === 'SUBMITTED' && (
                      <>
                        <button
                          onClick={() => handleApprove(u.id)}
                          disabled={actionLoading === u.id}
                          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {actionLoading === u.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(u.id)}
                          disabled={actionLoading === u.id}
                          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}
                    {/* DEV ONLY — remove after Phase 6 */}
                    {u.profile_status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkSubmitted(u.id)}
                        disabled={actionLoading === u.id}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === u.id ? '...' : 'Mark Submitted'}
                      </button>
                    )}
                    {u.profile_status === 'APPROVED' && (
                      <span className="text-[11px] text-gray-300">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB: ADD MEMBER
// ─────────────────────────────────────────────
const AddMemberTab = () => {
  const [form, setForm] = useState({
    name: '', email: '', title: '', role: 'CEO',
    phone: '', photo_url: '', spoc_id: ''
  });
  const [spocs, setSpocs] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    client.get('/admin/spocs').then(res => setSpocs(res.data.spocs)).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setFormLoading(true);
    setFormSuccess('');
    setFormErrors({});

    try {
      const res = await client.post('/admin/users', {
        ...form,
        spoc_id: form.spoc_id || null,
        phone: form.phone || null,
        photo_url: form.photo_url || null,
      });
      setFormSuccess(`✓ ${res.data.user.name} created. Welcome email sent to ${res.data.user.email}`);
      setForm({ name: '', email: '', title: '', role: 'CEO', phone: '', photo_url: '', spoc_id: '' });
    } catch (err) {
      setFormErrors({ form: err.response?.data?.error || 'Failed to create user' });
    } finally {
      setFormLoading(false);
    }
  };

  const inputBase = (hasError) =>
    `block w-full px-4 py-3 border rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 ${
      hasError ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'
    }`;

  return (
    <div className="max-w-lg bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
      <p className="text-[12px] text-gray-400 mb-8">
        A temp password will be auto-generated and emailed to the member.
      </p>

      {formSuccess && (
        <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-sm">
          <p className="text-[12px] text-emerald-700">{formSuccess}</p>
        </div>
      )}
      {formErrors.form && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-[12px] text-red-600">{formErrors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <ImageUpload
          value={form.photo_url}
          onChange={url => setForm(p => ({ ...p, photo_url: url }))}
          label="Member Photo"
        />

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Full Name *</label>
          <input
            type="text" value={form.name}
            onChange={e => { setForm(p => ({...p, name: e.target.value})); setFormErrors(p => ({...p, name: null})); }}
            placeholder="Ratan Tata"
            className={inputBase(formErrors.name)}
          />
          {formErrors.name && <p className="text-[11px] text-red-500">{formErrors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Email Address *</label>
          <input
            type="email" value={form.email}
            onChange={e => { setForm(p => ({...p, email: e.target.value})); setFormErrors(p => ({...p, email: null})); }}
            placeholder="ratan@tata.com"
            className={inputBase(formErrors.email)}
          />
          {formErrors.email && <p className="text-[11px] text-red-500">{formErrors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Title / Designation *</label>
          <input
            type="text" value={form.title}
            onChange={e => { setForm(p => ({...p, title: e.target.value})); setFormErrors(p => ({...p, title: null})); }}
            placeholder="Chairman Emeritus, Tata Sons"
            className={inputBase(formErrors.title)}
          />
          {formErrors.title && <p className="text-[11px] text-red-500">{formErrors.title}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Phone Number</label>
          <input
            type="text" value={form.phone}
            onChange={e => setForm(p => ({...p, phone: e.target.value}))}
            placeholder="+91 98765 43210"
            className={inputBase(false)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Role</label>
          <select
            value={form.role}
            onChange={e => setForm(p => ({...p, role: e.target.value}))}
            className={inputBase(false)}
          >
            <option value="CEO">CEO</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {form.role === 'CEO' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Assign SPOC</label>
            <select
              value={form.spoc_id}
              onChange={e => setForm(p => ({...p, spoc_id: e.target.value}))}
              className={inputBase(false)}
            >
              <option value="">— No SPOC —</option>
              {spocs.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.title ? `— ${s.title}` : ''}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit" disabled={formLoading}
          className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-4 rounded-sm text-[11px] font-bold tracking-[0.3em] uppercase transition-all"
        >
          {formLoading ? 'Creating...' : 'Create Member + Send Email'}
        </button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB: BULK UPLOAD
// ─────────────────────────────────────────────
const BulkUploadTab = () => {
  const [bulkRows, setBulkRows]       = useState([]);
  const [bulkErrors, setBulkErrors]   = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult]   = useState(null);
  const [spocs, setSpocs]             = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    client.get('/admin/spocs').then(res => setSpocs(res.data.spocs)).catch(() => {});
  }, []);

  const findSpocByEmail = (email) => {
    if (!email) return null;
    return spocs.find(s => s.email?.toLowerCase().trim() === email.toLowerCase().trim()) || null;
  };

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
          Object.keys(row).forEach(k => { n[k.toLowerCase().trim().replace(/\s+/g, '_')] = row[k]; });

          const spocEmail = String(n.spoc_email || n.spoc || '').trim().toLowerCase();
          const matchedSpoc = findSpocByEmail(spocEmail);

          return {
            _rowNum:    idx + 2,
            name:       String(n.name      || '').trim(),
            email:      String(n.email     || '').trim().toLowerCase(),
            title:      String(n.title     || '').trim(),
            role:       String(n.role      || 'CEO').trim().toUpperCase(),
            phone:      String(n.phone     || '').trim(),
            photo_url:  String(n.photo || n.photo_url || '').trim(),
            spoc_email: spocEmail,
            spoc_id:    matchedSpoc?.id || null,
            spoc_name:  matchedSpoc?.name || null,
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
    if (!window.confirm(`Create ${bulkRows.length} members? Welcome emails will be sent to each.`)) return;

    setBulkLoading(true);
    setBulkResult(null);
    try {
      const payload = bulkRows.map(({ name, email, title, role, photo_url, phone, spoc_id }) => ({
        name, email, title, role,
        photo_url: photo_url || null,
        phone: phone || null,
        spoc_id: spoc_id || null,
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

  const matchedCount = bulkRows.filter(r => r.spoc_id).length;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
      <p className="text-[12px] text-gray-400 mb-2">Upload an Excel file (.xlsx). Columns:</p>
      <p className="text-[11px] font-mono bg-gray-50 border border-gray-100 px-4 py-2 rounded-sm text-gray-500 mb-2 inline-block">
        Name | Email | Title | Role | Phone | Photo | SPOC Email
      </p>
      <p className="text-[11px] text-gray-400 mb-8">
        Add <strong>SPOC Email</strong> column to auto-link CEOs to their SPOC. Make sure SPOCs are created first.
      </p>

      {spocs.length > 0 ? (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-[12px] text-emerald-700">{spocs.length} SPOCs loaded — auto-linking ready</p>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-[12px] text-amber-700">No SPOCs found — create SPOCs first to enable auto-linking</p>
        </div>
      )}

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
          {bulkErrors.map((err, i) => (
            <p key={i} className="text-[12px] text-red-600">{err}</p>
          ))}
        </div>
      )}

      {bulkRows.length > 0 && bulkErrors.length === 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Preview — {bulkRows.length} members ready
            </p>
            {matchedCount > 0 && (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full">
                {matchedCount} SPOCs auto-matched
              </span>
            )}
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold sticky top-0">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">SPOC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bulkRows.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">
                      {row.photo_url ? (
                        <img src={row.photo_url} alt={row.name} className="w-8 h-8 rounded-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">
                          {row.name?.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-700 font-medium">{row.name}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{row.email}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{row.title}</td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{row.role}</span>
                    </td>
                    <td className="px-4 py-2">
                      {row.spoc_name ? (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{row.spoc_name}</span>
                      ) : row.spoc_email ? (
                        <span className="text-[10px] font-bold bg-red-50 text-red-400 px-2 py-0.5 rounded-full">Not found</span>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
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
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminMembers = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Member Management</p>
        <h1 className="text-5xl font-serif text-[#2a0b38]">Members</h1>
      </section>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex gap-8">
          {TABS.map(tab => (
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

      {activeTab === 'all'  && <AllMembersTab />}
      {activeTab === 'add'  && <AddMemberTab />}
      {activeTab === 'bulk' && <BulkUploadTab />}

    </div>
  );
};

export default AdminMembers;