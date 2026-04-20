import React, { useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';

const EVENTS = [
  {
    id: 1,
    date: 'November 12, 2026',
    title: 'AI & Sovereign Finance',
    location: 'Mumbai',
    desc: 'An intimate roundtable on the intersection of artificial intelligence and sovereign wealth management, hosted at the Taj Mahal Palace. Limited to 40 principals.',
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 2,
    date: 'December 04, 2026',
    title: 'Global M&A Masterclass',
    location: 'New Delhi',
    desc: 'A full-day deep dive into cross-border mergers, acquisition strategy, and deal structuring across emerging markets, led by senior practitioners.',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 3,
    date: 'January 18, 2027',
    title: 'Private Art & Vineyard Gala',
    location: 'Nashik',
    desc: "An exclusive evening connecting India's foremost art collectors and vineyard owners in a curated, private setting. Strictly invitation only.",
    img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 4,
    date: 'February 22, 2027',
    title: 'Infrastructure & Capital Summit',
    location: 'Bengaluru',
    desc: 'Visionary leaders convene to shape the next decade of infrastructure investment across South and Southeast Asia.',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=800',
  },
];

const EventsPage = () => {
  // Track registration per event ID
  const [registered, setRegistered] = useState({});

  const toggleRegister = (id) => {
    setRegistered((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-6xl space-y-10">

      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Curated Experiences</p>
        <h1 className="text-6xl font-serif text-[#2a0b38]">Events & Summits</h1>
        <p className="text-gray-400 font-light mt-3 text-base">Private, invitation-only engagements for council members.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {EVENTS.map((event) => (
          <div
            key={event.id}
            className="group bg-white border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 rounded-sm"
          >
            {/* Image */}
            <div className="h-64 overflow-hidden relative">
              <img
                src={event.img}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-90"
              />
              {/* Registered badge overlay */}
              {registered[event.id] && (
                <div className="absolute top-4 right-4 bg-[#2a0b38] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5">
                  ✓ Registered
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={10} className="text-[#EDA300]" /> {event.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={10} className="text-[#EDA300]" /> {event.location}
                </span>
              </div>

              <h3 className="text-2xl font-serif text-[#2a0b38] leading-snug">{event.title}</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">{event.desc}</p>

              <button
                onClick={() => toggleRegister(event.id)}
                className={`w-full py-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-sm ${
                  registered[event.id]
                    ? 'bg-[#2a0b38] text-white border border-[#2a0b38]'
                    : 'bg-white text-[#2a0b38] border border-[#2a0b38] hover:bg-[#2a0b38] hover:text-white'
                }`}
              >
                {registered[event.id] ? '✓ Interest Registered — Click to Withdraw' : 'Register Interest'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;