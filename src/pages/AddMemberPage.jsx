import React, { useState } from 'react';
import client from '../api/client';

const AddMemberPage = () => {
  const [form, setForm] = useState({ name: '', email: '', title: '', role: 'CEO' });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

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
      const res = await client.post('/admin/users', form);
      setFormSuccess(`✓ ${res.data.user.name} created. Welcome email sent to ${res.data.user.email}`);
      setForm({ name: '', email: '', title: '', role: 'CEO' });
    } catch (err) {
      setFormErrors({ form: err.response?.data?.error || 'Failed to create user' });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Member Management</p>
        <h1 className="text-5xl font-serif text-[#2a0b38]">Add Member</h1>
      </section>

      <div className="max-w-lg bg-white border border-gray-100 rounded-xl p-10 shadow-sm">
        <p className="text-[12px] text-gray-400 mb-8">
          A temp password will be auto-generated and emailed to the member. They will be prompted to reset it on first login.
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
    </div>
  );
};

export default AddMemberPage;