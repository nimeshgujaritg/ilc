import React from 'react';
import { Users, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Operations Overview</p>
        <h1 className="text-5xl font-serif text-[#2a0b38] mb-2">Welcome, Director.</h1>
        <p className="text-gray-500 text-sm">You have <span className="font-bold text-[#2a0b38]">8 pending membership approvals</span> today.</p>
      </section>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <Users className="text-[#EDA300] mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Members</p>
          <h3 className="text-4xl font-serif text-[#2a0b38]">1,284</h3>
        </div>
        <div className="bg-[#2a0b38] p-8 rounded-xl text-white shadow-xl">
          <Activity className="text-[#EDA300] mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-[#EDA300] font-bold mb-1">Active Fees</p>
          <h3 className="text-4xl font-serif">₹4.2Cr</h3>
        </div>
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <FileText className="text-[#EDA300] mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Pending Tasks</p>
          <h3 className="text-4xl font-serif text-[#2a0b38]">14</h3>
        </div>
      </div>

      <section className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-serif text-xl text-[#2a0b38]">Recent Activity</h3>
          <button className="text-[10px] font-bold text-[#EDA300] uppercase tracking-widest">View Audit Log</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            <tr>
              <th className="px-8 py-4">Member</th>
              <th className="px-8 py-4">Action</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-5 text-sm font-bold text-[#2a0b38]">Executive Member #{i}</td>
                <td className="px-8 py-5 text-sm text-gray-500">Profile Update Requested</td>
                <td className="px-8 py-5">
                  <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Pending</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;