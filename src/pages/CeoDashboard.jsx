import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, BookOpen, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';
// import { useEffect as useEffectExtra } from 'react';

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
const AnnouncementsBanner = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    client.get('/announcements').then(res => {
      setAnnouncements(res.data.announcements.slice(0, 2));
    }).catch(() => {});
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-3">
      {announcements.map(a => (
        <div key={a.id} className={`flex items-start gap-4 p-4 rounded-xl border ${
          a.type === 'Important'
            ? 'bg-red-50 border-red-200'
            : a.type === 'Event'
            ? 'bg-purple-50 border-purple-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <span className="text-xl shrink-0">
            {a.type === 'Important' ? '🔴' : a.type === 'Event' ? '📅' : '📢'}
          </span>
          <div>
            <p className="text-xs font-bold text-[#2a0b38]">{a.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
const CeoDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [resources, setResources] = useState([]);
const [loading, setLoading] = useState(true);
const [spoc, setSpoc] = useState(null);
const [showWelcome, setShowWelcome] = useState(false);
useEffect(() => {
  const key = `ilc_welcome_${user?.id}`;
  if (!localStorage.getItem(key)) {
    setShowWelcome(true);
    setTimeout(() => {
      localStorage.setItem(key, 'seen');
      setShowWelcome(false);
    }, 5000);
  }
}, []);

const dismissWelcome = () => {
  localStorage.setItem(`ilc_welcome_${user?.id}`, 'seen');
  setShowWelcome(false);
};
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
    {/* ── WELCOME BANNER */}
    {showWelcome && (
      <div className="relative bg-gradient-to-r from-[#1a0525] to-[#2a0b38] rounded-xl p-6 lg:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#EDA300] opacity-[0.05] rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#EDA300] opacity-[0.05] rounded-full -ml-10 -mb-10" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest">
              Welcome to ILC
            </p>
            <h2 className="text-2xl lg:text-3xl font-serif text-white">
              Welcome to the Council, {firstName}! 🎉
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
              Your membership has been approved. You now have full access to exclusive events, resources, and India's most influential leadership network.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { dismissWelcome(); navigate('/events'); }}
              className="bg-[#EDA300] hover:bg-[#d4920a] text-[#1a0525] px-5 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
            >
              View Events
            </button>
            <button
              onClick={dismissWelcome}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    )}
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
{spoc.phone && (
  <div className="relative group">
    <button
      onClick={() => window.open(`https://wa.me/${spoc.phone.replace(/[^0-9]/g, '')}`, '_blank')}
      className="w-8 h-8 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full flex items-center justify-center transition-all"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a0525] text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
      WhatsApp
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

{/* ── ANNOUNCEMENTS */}
      <AnnouncementsBanner />
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


    </div>
  );
};

export default CeoDashboard;