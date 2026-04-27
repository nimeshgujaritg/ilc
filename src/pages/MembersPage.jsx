import React, { useState, useEffect } from 'react';
import { Search, Users, Check, Clock, Phone, Mail } from 'lucide-react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
  </svg>
);

const MembersPage = () => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [query2, setQuery2] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [memRes, connRes] = await Promise.all([
          client.get('/admin/members-list'),
          client.get('/connections'),
        ]);
        setMembers(memRes.data.members);
        setConnections(connRes.data.connections);
      } catch (err) {
        console.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helper — get connection status for a member
  const getConnectionStatus = (memberId) => {
    const conn = connections.find(c =>
      (c.requester_id === user.id && c.receiver_id === memberId) ||
      (c.receiver_id === user.id && c.requester_id === memberId)
    );
    if (!conn) return null;
    if (conn.status === 'ACCEPTED') return { type: 'ACCEPTED' };
    if (conn.requester_id === user.id) return { type: 'SENT' };
    return { type: 'RECEIVED', fromId: conn.requester_id };
  };

  const handleConnect = async (memberId) => {
    setActionLoading(memberId);
    try {
      await client.post(`/connections/request/${memberId}`);
      const connRes = await client.get('/connections');
      setConnections(connRes.data.connections);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (memberId) => {
    setActionLoading(memberId);
    try {
      await client.patch(`/connections/accept/${memberId}`);
      const connRes = await client.get('/connections');
      setConnections(connRes.data.connections);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (memberId) => {
    setActionLoading(memberId);
    try {
      await client.patch(`/connections/reject/${memberId}`);
      const connRes = await client.get('/connections');
      setConnections(connRes.data.connections);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = members.filter(m => {
    const q = query2.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.title?.toLowerCase().includes(q)
    );
  });

  // Pending requests I need to act on
  const pendingReceived = connections.filter(
    c => c.receiver_id === user.id && c.status === 'PENDING'
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading members...</p>
    </div>
  );

  return (
    <div className="py-12 space-y-10">

      <div>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">
          Council Directory
        </p>
        <h1 className="text-4xl font-serif text-[#2a0b38]">The Council</h1>
        <p className="text-gray-400 text-sm mt-2">
          Connecting India's most influential leaders.
        </p>
      </div>

      {/* Pending requests banner */}
      {pendingReceived.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-3">
            {pendingReceived.length} Pending Connection Request{pendingReceived.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {pendingReceived.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {c.requester_photo ? (
                    <img src={c.requester_photo} alt={c.requester_name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-[10px] font-bold">
                      {c.requester_initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-[#2a0b38]">{c.requester_name}</p>
                    <p className="text-[10px] text-gray-400">{c.requester_title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(c.requester_id)}
                    disabled={actionLoading === c.requester_id}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    {actionLoading === c.requester_id ? '...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleReject(c.requester_id)}
                    disabled={actionLoading === c.requester_id}
                    className="bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
        <input
          type="text"
          value={query2}
          onChange={e => setQuery2(e.target.value)}
          placeholder="Search by name or title..."
          className="w-full bg-white border border-gray-100 py-3 pl-11 pr-5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2a0b38] rounded-lg transition-all"
        />
      </div>

      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
        {filtered.length} {filtered.length === 1 ? 'Member' : 'Members'}
      </p>

      {filtered.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {query2 ? 'No members match your search.' : 'No approved members yet.'}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(member => {
            const connStatus = getConnectionStatus(member.id);
            const isMe = member.id === user.id;
            const isConnected = connStatus?.type === 'ACCEPTED';

            return (
              <div
                key={member.id}
                className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:shadow-md hover:border-[#2a0b38]/20 transition-all group"
              >
                {/* Photo */}
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

                <h4 className="text-sm font-bold text-[#2a0b38] mb-1 leading-tight">
                  {member.name}
                </h4>
                {member.title && (
                  <p className="text-[10px] text-[#EDA300] font-bold uppercase tracking-widest leading-tight">
                    {member.title}
                  </p>
                )}
                <p className="text-[10px] text-gray-300 mt-2">
                  Member since {new Date(member.created_at).getFullYear()}
                </p>

                {/* Contact details — only if connected */}
                {isConnected && (
                  <div className="mt-3 space-y-1.5 text-left border-t border-gray-50 pt-3">
                    {member.phone && (
                      <button
                        onClick={() => window.open(`tel:${member.phone}`)}
                        className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-[#2a0b38] transition-colors w-full"
                      >
                        <Phone className="w-3 h-3 shrink-0 text-[#EDA300]" />
                        <span className="truncate">{member.phone}</span>
                      </button>
                    )}
                    {member.email && (
                      <button
                        onClick={() => window.open(`mailto:${member.email}`)}
                        className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-[#2a0b38] transition-colors w-full"
                      >
                        <Mail className="w-3 h-3 shrink-0 text-[#EDA300]" />
                        <span className="truncate">{member.email}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* LinkedIn */}
                {member.linkedin_url && (
                  <button
                    onClick={() => window.open(member.linkedin_url, '_blank')}
                    className="mt-3 flex items-center gap-1.5 mx-auto text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <LinkedInIcon />
                    LinkedIn
                  </button>
                )}

                {/* Connection button */}
                {!isMe && (
                  <div className="mt-4">
                    {isConnected ? (
                      <span className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        <Check className="w-3 h-3" />
                        Connected
                      </span>
                    ) : connStatus?.type === 'SENT' ? (
                      <span className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    ) : connStatus?.type === 'RECEIVED' ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleAccept(member.id)}
                          disabled={actionLoading === member.id}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          {actionLoading === member.id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleReject(member.id)}
                          disabled={actionLoading === member.id}
                          className="bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(member.id)}
                        disabled={actionLoading === member.id}
                        className="w-full bg-[#1a0525] hover:bg-[#2a0b38] text-white text-[10px] font-bold px-3 py-2 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                      >
                        {actionLoading === member.id ? '...' : 'Connect'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MembersPage;