import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['', '#EF4444', '#F59E0B', '#10B981', '#059669'];

const ResetPassword = () => {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { changePassword, isLoading, user } = useAuthStore();
  const strength = getStrength(newPw);

  const validate = () => {
    const e = {};
    if (!current) e.current = 'Current password is required';
    if (!newPw) e.newPw = 'New password is required';
    else if (newPw.length < 8) e.newPw = 'Minimum 8 characters';
    else if (strength < 2) e.newPw = 'Password too weak';
    else if (newPw === current) e.newPw = 'Must differ from current password';
    if (!confirm) e.confirm = 'Please confirm your password';
    else if (confirm !== newPw) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await changePassword(current, newPw);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/pending'), 1500);
    } else {
      setErrors({ form: result.error });
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#FDFDFD] overflow-hidden font-sans">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d124d] via-[#2a0b38] to-[#1a0525]"></div>
        <div className="relative z-10 text-center space-y-4">
          <p className="text-[#EDA300] text-[10px] font-bold tracking-[0.5em] uppercase">Step 1 of 3</p>
          <h1 className="text-5xl font-serif text-white leading-tight">Secure Your<br /><span className="italic font-light">Account</span></h1>
          <div className="w-20 h-[1px] bg-[#EDA300] mx-auto"></div>
          <p className="text-gray-400 font-light text-sm max-w-xs mx-auto leading-relaxed">
            You are using a temporary password. Set a new secure password to continue.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-4xl font-serif text-[#2a0b38] mb-3">Reset Password</h2>
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#EDA300]"></div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                Secure Your Account
              </p>
            </div>
          </div>

          {/* Warning banner */}
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-sm">
            <p className="text-[12px] text-amber-700">
              ⚠ You are logged in with a temporary password. Please set a new password to continue.
            </p>
          </div>

          {success && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-sm">
              <p className="text-[12px] text-green-700">✓ Password updated. Redirecting...</p>
            </div>
          )}

          {errors.form && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-[12px] text-red-600">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Temporary Password</label>
              <input
                type="password"
                value={current}
                onChange={e => { setCurrent(e.target.value); setErrors(p => ({ ...p, current: null })); }}
                placeholder="Enter your temp password"
                className={`block w-full px-4 py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${errors.current ? 'border-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'}`}
              />
              {errors.current && <p className="text-[11px] text-red-500">{errors.current}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setErrors(p => ({ ...p, newPw: null })); }}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className={`block w-full px-4 py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${errors.newPw ? 'border-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'}`}
              />
              {newPw && (
                <div>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? COLORS[strength] : '#E5E7EB' }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] mt-1 font-medium" style={{ color: COLORS[strength] }}>
                    {LABELS[strength]}
                  </p>
                </div>
              )}
              {errors.newPw && <p className="text-[11px] text-red-500">{errors.newPw}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: null })); }}
                placeholder="Re-enter new password"
                className={`block w-full px-4 py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${errors.confirm ? 'border-red-300' : 'border-gray-100 focus:ring-[#2a0b38]'}`}
              />
              {confirm && confirm === newPw && (
                <p className="text-[11px] text-green-600">✓ Passwords match</p>
              )}
              {errors.confirm && <p className="text-[11px] text-red-500">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-5 rounded-sm text-[12px] font-bold tracking-[0.3em] uppercase transition-all duration-300"
            >
              {isLoading ? 'Updating...' : 'Set New Password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;