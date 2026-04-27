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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes, memRes, resRes] = await Promise.all([
          client.get('/events'),
          client.get('/admin/members-list'),
          client.get('/resources'),
        ]);
        setEvents(evRes.data.events);
        setMembers(memRes.data.members);
        setResources(resRes.data.resources);
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
      <div className="flex items-end justify-between border-b border-gray-100 pb-8">
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
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 bg-[#1a0525] hover:bg-[#2a0b38] text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
        >
          View Events
          <ChevronRight className="w-4 h-4 text-[#EDA300]" />
        </button>
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
                <div className="bg-[#1a0525] px-6 py-5">
                  <p className="text-[#EDA300] text-[9px] font-bold uppercase tracking-widest mb-1">
                    {new Date(event.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-white text-3xl font-serif font-bold">
                    {new Date(event.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' })}
                  </p>
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
      <div className="bg-[#1a0525] rounded-xl p-10 flex items-center justify-between gap-8 relative overflow-hidden">
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