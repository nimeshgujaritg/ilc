import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen,
  LogOut, Bell, UserPlus, Upload, ScrollText, UserCircle, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const CEO_MENU = [
  { icon: <LayoutDashboard size={18} />, label: 'Overview',   path: '/dashboard' },
  { icon: <Calendar size={18} />,        label: 'Events',      path: '/events' },
  { icon: <Users size={18} />,           label: 'The Council', path: '/members' },
  { icon: <BookOpen size={18} />,        label: 'Knowledge',   path: '/resources' },
];

const ADMIN_MENU = [
  { icon: <LayoutDashboard size={18} />, label: 'Overview',     path: '/admin-dashboard' },
  { icon: <Users size={18} />,           label: 'Members',       path: '/admin/members' },
  { icon: <UserPlus size={18} />,        label: 'Add Member',    path: '/admin/add-member' },
  { icon: <Upload size={18} />,          label: 'Bulk Upload',   path: '/admin/bulk-upload' },
  { icon: <UserCircle size={18} />,      label: 'Manage SPOCs',  path: '/admin/spocs' },
  { icon: <ScrollText size={18} />,      label: 'Audit Logs',    path: '/admin/audit-logs' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = user?.role === 'ADMIN' ? ADMIN_MENU : CEO_MENU;
  const displayName = user?.name || 'Member';
  const displayTitle = user?.title || '';
  const displayInitials = user?.initials || '?';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <div className="flex h-screen w-full bg-[#FCFBFA] font-sans overflow-hidden">

      {/* ── SIDEBAR */}
      <aside className="w-72 bg-[#1a0525] flex flex-col justify-between py-12 shrink-0 relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#EDA300] opacity-[0.03] rounded-full blur-3xl" />

        <div className="px-10">
          <div className="mb-16">
            <h2 className="text-white font-serif text-2xl font-bold tracking-tighter uppercase">ILC Portal</h2>
            <div className="h-[1px] w-8 bg-[#EDA300] mt-2" />
          </div>

          <nav className="space-y-6">
            <p className="text-[9px] font-bold tracking-[0.4em] text-gray-500 uppercase mb-4">
              {user?.role === 'ADMIN' ? 'Admin Controls' : 'Executive Navigation'}
            </p>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-0 py-3 transition-all duration-500 group ${
                    location.pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <div className={`transition-all duration-500 ${
                    location.pathname === item.path ? 'text-[#EDA300]' : 'group-hover:text-white'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{item.label}</span>
                  {location.pathname === item.path && (
                    <div className="ml-auto w-1 h-1 bg-[#EDA300] rounded-full shadow-[0_0_8px_#EDA300]" />
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="px-10 space-y-8">
          <div className="bg-white/5 border border-white/10 p-6 rounded-sm">
            <p className="text-[9px] font-bold text-[#EDA300] tracking-widest uppercase mb-2">Priority</p>
            <p className="text-white text-[11px] font-medium leading-relaxed mb-4">
              Your dedicated concierge is standing by.
            </p>
            <button className="text-[9px] font-bold text-white uppercase tracking-widest border-b border-[#EDA300] pb-1 hover:text-[#EDA300] transition-colors">
              Request Access
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFBFA]">
        <header className="h-24 px-16 flex items-center justify-between sticky top-0 z-50 bg-[#FCFBFA]">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
              Secure Executive Network
            </span>
          </div>

          <div className="flex items-center gap-8">
            {/* Bell — placeholder for now */}
            <Bell size={18} className="text-gray-300 cursor-pointer hover:text-[#2a0b38] transition-colors" />

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-3 border-l pl-8 border-gray-100 hover:opacity-80 transition-opacity"
              >
                <div className="text-right">
                  <p className="text-[11px] font-bold text-[#2a0b38] tracking-widest uppercase">{displayName}</p>
                  <p className="text-[9px] text-[#EDA300] font-bold uppercase tracking-widest">{displayTitle}</p>
                </div>
                {user?.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover ring-4 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1a0525] text-white flex items-center justify-center font-bold ring-4 ring-white shadow-sm text-sm">
                    {displayInitials}
                  </div>
                )}
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-sm shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-[#2a0b38] transition-colors"
                  >
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </button>
                  <div className="h-[1px] bg-gray-50" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
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