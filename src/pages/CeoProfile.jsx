import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, Lock, ChevronRight, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

const CeoProfile = () => {
  const { user: authUser, changePassword } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPwSection, setShowPwSection] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await client.get('/auth/me');
        setProfile(res.data.user);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErrors({});
    setPwSuccess('');

    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Required';
    if (!pwForm.newPassword) errs.newPassword = 'Required';
    else if (pwForm.newPassword.length < 8) errs.newPassword = 'Min 8 characters';
    else if (!/[A-Z]/.test(pwForm.newPassword)) errs.newPassword = 'Must contain uppercase letter';
    else if (!/[0-9]/.test(pwForm.newPassword)) errs.newPassword = 'Must contain a number';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwLoading(true);
    const result = await changePassword(pwForm.currentPassword, pwForm.newPassword);
    if (result.success) {
      setPwSuccess('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPwSection(false), 2000);
    } else {
      setPwErrors({ form: result.error || 'Failed to change password' });
    }
    setPwLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading profile...</p>
    </div>
  );

  const spoc = profile?.spoc;
  const isAdmin = authUser?.role === 'ADMIN';

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Account</p>
        <h1 className="text-5xl font-serif text-[#2a0b38]">My Profile</h1>
      </section>

      {/* Profile card */}
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-8">

          {/* Photo */}
          <div className="shrink-0">
            {profile?.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-2xl font-bold ring-4 ring-white shadow-md">
                {profile?.initials}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-5">
            <div>
              <h2 className="text-3xl font-serif text-[#2a0b38]">{profile?.name}</h2>
              <p className="text-[#EDA300] text-[11px] font-bold uppercase tracking-widest mt-1">{profile?.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-300 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Email</p>
                  <p className="text-sm text-gray-700">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-300 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Member Since</p>
                  <p className="text-sm text-gray-700">{memberSince}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-300 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Role</p>
                  <p className="text-sm text-gray-700">{profile?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2">
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-300 fill-current">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">LinkedIn URL</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={profile?.linkedin_url || ''}
                      onChange={e => setProfile(p => ({ ...p, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourname"
                      className="text-sm text-gray-700 bg-transparent border-b border-gray-100 outline-none focus:border-[#2a0b38] w-full py-1 transition-colors"
                    />
                    <button
                      onClick={async () => {
                        try {
                          await client.patch('/auth/linkedin', { linkedin_url: profile?.linkedin_url || '' });
                          alert('LinkedIn URL saved!');
                        } catch (err) {
                          alert('Failed to save');
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#2a0b38] hover:bg-[#1a0525] px-3 py-1.5 rounded-sm transition-all shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Change password toggle */}
            <div className="pt-2">
              <button
                onClick={() => { setShowPwSection(p => !p); setPwErrors({}); setPwSuccess(''); }}
                className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#2a0b38] transition-colors"
              >
                <Shield className="w-4 h-4" />
                {showPwSection ? 'Cancel' : 'Change Password'}
              </button>

              {showPwSection && (
                <div className="mt-6 pt-6 border-t border-gray-50">
                  {pwSuccess && (
                    <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-sm">
                      <p className="text-[12px] text-emerald-700">{pwSuccess}</p>
                    </div>
                  )}
                  {pwErrors.form && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
                      <p className="text-[12px] text-red-600">{pwErrors.form}</p>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm" noValidate>
                    {[
                      { key: 'currentPassword', label: 'Current Password' },
                      { key: 'newPassword',     label: 'New Password' },
                      { key: 'confirmPassword', label: 'Confirm New Password' },
                    ].map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                          {field.label}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            type="password"
                            value={pwForm[field.key]}
                            onChange={e => {
                              setPwForm(p => ({ ...p, [field.key]: e.target.value }));
                              setPwErrors(p => ({ ...p, [field.key]: null }));
                            }}
                            className={`block w-full pl-11 pr-4 py-3 border rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 ${
                              pwErrors[field.key] ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'
                            }`}
                          />
                        </div>
                        {pwErrors[field.key] && (
                          <p className="text-[11px] text-red-500">{pwErrors[field.key]}</p>
                        )}
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-300">Min 8 chars · 1 uppercase · 1 number</p>
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      {pwLoading ? 'Updating...' : 'Update Password'}
                      <ChevronRight className="w-4 h-4 text-[#EDA300]" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SPOC section — only show for CEO */}
      {!isAdmin && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Dedicated Contact</p>
            <h3 className="font-serif text-2xl text-[#2a0b38]">Your SPOC</h3>
            <p className="text-[12px] text-gray-400 mt-1">Single Point of Contact assigned to assist you.</p>
          </div>

          {spoc ? (
            <div className="flex items-start gap-6 p-6 bg-[#FAFAFA] border border-gray-100 rounded-xl">
              <div className="shrink-0">
                {spoc.photo_url ? (
                  <img
                    src={spoc.photo_url}
                    alt={spoc.name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-sm"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-xl font-bold">
                    {spoc.name?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-xl font-serif text-[#2a0b38]">{spoc.name}</h4>
                  <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest">{spoc.title}</p>
                </div>

                <div className="space-y-2">
                  {spoc.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="text-sm text-gray-600">{spoc.email}</span>
                    </div>
                  )}
                  {spoc.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="text-sm text-gray-600">{spoc.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {spoc.email && (
                    <a
                      href={`mailto:${spoc.email}`}
                      className="bg-[#2a0b38] hover:bg-[#1a0525] text-white px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Mail className="w-3 h-3" />
                      Send Email
                    </a>
                  )}
                  {spoc.phone && (
                    <a
                      href={`tel:${spoc.phone}`}
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                  )}
                  {spoc.phone && (
                    <a
                      href={`https://wa.me/${spoc.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-[#FAFAFA] border border-gray-100 rounded-xl text-center">
              <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No SPOC assigned yet.</p>
              <p className="text-[12px] text-gray-300 mt-1">Contact info@et.edage.com for assistance.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CeoProfile;