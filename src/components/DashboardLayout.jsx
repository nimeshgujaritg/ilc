import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, BookOpen, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', path: '/dashboard' },
    { icon: <Calendar size={18} />, label: 'Events', path: '/events' },
    { icon: <Users size={18} />, label: 'The Council', path: '/members' },
    { icon: <BookOpen size={18} />, label: 'Knowledge', path: '/resources' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FCFBFA] font-sans overflow-hidden">
      
      {/* DEEP MIDNIGHT SIDEBAR */}
      <aside className="w-72 bg-[#1a0525] flex flex-col justify-between py-12 shrink-0 relative overflow-hidden">
        {/* Subtle Brand Watermark */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#EDA300] opacity-[0.03] rounded-full blur-3xl"></div>

        <div className="px-10">
          <div className="mb-16">
            <h2 className="text-white font-serif text-2xl font-bold tracking-tighter uppercase">ILC Portal</h2>
            <div className="h-[1px] w-8 bg-[#EDA300] mt-2"></div>
          </div>

          <nav className="space-y-6">
            <p className="text-[9px] font-bold tracking-[0.4em] text-gray-500 uppercase mb-4">Executive Navigation</p>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-0 py-3 transition-all duration-500 group ${
                    location.pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className={`transition-all duration-500 ${location.pathname === item.path ? 'text-[#EDA300]' : 'group-hover:text-white'}`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{item.label}</span>
                  {location.pathname === item.path && <div className="ml-auto w-1 h-1 bg-[#EDA300] rounded-full shadow-[0_0_8px_#EDA300]"></div>}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="px-10 space-y-8">
          {/* VIP Concierge Card */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-sm">
             <p className="text-[9px] font-bold text-[#EDA300] tracking-widest uppercase mb-2">Priority</p>
             <p className="text-white text-[11px] font-medium leading-relaxed mb-4">Your dedicated concierge is standing by.</p>
             <button className="text-[9px] font-bold text-white uppercase tracking-widest border-b border-[#EDA300] pb-1 hover:text-[#EDA300] transition-colors">Request Access</button>
          </div>

          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-4 text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFBFA]">
        <header className="h-24 px-16 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Secure Executive Network</span>
          </div>
          <div className="flex items-center gap-10">
            <Bell size={18} className="text-gray-300 cursor-pointer hover:text-[#2a0b38]" />
            <div className="flex items-center gap-4 border-l pl-10 border-gray-100">
              <div className="text-right">
                <p className="text-[11px] font-bold text-[#2a0b38] tracking-widest uppercase">Amitav Ghosh</p>
                <p className="text-[9px] text-[#EDA300] font-bold uppercase tracking-widest">Global MD</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1a0525] text-white flex items-center justify-center font-bold ring-4 ring-white shadow-sm">S</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-16 pb-16 scroll-smooth">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;