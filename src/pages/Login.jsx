import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ChevronRight, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Password strength checker
// Returns { score: 0-4, label, color }
const getPasswordStrength = (password) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak',      color: '#ef4444', width: '25%' };
  if (score === 2) return { score, label: 'Fair',      color: '#f59e0b', width: '50%' };
  if (score === 3) return { score, label: 'Good',      color: '#3b82f6', width: '75%' };
  return             { score, label: 'Strong',     color: '#10b981', width: '100%' };
};

const Login = () => {
  const [currentView, setCurrentView] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState('');

  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimerRef = useRef(null);

  const navigate = useNavigate();
  const { login, requestOtp, verifyOtp, isLoading, sessionExpired, clearSessionExpired } = useAuthStore();

  // Cleanup
  useEffect(() => {
    return () => { if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current); };
  }, []);

  // Reset shake on view change
  useEffect(() => {
    setIsShaking(false);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
  }, [currentView]);

  const shake = () => {
    setIsShaking(false);
    requestAnimationFrame(() => {
      setIsShaking(true);
      shakeTimerRef.current = setTimeout(() => setIsShaking(false), 500);
    });
  };

  const goToForgot = () => {
    setErrors({});
    setForgotEmail(email.trim());
    setCurrentView('forgot');
  };

  const goToLogin = () => {
    setErrors({});
    setOtp('');
    setNewPassword('');
    setCurrentView('login');
  };

  const goBackToForgot = () => {
    setErrors({});
    setOtp('');
    setNewPassword('');
    setCurrentView('forgot');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    if (sessionExpired) clearSessionExpired();

    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password.trim()) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await login(email, password);
    if (result.success) {
      const { user } = result;
      if (user.isFirstLogin) return navigate('/reset-password');
      if (user.profileStatus !== 'APPROVED') return navigate('/pending');
      return navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
    } else {
      setErrors({ form: result.error });
      shake();
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrors({});
    const trimmed = forgotEmail.trim();
    if (!trimmed) { setErrors({ forgotEmail: 'Email is required' }); return; }
    if (!/\S+@\S+\.\S+/.test(trimmed)) { setErrors({ forgotEmail: 'Enter a valid email' }); return; }

    const result = await requestOtp(trimmed);
    if (result.success) {
      setOtpSentTo(trimmed);
      setOtp('');
      setNewPassword('');
      setErrors({});
      setCurrentView('otp');
    } else {
      setErrors({ form: result.error });
      shake();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    const errs = {};
    const cleanOtp = otp.replace(/\D/g, '');
    if (!cleanOtp) errs.otp = 'OTP is required';
    else if (cleanOtp.length !== 6) errs.otp = 'OTP must be 6 digits';
    if (!newPassword.trim()) errs.newPassword = 'New password is required';
    else if (newPassword.length < 8) errs.newPassword = 'Min 8 characters';
    else if (!/[A-Z]/.test(newPassword)) errs.newPassword = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(newPassword)) errs.newPassword = 'Must contain a number';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await verifyOtp(otpSentTo, cleanOtp, newPassword);
    if (result.success) {
      const { user } = result;
      if (user.profileStatus !== 'APPROVED') return navigate('/pending');
      return navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
    } else {
      setErrors({ form: result.error });
      shake();
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
    setErrors(p => ({ ...p, otp: null, form: null }));
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp(pasted);
    setErrors(p => ({ ...p, otp: null, form: null }));
  };

  const inputClass = (hasError) =>
    `block w-full py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${
      hasError ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38] focus:border-[#2a0b38]'
    }`;

  const pwStrength = getPasswordStrength(newPassword);

  return (
    <div className="h-screen w-full flex bg-[#FDFDFD] overflow-hidden font-sans">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d124d] via-[#2a0b38] to-[#1a0525]" />
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, #ffffff 20px, #ffffff 21px)' }}
        />
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xl space-y-4">

<img
  src="https://www.indialeadershipcouncil.com/wp-content/uploads/2026/04/ilc-faciliting.png"
  alt="India Leadership Council"
  className="w-72"
/>
<div className="w-20 h-[1px] bg-[#EDA300] mx-auto" />
<p className="text-gray-400 font-light text-base max-w-sm mx-auto leading-relaxed">
  An exclusive sanctuary for visionaries shaping the future of global enterprise.
</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-300">Portal v2.4</span>
          <div className="h-[1px] w-6 bg-[#EDA300]" />
        </div>

        {/* ── VIEW: LOGIN */}
        {currentView === 'login' && (
          <div
            className="w-full max-w-[420px]"
            style={{ animation: isShaking ? 'shake 0.4s ease' : undefined }}
          >
            <div className="mb-10">
              <h2 className="text-5xl font-serif text-[#2a0b38] mb-4">Welcome</h2>
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#EDA300]" />
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Identity Authentication</p>
              </div>
            </div>

            {/* Session expired banner */}
            {sessionExpired && (
              <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 font-medium">
                  Your session has expired. Please log in again to continue.
                </p>
              </div>
            )}

            {errors.form && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-[12px] text-red-600">{errors.form}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null, form: null })); }}
                    placeholder="executive@council.in"
                    className={`${inputClass(errors.email)} pl-11 pr-4`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Password</label>
                  <button
                    type="button"
                    onClick={goToForgot}
                    className="text-[10px] text-gray-400 hover:text-[#2a0b38] font-bold tracking-widest transition-colors"
                  >
                    FORGOT?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: null, form: null })); }}
                    placeholder="••••••••••••"
                    className={`${inputClass(errors.password)} pl-11 pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold uppercase tracking-wider"
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-5 rounded-sm flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.3em] uppercase transition-all duration-300"
              >
                {isLoading ? 'Authenticating...' : 'Enter Portal'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            </form>

            
          </div>
        )}

        {/* ── VIEW: FORGOT */}
        {currentView === 'forgot' && (
          <div
            className="w-full max-w-[420px]"
            style={{ animation: isShaking ? 'shake 0.4s ease' : undefined }}
          >
            <button onClick={goToLogin} className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-[#2a0b38] font-bold tracking-widest uppercase mb-10 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </button>

            <div className="mb-10">
              <h2 className="text-5xl font-serif text-[#2a0b38] mb-4">Reset</h2>
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#EDA300]" />
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Password Recovery</p>
              </div>
              <p className="text-[12px] text-gray-500 mt-4 leading-relaxed">
                Enter your registered email. We'll send a 6-digit OTP valid for 10 minutes.
              </p>
            </div>

            {errors.form && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-[12px] text-red-600">{errors.form}</p>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); setErrors(p => ({ ...p, forgotEmail: null, form: null })); }}
                    placeholder="executive@council.in"
                    autoFocus
                    className={`${inputClass(errors.forgotEmail)} pl-11 pr-4`}
                  />
                </div>
                {errors.forgotEmail && <p className="text-[11px] text-red-500">{errors.forgotEmail}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-5 rounded-sm flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.3em] uppercase transition-all duration-300"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            </form>
          </div>
        )}

        {/* ── VIEW: OTP */}
        {currentView === 'otp' && (
          <div
            className="w-full max-w-[420px]"
            style={{ animation: isShaking ? 'shake 0.4s ease' : undefined }}
          >
            <button onClick={goBackToForgot} className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-[#2a0b38] font-bold tracking-widest uppercase mb-10 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Change Email
            </button>

            <div className="mb-10">
              <h2 className="text-5xl font-serif text-[#2a0b38] mb-4">Verify</h2>
              <div className="flex items-center gap-3">
                <div className="w-1 h-4 bg-[#EDA300]" />
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">OTP Verification</p>
              </div>
              <p className="text-[12px] text-gray-500 mt-4 leading-relaxed">
                OTP sent to <span className="text-[#2a0b38] font-semibold">{otpSentTo}</span>. Check your inbox.
              </p>
            </div>

            {errors.form && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-[12px] text-red-600">{errors.form}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={handleOtpChange}
                    onPaste={handleOtpPaste}
                    maxLength={6}
                    placeholder="283741"
                    autoFocus
                    className={`${inputClass(errors.otp)} pl-11 pr-4 tracking-[0.5em] font-mono`}
                  />
                </div>
                {errors.otp && <p className="text-[11px] text-red-500">{errors.otp}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setErrors(p => ({ ...p, newPassword: null, form: null })); }}
                    placeholder="••••••••••••"
                    className={`${inputClass(errors.newPassword)} pl-11 pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold uppercase tracking-wider"
                  >
                    {showNewPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.newPassword && <p className="text-[11px] text-red-500">{errors.newPassword}</p>}

                {/* Password strength indicator */}
                {newPassword && pwStrength && (
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: pwStrength.width, background: pwStrength.color }}
                      />
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </p>
                  </div>
                )}

                {!newPassword && (
                  <p className="text-[10px] text-gray-400">Min 8 chars · 1 uppercase · 1 number</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white py-5 rounded-sm flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.3em] uppercase transition-all duration-300"
              >
                {isLoading ? 'Verifying...' : 'Reset Password'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>

              <p className="text-center text-[11px] text-gray-400">
                Didn't receive it?{' '}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={goBackToForgot}
                  className="text-[#2a0b38] font-bold hover:underline underline-offset-4 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </p>
            </form>
          </div>
        )}

        <div className="absolute bottom-8 flex items-center gap-3 opacity-20">
          <ShieldCheck className="w-4 h-4 text-[#2a0b38]" />
          <span className="text-[9px] font-bold tracking-[0.3em] text-gray-400 uppercase">Secure Member Terminal</span>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
};

export default Login;