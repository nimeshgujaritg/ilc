import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import client from '../api/client';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await client.get('/admin/members-list');
        setMembers(res.data.members);
      } catch (err) {
        console.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filtered = members.filter(m => {
    const q = query.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.title?.toLowerCase().includes(q)
    );
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading members...</p>
    </div>
  );

  return (
    <div className="py-12 space-y-10">

      {/* Header */}
      <div>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">
          Council Directory
        </p>
        <h1 className="text-4xl font-serif text-[#2a0b38]">The Council</h1>
        <p className="text-gray-400 text-sm mt-2">
          Connecting India's most influential leaders.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or title..."
          className="w-full bg-white border border-gray-100 py-3 pl-11 pr-5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2a0b38] rounded-lg transition-all"
        />
      </div>

      {/* Count */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
        {filtered.length} {filtered.length === 1 ? 'Member' : 'Members'}
      </p>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {query ? 'No members match your search.' : 'No approved members yet.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(member => (
            <div
              key={member.id}
              className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:shadow-md hover:border-[#2a0b38]/20 transition-all group"
            >
              {/* Avatar */}
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-4 ring-4 ring-gray-50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#1a0525] text-white flex items-center justify-center font-bold text-lg mx-auto mb-4 ring-4 ring-gray-50">
                  {member.initials}
                </div>
              )}

              {/* Info */}
              <h4 className="text-sm font-bold text-[#2a0b38] mb-1 leading-tight">
                {member.name}
              </h4>
              {member.title && (
                <p className="text-[10px] text-[#EDA300] font-bold uppercase tracking-widest leading-tight">
                  {member.title}
                </p>
              )}

              {/* Member since */}
              <p className="text-[10px] text-gray-300 mt-2">
                Member since {new Date(member.created_at).getFullYear()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPage;