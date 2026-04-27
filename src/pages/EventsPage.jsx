import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ChevronRight, ChevronLeft, LayoutList } from 'lucide-react';
import client from '../api/client';

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getDateKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

// ─────────────────────────────────────────────
// CALENDAR VIEW
// ─────────────────────────────────────────────
const CalendarView = ({ events, navigate }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const eventMap = {};
  events.forEach(event => {
    const key = getDateKey(event.date);
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push(event);
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
        <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-[#2a0b38] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-serif text-[#2a0b38]">{monthNames[viewMonth]} {viewYear}</h2>
        <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-[#2a0b38] transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-50">
        {dayNames.map(day => (
          <div key={day} className="py-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{day}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const dayNum = idx - firstDay + 1;
          const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
          const dateKey = isCurrentMonth
            ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            : null;
          const dayEvents = dateKey ? (eventMap[dateKey] || []) : [];
          const isToday = dateKey === todayKey;

          return (
            <div key={idx} className={`min-h-[100px] p-2 border-b border-r border-gray-50 ${!isCurrentMonth ? 'bg-gray-50/30' : ''}`}>
              {isCurrentMonth && (
                <>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-[#2a0b38] text-white' : 'text-gray-500'}`}>
                    <span className="text-xs font-bold">{dayNum}</span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold truncate transition-all hover:opacity-80 ${
                          event.is_booked === 1 ? 'bg-emerald-100 text-emerald-700' :
                          event.is_waitlisted === 1 ? 'bg-amber-100 text-amber-700' :
                          'bg-[#2a0b38]/10 text-[#2a0b38]'
                        }`}
                      >
                        {event.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-6 px-8 py-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#2a0b38]/10" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-100" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-100" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Waitlisted</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LIST VIEW — CARD FORMAT WITH IMAGES
// ─────────────────────────────────────────────
const ListView = ({ events, navigate }) => {
  if (events.length === 0) return (
    <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
      <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-4" />
      <p className="text-gray-400 text-sm">No upcoming events at the moment.</p>
      <p className="text-gray-300 text-xs mt-1">Check back soon.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      {events.map(event => {
        const spotsLeft = event.capacity ? event.capacity - event.booking_count : null;
        const isFull = spotsLeft !== null && spotsLeft <= 0;

        return (
          <button
            key={event.id}
            onClick={() => navigate(`/events/${event.id}`)}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#2a0b38]/20 transition-all text-left group"
          >
            {/* Image or placeholder */}
            <div className="relative h-48 overflow-hidden">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-[#1a0525] flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-[#EDA300]/20" />
                </div>
              )}

              {/* Date overlay */}
              <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 text-center shadow-sm">
                <p className="text-[#EDA300] text-[9px] font-bold uppercase tracking-widest">
                  {new Date(event.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' })}
                </p>
                <p className="text-[#2a0b38] text-xl font-serif font-bold leading-none">
                  {new Date(event.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric' })}
                </p>
              </div>

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                {event.is_booked === 1 && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-500 text-white px-2 py-1 rounded-full">
                    Booked
                  </span>
                )}
                {event.is_waitlisted === 1 && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500 text-white px-2 py-1 rounded-full">
                    Waitlisted
                  </span>
                )}
                {isFull && event.is_booked !== 1 && event.is_waitlisted !== 1 && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-red-500 text-white px-2 py-1 rounded-full">
                    Full
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-serif text-[#2a0b38] group-hover:text-[#1a0525] leading-tight">
                {event.title}
              </h3>

              <div className="flex items-center gap-4 flex-wrap">
                {event.time && (
                  <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {formatTime(event.time)}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                )}
                {event.capacity && (
                  <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Users className="w-3 h-3" />
                    {isFull ? 'Fully booked' : `${spotsLeft} spots left`}
                  </span>
                )}
              </div>

              {event.description && (
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex items-center justify-end pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a0b38] group-hover:text-[#EDA300] transition-colors flex items-center gap-1">
                  View Details
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await client.get('/events');
        setEvents(res.data.events);
      } catch (err) {
        setError('Failed to load events. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading events...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="py-12 space-y-10">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Calendar</p>
          <h1 className="text-4xl font-serif text-[#2a0b38]">Upcoming Events</h1>
          <p className="text-gray-400 text-sm mt-2">Exclusive events curated for ILC members.</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mt-2">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
              view === 'list' ? 'bg-white text-[#2a0b38] shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
              view === 'calendar' ? 'bg-white text-[#2a0b38] shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {view === 'list'
        ? <ListView events={events} navigate={navigate} />
        : <CalendarView events={events} navigate={navigate} />
      }
    </div>
  );
};

export default EventsPage;