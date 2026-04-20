import React from 'react';
import { ArrowUpRight, MapPin, Calendar, Users, ChevronRight } from 'lucide-react';

const CeoDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-12">
      
      {/* HEADER: Professional & Tight */}
      <section className="flex justify-between items-end border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#EDA300] uppercase">Executive Terminal v2.4</p>
          <h1 className="text-4xl font-serif text-[#360e4a] tracking-tight">Welcome, Amitav.</h1>
          <p className="text-sm text-gray-400 font-light italic">Your weekly synthesis is ready for review.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-2.5 bg-white border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-[#360e4a] hover:bg-gray-50 transition-all">Concierge</button>
           <button className="px-6 py-2.5 bg-[#360e4a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#2a0b38] transition-all shadow-lg shadow-purple-900/20">All Invites</button>
        </div>
      </section>

      {/* STATS: Minimalist Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Network" value="230+" sub="Visionaries" />
        <StatCard label="Events" value="12" sub="Global Summits" highlight />
        <StatCard label="Bookings" value="04" sub="Confirmed" />
        <StatCard label="Briefings" value="48" sub="Internal" />
      </div>

      {/* UPCOMING ENGAGEMENTS: Clean Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[11px] font-bold tracking-[0.4em] uppercase text-gray-400">Upcoming Engagements</h3>
          <button className="text-[10px] font-bold text-[#EDA300] uppercase tracking-widest border-b border-[#EDA300]/30 pb-1">View Calendar</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EventCard 
            date="Nov 12" 
            title="AI & Sovereign Finance" 
            location="Mumbai" 
            img="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=500"
          />
          <EventCard 
            date="Dec 04" 
            title="Global M&A Masterclass" 
            location="New Delhi" 
            img="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=500"
          />
          <EventCard 
            date="Jan 18" 
            title="Private Art & Vineyard Gala" 
            location="Nashik" 
            img="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=500"
          />
        </div>
      </section>

      {/* PREMIUM BANNER: Bold Contrast */}
      <div className="bg-[#360e4a] rounded-sm p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.02] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-4">
          <span className="text-[9px] font-bold text-[#EDA300] tracking-[0.5em] uppercase">Exclusive Insight</span>
          <h2 className="text-3xl font-serif text-white max-w-md">2026 Leadership Outlook: The Mid-Year Synthesis</h2>
          <p className="text-gray-400 text-xs font-light max-w-sm">Curated data on sector-specific growth across 12 tier-one cities.</p>
        </div>
        <button className="bg-[#EDA300] text-[#360e4a] px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shrink-0">
          Download Report
        </button>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS FOR CLEANLINESS --- */

const StatCard = ({ label, value, sub, highlight }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-sm hover:border-[#EDA300]/30 transition-colors">
    <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-4">{label}</p>
    <h4 className={`text-3xl font-serif mb-1 ${highlight ? 'text-[#EDA300]' : 'text-[#360e4a]'}`}>{value}</h4>
    <p className="text-[10px] text-gray-300 font-medium uppercase tracking-tighter">{sub}</p>
  </div>
);

const EventCard = ({ date, title, location, img }) => (
  <div className="group cursor-pointer">
    <div className="relative h-64 w-full overflow-hidden rounded-sm mb-4">
      <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={title} />
      <div className="absolute top-4 left-4 bg-white px-3 py-1">
        <p className="text-[10px] font-bold text-[#360e4a] uppercase tracking-tighter">{date}</p>
      </div>
    </div>
    <div className="space-y-2">
      <h4 className="text-lg font-serif text-[#360e4a] group-hover:text-[#EDA300] transition-colors">{title}</h4>
      <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        <MapPin size={10} className="text-[#EDA300]" /> {location}
      </div>
    </div>
  </div>
);

export default CeoDashboard;