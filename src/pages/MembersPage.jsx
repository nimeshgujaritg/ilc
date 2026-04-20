import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

const ALL_MEMBERS = [
  { name: 'Aditya Deshmukh', role: 'Chief Technology Officer', company: 'Infosys Ventures', initial: 'AD', dept: 'Technology' },
  { name: 'Rajesh Khanna', role: 'Director, Strategy', company: 'McKinsey & Co.', initial: 'RK', dept: 'Strategy' },
  { name: 'Sunita Mehra', role: 'VP Operations', company: 'Reliance Industries', initial: 'SM', dept: 'Operations' },
  { name: 'Vikram Varma', role: 'Chief Investment Officer', company: 'HDFC Capital', initial: 'VV', dept: 'Finance' },
  { name: 'Priya Nair', role: 'Managing Director', company: 'Goldman Sachs India', initial: 'PN', dept: 'Finance' },
  { name: 'Arjun Sethi', role: 'CEO', company: 'Zepto', initial: 'AS', dept: 'Operations' },
  { name: 'Meera Pillai', role: 'Founder & CEO', company: 'Axiom Health', initial: 'MP', dept: 'Healthcare' },
  { name: 'Rohit Bose', role: 'Partner', company: 'Sequoia India', initial: 'RB', dept: 'Finance' },
];

const DEPARTMENTS = ['All', 'Finance', 'Technology', 'Strategy', 'Operations', 'Healthcare'];

const MembersPage = () => {
  const [query, setQuery] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  const filtered = ALL_MEMBERS.filter((member) => {
    const q = query.toLowerCase();
    const matchesQuery =
      member.name.toLowerCase().includes(q) ||
      member.role.toLowerCase().includes(q) ||
      member.company.toLowerCase().includes(q);
    const matchesDept = activeDept === 'All' || member.dept === activeDept;
    return matchesQuery && matchesDept;
  });

  return (
    <div className="max-w-6xl space-y-10">

      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Council Directory</p>
        <h1 className="text-6xl font-serif text-[#2a0b38] mb-3">Members</h1>
        <p className="text-gray-500 text-base font-light">Connecting India's most influential leaders.</p>
      </section>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role or company…"
            className="w-full bg-white border border-gray-100 py-4 pl-11 pr-5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2a0b38] focus:border-[#2a0b38] transition-all rounded-sm"
          />
        </div>
      </div>

      {/* Department filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setActiveDept(dept)}
            className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all rounded-sm ${
              activeDept === dept
                ? 'bg-[#2a0b38] text-white border-[#2a0b38]'
                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
        {filtered.length} {filtered.length === 1 ? 'Member' : 'Members'} found
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map((member, i) => (
            <div
              key={i}
              className="bg-white p-8 border border-gray-100 text-center hover:shadow-lg hover:border-[#EDA300]/20 transition-all duration-400 rounded-sm"
            >
              <div className="w-16 h-16 bg-[#2a0b38] rounded-full mx-auto mb-5 flex items-center justify-center text-white font-serif text-xl">
                {member.initial}
              </div>
              <h4 className="text-sm font-bold text-[#2a0b38] mb-1">{member.name}</h4>
              <p className="text-[8px] font-bold text-[#EDA300] uppercase tracking-widest mb-1">{member.role}</p>
              <p className="text-[10px] text-gray-400 font-light mb-5">{member.company}</p>
              <button className="w-full border-t pt-5 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#2a0b38] flex items-center justify-center gap-2 transition-colors">
                Connect <ChevronRight size={11} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-300 font-serif text-2xl mb-2">No members found</p>
          <p className="text-gray-400 text-sm font-light">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
};

export default MembersPage;