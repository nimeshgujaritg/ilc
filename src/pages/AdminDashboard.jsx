import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Upload, CheckCircle, XCircle, Clock, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import client from '../api/client';

// Teaching: We use a tab state to switch between 3 sections.
// All data fetching happens in this one component — cleaner than 3 separate pages
// since they all share the same admin context.

const STATUS_BADGE = {
  APPROVED: 'bg-emerald-50 text-emerald-600',
  SUBMITTED: 'bg-amber-50 text-amber-600',
  PENDING:   'bg-gray-100 text-gray-500',
};

const STATUS_LABEL = {
  APPROVED: 'Approved',
  SUBMITTED: 'Awaiting Review',
  PENDING:   'Pending',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('members');

  // ── Members tab state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores id of user being actioned

  // ── Add member tab state
  const [form, setForm] = useState({ name: '', email: '', title: '', role: 'CEO' });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  // ── Bulk upload tab state
  const [bulkRows, setBulkRows] = useState([]);       // parsed Excel rows
  const [bulkErrors, setBulkErrors] = useState([]);   // per-row validation errors
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null); // response from server
  const fileInputRef = useRef(null);

  // ─────────────────────────────────────────────
  // FETCH USERS (runs on mount and after any mutation)
  // ─────────────────────────────────────────────
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await client.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ─────────────────────────────────────────────
  // APPROVE / REJECT
  // ─────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await client.patch(`/admin/users/${id}/approve`);
      await fetchUsers(); // refresh list
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

  // ─────────────────────────────────────────────
  // ADD SINGLE MEMBER
  // ─────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setFormLoading(true);
    setFormSuccess('');
    setFormErrors({});
    try {
      const res = await client.post('/admin/users', form);
      setFormSuccess(`✓ ${res.data.user.name} created. Welcome email sent to ${res.data.user.email}`);
      setForm({ name: '', email: '', title: '', role: 'CEO' });
      fetchUsers(); // refresh member count
    } catch (err) {
      setFormErrors({ form: err.response?.data?.error || 'Failed to create user' });
    } finally {
      setFormLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // BULK UPLOAD — parse Excel
  // ─────────────────────────────────────────────
  // Teaching: We use the 'xlsx' library (SheetJS) to read Excel files in the browser.
  // FileReader reads the file as an ArrayBuffer → xlsx parses it → we get JSON rows.
  // Expected columns: Name, Email, Title, Role (case-insensitive)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkResult(null);
    setBulkErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: 'arraybuffer' });
        const ws = wb.Sheets[wb.SheetNames[0]]; // first sheet
        const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        // Normalize column names to lowercase
        // Teaching: Excel users often capitalize differently — we normalize so
        // "Email" "email" "EMAIL" all work the same
        const rows = rawRows.map((row, idx) => {
          const normalized = {};
          Object.keys(row).forEach(k => { normalized[k.toLowerCase().trim()] = row[k]; });
          return {
            _rowNum: idx + 2, // Excel row number (1=header, so data starts at 2)
            name:  String(normalized.name  || '').trim(),
            email: String(normalized.email || '').trim().toLowerCase(),
            title: String(normalized.title || '').trim(),
            role:  String(normalized.role  || 'CEO').trim().toUpperCase(),
          };
        });

        // Validate each row
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
    if (bulkErrors.length > 0) return;
    if (bulkRows.length === 0) return;
    if (!window.confirm(`Create ${bulkRows.length} users? Welcome emails will be sent to each.`)) return;

    setBulkLoading(true);
    setBulkResult(null);
    try {
      // Send only the fields the backend needs (strip _rowNum)
      const payload = bulkRows.map(({ name, email, title, role }) => ({ name, email, title, role }));
      const res = await client.post('/admin/users/bulk', { users: payload });
      setBulkResult({ success: true, message: res.data.message, skipped: res.data.skipped });
      setBulkRows([]);
      setBulkErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchUsers();
    } catch (err) {
      setBulkResult({ success: false, message: err.response?.data?.error || 'Bulk upload failed' });
    } finally {
      setBulkLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // DERIVED VALUES
  // ─────────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pendingCount = users.filter(u => u.profile_status === 'SUBMITTED').length;
  const totalCount = users.length;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* Header */}
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Operations Overview</p>
        <h1 className="text-5xl font-serif text-[#2a0b38] mb-2">Welcome, Director.</h1>
        <p className="text-gray-500 text-sm">
          {pendingCount > 0
            ? <>You have <span className="font-bold text-[#2a0b38]">{pendingCount} pending approval{pendingCount > 1 ? 's' : ''}</span> today.</>
            : 'All profiles are up to date.'
          }
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <Users className="text-[#EDA300] mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Members</p>
          <h3 className="text-4xl font-serif text-[#2a0b38]">{totalCount}</h3>
        </div>
        <div className="bg-[#2a0b38] p-8 rounded-xl text-white shadow-xl">
          <Clock className="text-[#EDA300] mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-[#EDA300] font-bold mb-1">Awaiting Review</p>
          <h3 className="text-4xl font-serif">{pendingCount}</h3>
        </div>
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <CheckCircle className="text-[#EDA300] mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Approved</p>
          <h3 className="text-4xl font-serif text-[#2a0b38]">
            {users.filter(u => u.profile_status === 'APPROVED').length}
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex gap-8">
          {[
            { id: 'members',     label: 'Members' },
            { id: 'add-member',  label: 'Add Member' },
            { id: 'bulk-upload', label: 'Bulk Upload' },
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

      {/* ── TAB: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {/* Search */}
          <div className="p-6 border-b border-gray-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
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
            <span className="ml-auto text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {usersLoading ? (
            <div className="p-16 text-center text-gray-400 text-sm">Loading members...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-gray-400 text-sm">No members found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <tr>
                  <th className="px-8 py-4">Member</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Joined</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
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
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      {u.profile_status === 'SUBMITTED' && (
                        <div className="flex gap-2">
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
                        </div>
                      )}
                      {u.profile_status === 'PENDING' && (
  <button
    onClick={async () => {
      await client.patch(`/admin/users/${u.id}/mark-submitted`);
      fetchUsers();
    }}
    className="text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
  >
    Mark Submitted
  </button>
)}
{u.profile_status === 'APPROVED' && (
  <span className="text-[11px] text-gray-300">—</span>
)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: ADD MEMBER */}
      {activeTab === 'add-member' && (
        <div className="max-w-lg bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
          <h3 className="font-serif text-2xl text-[#2a0b38] mb-2">Add New Member</h3>
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

          <form onSubmit={handleCreateUser} className="space-y-5" noValidate>
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Full Name</label>
              <input
                type="text" value={form.name}
                onChange={e => { setForm(p => ({...p, name: e.target.value})); setFormErrors(p => ({...p, name: null})); }}
                placeholder="Ratan Tata"
                className={`block w-full px-4 py-3 border rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 ${formErrors.name ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'}`}
              />
              {formErrors.name && <p className="text-[11px] text-red-500">{formErrors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Email Address</label>
              <input
                type="email" value={form.email}
                onChange={e => { setForm(p => ({...p, email: e.target.value})); setFormErrors(p => ({...p, email: null})); }}
                placeholder="ratan@tata.com"
                className={`block w-full px-4 py-3 border rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 ${formErrors.email ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'}`}
              />
              {formErrors.email && <p className="text-[11px] text-red-500">{formErrors.email}</p>}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Title / Designation</label>
              <input
                type="text" value={form.title}
                onChange={e => { setForm(p => ({...p, title: e.target.value})); setFormErrors(p => ({...p, title: null})); }}
                placeholder="Chairman Emeritus, Tata Sons"
                className={`block w-full px-4 py-3 border rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 ${formErrors.title ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'}`}
              />
              {formErrors.title && <p className="text-[11px] text-red-500">{formErrors.title}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(p => ({...p, role: e.target.value}))}
                className="block w-full px-4 py-3 border border-gray-100 rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#2a0b38]"
              >
                <option value="CEO">CEO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button
              type="submit" disabled={formLoading}
              className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-4 rounded-sm text-[11px] font-bold tracking-[0.3em] uppercase transition-all"
            >
              {formLoading ? 'Creating...' : 'Create Member + Send Email'}
            </button>
          </form>
        </div>
      )}

      {/* ── TAB: BULK UPLOAD */}
      {activeTab === 'bulk-upload' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
            <h3 className="font-serif text-2xl text-[#2a0b38] mb-2">Bulk Upload Members</h3>
            <p className="text-[12px] text-gray-400 mb-2">
              Upload an Excel file (.xlsx). Required columns:
            </p>
            <p className="text-[11px] font-mono bg-gray-50 border border-gray-100 px-4 py-2 rounded-sm text-gray-500 mb-8">
              Name | Email | Title | Role
            </p>

            {/* File input */}
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

            {/* Preview table */}
            {bulkRows.length > 0 && bulkErrors.length === 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Preview — {bulkRows.length} row{bulkRows.length !== 1 ? 's' : ''} ready
                </p>
                <div className="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bulkRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-gray-700">{row.name}</td>
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
      )}

    </div>
  );
};

export default AdminDashboard;