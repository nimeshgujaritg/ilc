import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const AdminOverview = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, pending_form: 0 });

useEffect(() => {
  client.get('/admin/stats')
    .then(res => setStats(res.data))
    .catch(err => console.error('Failed to fetch stats', err))
    .finally(() => setLoading(false));
}, []);

  const { total: totalCount, pending: pendingCount, approved: approvedCount, pending_form: pendingForm } = stats;

  return (
    <div className="max-w-6xl mx-auto space-y-10">

      {/* Header */}
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Operations Overview</p>
        <h1 className="text-5xl font-serif text-[#2a0b38] mb-2">Welcome, Director.</h1>
        <p className="text-gray-500 text-sm">
          {pendingCount > 0
            ? <>You have <span className="font-bold text-[#2a0b38]">{pendingCount} profile{pendingCount > 1 ? 's' : ''} awaiting approval</span>.</>
            : 'All profiles are up to date.'
          }
        </p>
      </section>

      {/* Stats grid */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            <Users className="text-[#EDA300] mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Members</p>
            <h3 className="text-4xl font-serif text-[#2a0b38]">{totalCount}</h3>
          </div>

          <div className="bg-[#2a0b38] p-8 rounded-xl text-white shadow-xl">
            <Clock className="text-[#EDA300] mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-[#EDA300] font-bold mb-1">Awaiting Approval</p>
            <h3 className="text-4xl font-serif">{pendingCount}</h3>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            <CheckCircle className="text-[#EDA300] mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Approved Members</p>
            <h3 className="text-4xl font-serif text-[#2a0b38]">{approvedCount}</h3>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            <AlertCircle className="text-[#EDA300] mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Form Not Submitted</p>
            <h3 className="text-4xl font-serif text-[#2a0b38]">{pendingForm}</h3>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Quick Actions</p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/admin/members')}
            className="bg-[#2a0b38] hover:bg-[#1a0525] text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
          >
            View All Members
          </button>
          {pendingCount > 0 && (
            <button
              onClick={() => navigate('/admin/members')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              Review {pendingCount} Pending
            </button>
          )}
          <button
            onClick={() => navigate('/admin/members')}
            className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
          >
            Add New Member
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;