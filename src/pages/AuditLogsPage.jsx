import React, { useState, useEffect } from 'react';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';
import client from '../api/client';

// Teaching: Audit logs are append-only records — we never edit or delete them.
// This page reads from the audit_logs table with pagination and action filter.

// All possible action types — used for the filter dropdown
const ACTION_TYPES = [
  { value: '',                      label: 'All Actions' },
  { value: 'LOGIN_SUCCESS',         label: 'Login Success' },
  { value: 'LOGIN_FAILED',          label: 'Login Failed' },
  { value: 'LOGOUT',                label: 'Logout' },
  { value: 'PASSWORD_CHANGED',      label: 'Password Changed' },
  { value: 'PASSWORD_RESET_VIA_OTP',label: 'Password Reset (OTP)' },
  { value: 'OTP_REQUESTED',         label: 'OTP Requested' },
  { value: 'OTP_FAILED',            label: 'OTP Failed' },
  { value: 'USER_CREATED',          label: 'User Created' },
  { value: 'USER_APPROVED',         label: 'User Approved' },
  { value: 'USER_REJECTED',         label: 'User Rejected' },
  { value: 'BULK_USERS_CREATED',    label: 'Bulk Upload' },
];

// Badge colours per action type — green=good, red=bad, yellow=neutral
const ACTION_BADGE = (action) => {
  if (action.includes('FAILED') || action.includes('REJECT')) return 'bg-red-50 text-red-500';
  if (action.includes('SUCCESS') || action.includes('APPROVED') || action.includes('CREATED')) return 'bg-emerald-50 text-emerald-600';
  return 'bg-gray-100 text-gray-500';
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const fetchLogs = async (page = 1, action = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (action) params.append('action', action);
      const res = await client.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filter changes — reset to page 1
  useEffect(() => {
    fetchLogs(1, actionFilter);
  }, [actionFilter]);

  const handlePageChange = (newPage) => {
    fetchLogs(newPage, actionFilter);
  };

  const formatDate = (ts) =>
    new Date(ts).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* Header */}
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">System Records</p>
        <h1 className="text-5xl font-serif text-[#2a0b38] mb-2">Audit Logs</h1>
        <p className="text-gray-500 text-sm">Complete record of all system activity.</p>
      </section>

      {/* Filter bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-6">
        <ScrollText className="text-[#EDA300] shrink-0" />
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Filter by Action</label>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="text-sm border border-gray-100 rounded-sm bg-[#FAFAFA] px-3 py-2 outline-none focus:ring-1 focus:ring-[#2a0b38] text-gray-700"
          >
            {ACTION_TYPES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
        <span className="ml-auto text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          {pagination.total} record{pagination.total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Logs table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-sm">No logs found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-8 py-4">Time</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Action</th>
                <th className="px-8 py-4">Details</th>
                <th className="px-8 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-4 text-[11px] text-gray-400 whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-8 py-4">
                    {log.user_name ? (
                      <div>
                        <p className="text-[12px] font-bold text-[#2a0b38]">{log.user_name}</p>
                        <p className="text-[11px] text-gray-400">{log.user_email}</p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-300">System</span>
                    )}
                  </td>
                  <td className="px-8 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${ACTION_BADGE(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-[11px] text-gray-400 max-w-xs truncate">
                    {/* Teaching: details is JSONB — we stringify for display */}
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                  <td className="px-8 py-4 text-[11px] font-mono text-gray-400">
                    {log.ip_address || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-sm border border-gray-100 text-gray-400 hover:text-[#2a0b38] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-sm border border-gray-100 text-gray-400 hover:text-[#2a0b38] disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;