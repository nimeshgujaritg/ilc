import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen,
  LogOut, Bell, UserPlus, Upload, ScrollText,
  UserCircle, ChevronDown, Image, CheckCheck, Menu, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

const CEO_MENU = [
  { icon: <LayoutDashboard size={18} />, label: 'Overview',   path: '/dashboard' },
  { icon: <Calendar size={18} />,        label: 'Events',      path: '/events' },
  { icon: <Calendar size={18} />,        label: 'Calendar',    path: '/calendar' },
  { icon: <Users size={18} />,           label: 'The Council', path: '/members' },
  { icon: <BookOpen size={18} />,        label: 'Knowledge',   path: '/resources' },
  { icon: <Image size={18} />,           label: 'Glimpses',    path: '/glimpses' },
];

const ADMIN_MENU = [
  { icon: <LayoutDashboard size={18} />, label: 'Overview',     path: '/admin-dashboard' },
  { icon: <Calendar size={18} />,        label: 'Events',        path: '/admin/events' },
  { icon: <Users size={18} />,           label: 'Members',       path: '/admin/members' },
  { icon: <UserPlus size={18} />,        label: 'Add Member',    path: '/admin/add-member' },
  { icon: <Upload size={18} />,          label: 'Bulk Upload',   path: '/admin/bulk-upload' },
  { icon: <UserCircle size={18} />,      label: 'Manage SPOCs',  path: '/admin/spocs' },
  { icon: <BookOpen size={18} />,        label: 'Resources',     path: '/admin/resources' },
  { icon: <ScrollText size={18} />,      label: 'Audit Logs',    path: '/admin/audit-logs' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const menuItems = user?.role === 'ADMIN' ? ADMIN_MENU : CEO_MENU;
  const displayName = user?.name || 'Member';
  const displayTitle = user?.title || '';
  const displayInitials = user?.initials || '?';

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/admin/notifications');
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch (err) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => { setDropdownOpen(false); logout(); };
  const handleProfile = () => { setDropdownOpen(false); navigate('/profile'); };

  const handleMarkRead = async (id) => {
    try {
      await client.patch(`/admin/notifications/${id}/read`);
      setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnread(p => Math.max(0, p - 1));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await client.patch('/admin/notifications/read-all');
      setNotifications(p => p.map(n => ({ ...n, is_read: true })));
      setUnread(0);
    } catch (err) {}
  };

  const TYPE_COLORS = {
    approval: 'bg-emerald-500',
    event:    'bg-[#EDA300]',
    spoc:     'bg-blue-500',
    general:  'bg-gray-400',
  };

  const SidebarContent = () => (
    <>
      <div className="px-8 lg:px-10">
        <div className="mb-10 lg:mb-16 flex items-center justify-between">
          <div>
            <img
              src="https://www.indialeadershipcouncil.com/wp-content/uploads/2026/04/ilc-faciliting.png"
              alt="ILC Portal"
              className="h-12 lg:h-16 object-contain"
            />
            <div className="h-[1px] w-8 bg-[#EDA300] mt-2 lg:mt-3" />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-6">
          <p className="text-[9px] font-bold tracking-[0.4em] text-gray-500 uppercase mb-4">
            {user?.role === 'ADMIN' ? 'Admin Controls' : 'Executive Navigation'}
          </p>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-0 py-3 transition-all duration-300 group ${
                  location.pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className={`transition-all duration-300 ${
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

      <div className="px-8 lg:px-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Logout Session</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-[#FCFBFA] font-sans overflow-hidden">

      {/* ── MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR — desktop fixed, mobile slide-in */}
      <aside className={`
        fixed lg:relative z-50 lg:z-auto
        w-72 bg-[#1a0525] flex flex-col justify-between py-8 lg:py-12
        shrink-0 overflow-hidden h-full
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#EDA300] opacity-[0.03] rounded-full blur-3xl" />
        <SidebarContent />
      </aside>

      {/* ── MAIN */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFBFA] w-full">

        {/* ── HEADER */}
        <header className="h-16 lg:h-24 px-4 lg:px-16 flex items-center justify-between sticky top-0 z-30 bg-[#FCFBFA] border-b border-gray-50 lg:border-none">

          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-[#2a0b38] transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Logo — mobile only */}
            <img
              src="https://www.indialeadershipcouncil.com/wp-content/uploads/2026/04/ilc-faciliting.png"
              alt="ILC"
              className="h-8 object-contain lg:hidden"
            />

            {/* Status — desktop only */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
                Secure Executive Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">

            {/* NOTIFICATIONS */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(p => !p)} className="relative p-1">
                <Bell size={18} className="text-gray-400 hover:text-[#2a0b38] transition-colors" />
                {unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">{unread > 9 ? '9+' : unread}</span>
                  </div>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 lg:w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#2a0b38]">Notifications</p>
                    {unread > 0 && (
                      <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#2a0b38] font-bold uppercase tracking-widest">
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 lg:max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-xs">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_COLORS[n.type] || 'bg-gray-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-bold text-[#2a0b38] ${!n.is_read ? '' : 'opacity-60'}`}>{n.title}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-gray-300 mt-1">
                              {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-2 lg:gap-3 lg:border-l lg:pl-8 border-gray-100 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-[11px] font-bold text-[#2a0b38] tracking-widest uppercase">{displayName}</p>
                  <p className="text-[9px] text-[#EDA300] font-bold uppercase tracking-widest">{displayTitle}</p>
                </div>
                {user?.photo_url ? (
                  <img src={user.photo_url} alt={displayName} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover ring-2 lg:ring-4 ring-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#1a0525] text-white flex items-center justify-center font-bold ring-2 lg:ring-4 ring-white shadow-sm text-xs lg:text-sm">
                    {displayInitials}
                  </div>
                )}
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform hidden lg:block ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-sm shadow-lg z-50 overflow-hidden">
                  <button onClick={handleProfile} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-[#2a0b38] transition-colors">
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </button>
                  <div className="h-[1px] bg-gray-50" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-16 pb-8 lg:pb-16 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;