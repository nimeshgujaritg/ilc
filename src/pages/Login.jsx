import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password.trim()) e.password = 'Password is required';
    return e;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const result = await login(email, password);

    if (result.success) {
      const { user } = result;
      if (user.isFirstLogin) return navigate('/reset-password');
      if (user.profileStatus !== 'APPROVED') return navigate('/pending');
      return navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
    } else {
      setErrors({ form: result.error });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#FDFDFD] overflow-hidden font-sans">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d124d] via-[#2a0b38] to-[#1a0525]"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, #ffffff 20px, #ffffff 21px)' }}
        />
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xl space-y-4">
          <p className="text-[#EDA300] text-[10px] font-bold tracking-[0.5em] uppercase">Established 2024</p>
          <h1 className="text-6xl font-serif text-white leading-tight tracking-tight">
            India Leadership<br /><span className="italic font-light">Council</span>
          </h1>
          <div className="w-20 h-[1px] bg-[#EDA300] mx-auto"></div>
          <p className="text-gray-400 font-light text-base max-w-sm mx-auto leading-relaxed">
            An exclusive sanctuary for visionaries shaping the future of global enterprise.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-300">Portal v2.4</span>
          <div className="h-[1px] w-6 bg-[#EDA300]"></div>
        </div>

        <div
          className="w-full max-w-[420px]"
          style={{ animation: isShaking ? 'shake 0.4s ease' : undefined }}
        >
          <div className="mb-10">
            <h2 className="text-5xl font-serif text-[#2a0b38] mb-4">Welcome</h2>
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#EDA300]"></div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                Identity Authentication
              </p>
            </div>
          </div>

          {errors.form && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-[12px] text-red-600">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Official Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: null, form: null })); }}
                  placeholder="executive@council.in"
                  className={`block w-full pl-11 pr-4 py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${errors.email ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38] focus:border-[#2a0b38]'}`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  Password
                </label>
                <button type="button" className="text-[10px] text-gray-300 hover:text-[#2a0b38] font-bold tracking-widest transition-colors">
                  FORGOT?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: null, form: null })); }}
                  placeholder="••••••••••••"
                  className={`block w-full pl-11 pr-16 py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm focus:bg-white focus:ring-1 outline-none transition-all ${errors.password ? 'border-red-300 focus:ring-red-300' : 'border-gray-100 focus:ring-[#2a0b38] focus:border-[#2a0b38]'}`}
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

          <div className="mt-10 text-center">
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase">
              Concierge: <a href="mailto:concierge@ilc.in" className="text-gray-400 hover:text-[#2a0b38] underline underline-offset-8">concierge@ilc.in</a>
            </p>
          </div>
        </div>

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