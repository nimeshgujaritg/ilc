import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import client from '../api/client';

const getDateKey = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await client.get('/events');
        setEvents(res.data.events);
      } catch (err) {
        console.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading calendar...</p>
    </div>
  );

  return (
    <div className="py-12 space-y-8">

      {/* Header */}
      <div>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Schedule</p>
        <h1 className="text-4xl font-serif text-[#2a0b38]">Calendar</h1>
        <p className="text-gray-400 text-sm mt-2">Your ILC events at a glance.</p>
      </div>

      {/* Calendar */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        {/* Month navigation */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-[#2a0b38] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-serif text-[#2a0b38]">
            {monthNames[viewMonth]} {viewYear}
          </h2>
          <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-[#2a0b38] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-50">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{day}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
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
              <div
                key={idx}
                className={`min-h-[100px] p-2 border-b border-r border-gray-50 ${
                  !isCurrentMonth ? 'bg-gray-50/30' : ''
                }`}
              >
                {isCurrentMonth && (
                  <>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                      isToday ? 'bg-[#2a0b38] text-white' : 'text-gray-500'
                    }`}>
                      <span className="text-xs font-bold">{dayNum}</span>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <button
                          key={event.id}
                          onClick={() => navigate(`/events/${event.id}`)}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold truncate transition-all hover:opacity-80 ${
                            event.is_booked === 1
                              ? 'bg-emerald-100 text-emerald-700'
                              : event.is_waitlisted === 1
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-[#2a0b38]/10 text-[#2a0b38]'
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

        {/* Legend */}
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
    </div>
  );
};

export default CalendarPage;