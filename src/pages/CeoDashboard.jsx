import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, BookOpen, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const CeoDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [resources, setResources] = useState([]);
const [loading, setLoading] = useState(true);
const [spoc, setSpoc] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
  try {
    const [evRes, memRes, resRes, meRes] = await Promise.all([
      client.get('/events'),
      client.get('/admin/members-list'),
      client.get('/resources'),
      client.get('/auth/me'),
    ]);
    setEvents(evRes.data.events);
    setMembers(memRes.data.members);
    setResources(resRes.data.resources);
    setSpoc(meRes.data.user.spoc || null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const bookedEvents = events.filter(e => e.is_booked === 1);
  const upcomingEvents = events.slice(0, 3);
  const firstName = user?.name?.split(' ')[0] || 'Executive';

  return (
    <div className="py-12 space-y-12 max-w-6xl">

      {/* ── HEADER */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-100 pb-8 gap-4">
  <div>
    <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">
      Executive Dashboard
    </p>
    <h1 className="text-4xl font-serif text-[#2a0b38]">
      Welcome back, {firstName}.
    </h1>
    <p className="text-gray-400 text-sm mt-2">
      Here's what's happening in the India Leadership Council.
    </p>
  </div>

  <div className="flex items-center gap-4">
    {/* SPOC mini widget */}
    {spoc && (
      <div className="hidden lg:flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
        {spoc.photo_url ? (
          <img src={spoc.photo_url} alt={spoc.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-sm font-bold">
            {spoc.name?.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Your SPOC</p>
          <p className="text-sm font-bold text-[#2a0b38]">{spoc.name}</p>
          {spoc.title && <p className="text-[10px] text-[#EDA300] font-bold uppercase tracking-widest">{spoc.title}</p>}
        </div>
<div className="flex items-center gap-2 ml-2">
  {spoc.email && (
    <div className="relative group">
      <button
        onClick={() => window.open(`mailto:${spoc.email}`)}
        className="w-8 h-8 bg-[#1a0525] hover:bg-[#2a0b38] text-white rounded-full flex items-center justify-center transition-all"
      >
        <span className="text-xs">✉</span>
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a0525] text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
        {spoc.email}
      </div>
    </div>
  )}
  {spoc.phone && (
    <div className="relative group">
      <button
        onClick={() => window.open(`tel:${spoc.phone}`)}
        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-all"
      >
        <span className="text-xs">📞</span>
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a0525] text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
        {spoc.phone}
      </div>
    </div>
  )}
</div>
      </div>
    )}

    <button
      onClick={() => navigate('/events')}
      className="flex items-center gap-2 bg-[#1a0525] hover:bg-[#2a0b38] text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
    >
      View Events
      <ChevronRight className="w-4 h-4 text-[#EDA300]" />
    </button>
  </div>
</div>

      {/* ── STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:border-[#EDA300]/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1a0525] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[#EDA300]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Members</p>
          </div>
          <p className="text-3xl font-serif text-[#2a0b38]">
            {loading ? '—' : members.length}
          </p>
          <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">Council Members</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:border-[#EDA300]/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1a0525] rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#EDA300]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Events</p>
          </div>
          <p className="text-3xl font-serif text-[#EDA300]">
            {loading ? '—' : events.length}
          </p>
          <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">Upcoming Events</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:border-[#EDA300]/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1a0525] rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#EDA300]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bookings</p>
          </div>
          <p className="text-3xl font-serif text-[#2a0b38]">
            {loading ? '—' : bookedEvents.length}
          </p>
          <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">Events Booked</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:border-[#EDA300]/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1a0525] rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#EDA300]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Resources</p>
          </div>
          <p className="text-3xl font-serif text-[#2a0b38]">
            {loading ? '—' : resources.length}
          </p>
          <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">Available</p>
        </div>
      </div>


      {/* ── UPCOMING EVENTS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Upcoming Events
          </h3>
          <button
            onClick={() => navigate('/events')}
            className="text-[10px] font-bold text-[#EDA300] uppercase tracking-widest border-b border-[#EDA300]/30 pb-1 hover:border-[#EDA300] transition-colors"
          >
            View All
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading events...</p>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No upcoming events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2a0b38]/20 transition-all text-left group"
              >
                <div className="relative h-36 overflow-hidden">
  {event.image_url ? (
    <img
      src={event.image_url}
      alt={event.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  ) : (
    <div className="w-full h-full bg-[#1a0525] flex items-center justify-center">
      <Calendar className="w-8 h-8 text-[#EDA300]/20" />
    </div>
  )}
  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-center shadow-sm">
    <p className="text-[#EDA300] text-[9px] font-bold uppercase tracking-widest">
      {new Date(event.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' })}
    </p>
    <p className="text-[#2a0b38] text-xl font-serif font-bold leading-none">
      {new Date(event.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' })}
    </p>
  </div>
</div>
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-serif text-[#2a0b38] group-hover:text-[#1a0525] leading-tight">
                      {event.title}
                    </h4>
                    {event.is_booked === 1 && (
                      <span className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        Booked
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {event.location && (
                      <p className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                    {event.time && (
                      <p className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.time)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── PREMIUM BANNER */}
      <div className="bg-[#1a0525] rounded-xl p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EDA300] opacity-[0.03] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 space-y-3">
          <p className="text-[#EDA300] text-[9px] font-bold uppercase tracking-widest">Exclusive Access</p>
          <h2 className="text-3xl font-serif text-white max-w-md">
            2026 Leadership Outlook
          </h2>
          <p className="text-gray-400 text-sm max-w-sm">
            Curated insights and resources exclusively for ILC members.
          </p>
        </div>
        <button
          onClick={() => navigate('/resources')}
          className="bg-[#EDA300] hover:bg-[#d4920a] text-[#1a0525] px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 rounded-sm"
        >
          View Resources
        </button>
      </div>
    </div>
  );
};

export default CeoDashboard;