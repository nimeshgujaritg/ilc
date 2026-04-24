import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Your image import
import leftBgImage from '../assets/images/ilc-faciliting.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleLogin = (e) => {
        e.preventDefault();
        const role = email.includes('admin') ? 'SUPER_ADMIN' : 'CEO';
        login(email, role);

        if (role === 'SUPER_ADMIN') {
            navigate('/admin-dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F7F5] overflow-hidden font-sans">

            {/* LEFT COLUMN: Premium Dark Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#2a0b38] flex-col items-center justify-center p-16 overflow-hidden">

                {/* Subtle Background Texture */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(255,255,255,0.05) 15px, rgba(255,255,255,0.05) 16px)' }}>
                </div>

                {/* Main Content Group - Strictly Centered */}
                <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">

                    {/* Logo Section - BUMPED SIZE to max-w-xl (huge) */}
                    <div className="w-full mb-12 flex justify-center">
                        <img
                            src={leftBgImage}
                            alt="ILC Facilitating"
                            className="w-full max-w-xl h-auto object-contain"
                        />
                    </div>

                    <div className="space-y-6">
                        <p className="text-[#EDA300] text-xs font-bold tracking-[0.4em] uppercase opacity-90">
                            Established 2024
                        </p>

                        <h1 className="text-6xl lg:text-7xl font-poppins font-bold text-white leading-tight tracking-tight">
                            India Leadership<br />Council
                        </h1>

                        <div className="w-20 h-[2px] bg-[#EDA300] mx-auto"></div>

                        <p className="text-[#b18ebd] italic text-lg max-w-md mx-auto leading-relaxed opacity-80">
                            An exclusive sanctuary for visionaries shaping the future of global enterprise.
                        </p>
                    </div>
                </div>

                {/* Footer Text - Moved to Absolute to stop it from pushing the center content up */}
                <div className="absolute bottom-12 w-full text-center">
                    <p className="text-[#7d5b88] text-[10px] font-bold tracking-[0.4em] uppercase opacity-50">
                        The Executive Portfolio
                    </p>
                </div>
            </div>

            {/* RIGHT COLUMN: Perfect Visual Centering for Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 relative bg-[#F8F7F5]">

                {/* Version Tag */}
                <div className="absolute top-12 right-12 flex items-center gap-4">
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-300">Portal Access v.2.4</span>
                    <div className="h-[1px] w-12 bg-gray-200"></div>
                </div>

                {/* Form Content */}
                <div className="w-full max-w-[420px] flex flex-col mt-[-20px]"> {/* Slight negative margin for optical lift */}
                    <div className="mb-14">
                        <h2 className="text-5xl font-poppins font-bold text-[#2a0b38] mb-4">Welcome Back</h2>
                        <p className="text-sm text-gray-500 font-light tracking-wide">Please enter your credentials to access the executive suite.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-12">
                        {/* Official Email Label */}
                        <div className="group space-y-2">
                            <label className="text-[13px] font-medium text-[#EDA300] block  uppercase">
                                Official Email
                            </label>
                            <div className="flex items-center border-b border-gray-200 py-3 group-focus-within:border-[#2a0b38] transition-all duration-500">
                                <Mail className="w-[18px] h-[18px] text-gray-400 mr-4" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="executive@council.in"
                                    className="w-full bg-transparent outline-none text-[16px] text-gray-800 placeholder-gray-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Member Password Label */}
                        <div className="group space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-[13px] font-medium text-[#EDA300] block  uppercase">
                                    Member Password
                                </label>
                                <button type="button" className="text-[11px] text-gray-400  uppercase hover:text-[#2a0b38] transition-colors">
                                    Forgot?
                                </button>
                            </div>
                            <div className="flex items-center border-b border-gray-200 py-3  uppercase group-focus-within:border-[#2a0b38] transition-all duration-500">
                                <Lock className="w-[18px] h-[18px] text-gray-400 mr-4" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-transparent outline-none text-[16px] text-gray-800 placeholder-gray-300 tracking-[0.1em]"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2a0b38] hover:bg-[#1a0525] text-white py-5 rounded-sm flex items-center justify-center gap-3 text-[16px] font-bold  uppercase transition-all duration-500 shadow-xl active:scale-[0.99]"
                        >
                            Enter Portal <ChevronRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-14 text-center">
                        <p className="text-[12px] font-bold uppercase text-gray-300">
                            Digital Concierge: <a href="mailto:info@et.edage.com" className="text-gray-400 hover:text-[#2a0b38] transition-colors underline underline-offset-8">info@et.edage.com</a>
                        </p>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="absolute bottom-12 flex items-center gap-4 opacity-30">
                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                    <span className="text-[12px] font-bold  text-gray-400 uppercase">Secure Member Terminal</span>
                </div>
            </div>
        </div>
    );
};

export default Login;