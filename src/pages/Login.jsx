import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import leftBgImage from '../assets/images/ilc-faciliting.png';

const CREDENTIALS = [
  {
    email: 'test@gmail.com',
    password: 'ceo123',
    userData: {
      name: 'Amitav Ghosh',
      role: 'CEO',
      title: 'Global MD',
      initials: 'AG',
    },
  },
  {
    email: 'admin@gmail.com',
    password: 'admin123',
    userData: {
      name: 'Admin Director',
      role: 'SUPER_ADMIN',
      title: 'Director of Operations',
      initials: 'AD',
    },
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // --- Validation ---
  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters.';
    }
    return newErrors;
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Step 1: Run validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Step 2: Check credentials (case-insensitive email)
    const match = CREDENTIALS.find(
      (c) =>
        c.email === email.trim().toLowerCase() &&
        c.password === password
    );

    if (match) {
      // Step 3: Store user and redirect
      login(match.userData);
      navigate(match.userData.role === 'SUPER_ADMIN' ? '/admin-dashboard' : '/dashboard');
    } else {
      // Step 4: Show error + shake animation
      setErrors({ form: 'Credentials not recognised. Please verify and try again.' });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Clear field-level errors as user types
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: null, form: null }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: null, form: null }));
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#FDFDFD] overflow-hidden font-sans">

      {/* LEFT COLUMN */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-radial-[at_top_left] from-[#3d124d] via-[#2a0b38] to-[#1a0525]"></div>
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, #ffffff 20px, #ffffff 21px)' }}
        />
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xl">
          <div className="w-full mb-10 flex justify-center">
            <img src={leftBgImage} alt="ILC Logo" className="w-full max-w-md h-auto object-contain drop-shadow-2xl" />
          </div>
          <div className="space-y-4">
            <p className="text-[#EDA300] text-[10px] font-bold tracking-[0.5em] uppercase">Established 2024</p>
            <h1 className="text-6xl font-serif text-white leading-tight tracking-tight">
              India Leadership<br /><span className="italic font-light">Council</span>
            </h1>
            <div className="w-20 h-[1px] bg-[#EDA300] mx-auto mt-6"></div>
            <p className="text-gray-400 font-light text-base max-w-sm mx-auto leading-relaxed pt-4">
              An exclusive sanctuary for visionaries shaping the future of global enterprise.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">

        <div className="absolute top-8 right-8 flex items-center gap-3">
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-300">Portal v.2.4</span>
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
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">Identity Authentication</p>
            </div>
          </div>

          {/* Form-level error */}
          {errors.form && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-[11px] text-red-600 font-medium">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6" noValidate>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Official Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-300 group-focus-within:text-[#2a0b38] transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="executive@council.in"
                  className={`block w-full pl-11 pr-4 py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm focus:bg-white focus:ring-1 outline-none transition-all duration-300 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                      : 'border-gray-100 focus:ring-[#2a0b38] focus:border-[#2a0b38]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Member Password</label>
                <button type="button" className="text-[10px] text-gray-300 hover:text-[#2a0b38] font-bold tracking-widest transition-colors">
                  FORGOT?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-300 group-focus-within:text-[#2a0b38] transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••••••"
                  className={`block w-full pl-11 pr-4 py-4 border rounded-sm bg-[#FAFAFA] text-gray-800 text-sm tracking-[0.3em] focus:bg-white focus:ring-1 outline-none transition-all duration-300 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-300 focus:border-red-300'
                      : 'border-gray-100 focus:ring-[#2a0b38] focus:border-[#2a0b38]'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#2a0b38] hover:bg-[#1a0525] text-white py-5 rounded-sm flex items-center justify-center gap-3 text-[12px] font-bold tracking-[0.3em] uppercase transition-all duration-500 shadow-xl shadow-purple-900/10 active:scale-[0.98]"
            >
              Enter Portal <ChevronRight className="w-4 h-4 text-[#EDA300]" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase">
              Digital Concierge:{' '}
              <a href="mailto:concierge@ilc.in" className="text-gray-400 hover:text-[#2a0b38] underline underline-offset-8">
                concierge@ilc.in
              </a>
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 flex items-center gap-3 opacity-20">
          <ShieldCheck className="w-4 h-4 text-[#2a0b38]" />
          <span className="text-[9px] font-bold tracking-[0.3em] text-gray-400 uppercase font-sans">Secure Member Terminal</span>
        </div>

      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Login;