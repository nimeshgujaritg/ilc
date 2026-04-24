import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, X } from 'lucide-react';
import client from '../api/client';

const STATUS_BADGE = {
  APPROVED:  'bg-emerald-50 text-emerald-600',
  SUBMITTED: 'bg-amber-50 text-amber-600',
  PENDING:   'bg-gray-100 text-gray-500',
};

const STATUS_LABEL = {
  APPROVED:  'Approved',
  SUBMITTED: 'Awaiting Review',
  PENDING:   'Pending',
};

const AdminMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await client.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await client.patch(`/admin/users/${id}/approve`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this profile? User will need to re-submit.')) return;
    setActionLoading(id);
    try {
      await client.patch(`/admin/users/${id}/reject`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  // Dev-only helper — remove after Phase 6
  const handleMarkSubmitted = async (id) => {
    setActionLoading(id);
    try {
      await client.patch(`/admin/users/${id}/mark-submitted`);
      await fetchUsers();
    } catch (err) {
      alert('Failed to mark submitted');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Member Management</p>
        <h1 className="text-5xl font-serif text-[#2a0b38]">Members</h1>
      </section>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">

        {/* Search bar */}
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-sm bg-[#FAFAFA] outline-none focus:ring-1 focus:ring-[#2a0b38]"
            />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-auto text-[11px] text-gray-400 font-bold uppercase tracking-widest">
            {filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading members...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">No members found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-8 py-4">Member</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Joined</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a0525] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {u.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2a0b38]">{u.name}</p>
                        <p className="text-[11px] text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{u.role}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${STATUS_BADGE[u.profile_status]}`}>
                      {STATUS_LABEL[u.profile_status]}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[11px] text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      {u.profile_status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={actionLoading === u.id}
                            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {actionLoading === u.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(u.id)}
                            disabled={actionLoading === u.id}
                            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </>
                      )}
                      {/* DEV ONLY — remove after Phase 6 */}
                      {u.profile_status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkSubmitted(u.id)}
                          disabled={actionLoading === u.id}
                          className="text-[10px] font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === u.id ? '...' : 'Mark Submitted'}
                        </button>
                      )}
                      {u.profile_status === 'APPROVED' && (
                        <span className="text-[11px] text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminMembers;