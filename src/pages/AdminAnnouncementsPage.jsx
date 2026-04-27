import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, ChevronRight, Megaphone } from 'lucide-react';
import client from '../api/client';

const TYPES = ['General', 'Event', 'Important'];

const TYPE_COLORS = {
  General:   'bg-blue-50 text-blue-600 border-blue-200',
  Event:     'bg-purple-50 text-purple-600 border-purple-200',
  Important: 'bg-red-50 text-red-600 border-red-200',
};

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'General' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await client.get('/announcements');
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.post('/announcements', form);
      await fetchAnnouncements();
      setShowModal(false);
      setForm({ title: '', content: '', type: 'General' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    setDeletingId(id);
    try {
      await client.delete(`/announcements/${id}`);
      setAnnouncements(p => p.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const inputBase = 'block w-full px-4 py-3 border border-gray-100 rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#2a0b38] transition-all';

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Communications</p>
          <h1 className="text-5xl font-serif text-[#2a0b38]">Announcements</h1>
          <p className="text-gray-400 text-sm mt-2">Post announcements visible to all CEO members.</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
          <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No announcements yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-[11px] font-bold uppercase tracking-widest text-[#2a0b38] underline"
          >
            Create first announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${TYPE_COLORS[a.type] || TYPE_COLORS.General}`}>
                      {a.type}
                    </span>
                    <span className="text-[10px] text-gray-300">
                      {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif text-[#2a0b38]">{a.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-[#2a0b38]">New Announcement</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className={inputBase}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. ILC Annual Summit 2026 — Save the Date"
                  className={inputBase}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Content *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  rows={6}
                  placeholder="Write your announcement here..."
                  className={`${inputBase} resize-none`}
                />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white px-8 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest"
              >
                {saving ? 'Posting...' : 'Post Announcement'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementsPage;