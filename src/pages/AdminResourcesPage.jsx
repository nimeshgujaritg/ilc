import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, ChevronRight, BookOpen, Image } from 'lucide-react';
import client from '../api/client';
import ImageUpload from '../components/ImageUpload';

const CATEGORIES = ['Article', 'Report', 'Video', 'Tool'];
const EMPTY_RESOURCE = { title: '', description: '', link: '', category: 'Article', image_url: '' };
const EMPTY_GLIMPSE = { photo_url: '', caption: '', event_name: '' };

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [glimpses, setGlimpses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceForm, setResourceForm] = useState(EMPTY_RESOURCE);
  const [resourceError, setResourceError] = useState('');
  const [savingResource, setSavingResource] = useState(false);
  const [showGlimpseModal, setShowGlimpseModal] = useState(false);
  const [glimpseForm, setGlimpseForm] = useState(EMPTY_GLIMPSE);
  const [glimpseError, setGlimpseError] = useState('');
  const [savingGlimpse, setSavingGlimpse] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    try {
      const [rRes, gRes] = await Promise.all([
        client.get('/resources'),
        client.get('/glimpses'),
      ]);
      setResources(rRes.data.resources);
      setGlimpses(gRes.data.glimpses);
    } catch (err) {
      console.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveResource = async () => {
    if (!resourceForm.title.trim()) return setResourceError('Title is required.');
    setSavingResource(true);
    setResourceError('');
    try {
      await client.post('/resources', resourceForm);
      await fetchAll();
      setShowResourceModal(false);
      setResourceForm(EMPTY_RESOURCE);
    } catch (err) {
      setResourceError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSavingResource(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    setDeletingId(id);
    try {
      await client.delete(`/resources/${id}`);
      setResources(p => p.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveGlimpse = async () => {
    if (!glimpseForm.photo_url) return setGlimpseError('Photo is required.');
    setSavingGlimpse(true);
    setGlimpseError('');
    try {
      await client.post('/glimpses', glimpseForm);
      await fetchAll();
      setShowGlimpseModal(false);
      setGlimpseForm(EMPTY_GLIMPSE);
    } catch (err) {
      setGlimpseError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSavingGlimpse(false);
    }
  };

  const handleDeleteGlimpse = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    setDeletingId(id);
    try {
      await client.delete(`/glimpses/${id}`);
      setGlimpses(p => p.filter(g => g.id !== id));
    } catch (err) {
      alert('Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  const inputBase = 'block w-full px-4 py-3 border border-gray-100 rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#2a0b38] transition-all';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="py-12 space-y-16">

      {/* ── RESOURCES */}
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Admin</p>
            <h1 className="text-4xl font-serif text-[#2a0b38]">Knowledge Hub</h1>
            <p className="text-gray-400 text-sm mt-2">Manage resources for ILC members.</p>
          </div>
          <button
            onClick={() => { setShowResourceModal(true); setResourceError(''); }}
            className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        </div>

        {resources.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No resources yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {resources.map(r => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                {r.image_url && (
                  <img src={r.image_url} alt={r.title} className="w-full h-36 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {r.category}
                      </span>
                      <p className="text-sm font-bold text-[#2a0b38] mt-2">{r.title}</p>
                      {r.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteResource(r.id)}
                      disabled={deletingId === r.id}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── GLIMPSES */}
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Admin</p>
            <h2 className="text-4xl font-serif text-[#2a0b38]">Glimpses</h2>
            <p className="text-gray-400 text-sm mt-2">Manage event photos for the gallery.</p>
          </div>
          <button
            onClick={() => { setShowGlimpseModal(true); setGlimpseError(''); }}
            className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Photo
          </button>
        </div>

        {glimpses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
            <Image className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No photos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {glimpses.map(g => (
              <div key={g.id} className="relative group rounded-xl overflow-hidden aspect-square shadow-sm">
                <img src={g.photo_url} alt={g.caption || 'Glimpse'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <button
                    onClick={() => handleDeleteGlimpse(g.id)}
                    disabled={deletingId === g.id}
                    className="opacity-0 group-hover:opacity-100 transition-all bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {g.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2">
                    <p className="text-white text-[10px] truncate">{g.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RESOURCE MODAL */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-[#2a0b38]">Add Resource</h2>
              <button onClick={() => setShowResourceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              {resourceError && (
                <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                  <p className="text-xs text-red-600">{resourceError}</p>
                </div>
              )}
              <ImageUpload
                value={resourceForm.image_url}
                onChange={url => setResourceForm(p => ({ ...p, image_url: url }))}
                label="Resource Image (optional)"
              />
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Title *</label>
                <input
                  value={resourceForm.title}
                  onChange={e => setResourceForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. India Economic Outlook 2026"
                  className={inputBase}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Category</label>
                <select
                  value={resourceForm.category}
                  onChange={e => setResourceForm(p => ({ ...p, category: e.target.value }))}
                  className={inputBase}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Description</label>
                <textarea
                  value={resourceForm.description}
                  onChange={e => setResourceForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description..."
                  className={`${inputBase} resize-none`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Link URL</label>
                <input
                  value={resourceForm.link}
                  onChange={e => setResourceForm(p => ({ ...p, link: e.target.value }))}
                  placeholder="https://..."
                  className={inputBase}
                />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowResourceModal(false)} className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleSaveResource}
                disabled={savingResource}
                className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white px-8 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest"
              >
                {savingResource ? 'Saving...' : 'Add Resource'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLIMPSE MODAL */}
      {showGlimpseModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-[#2a0b38]">Add Photo</h2>
              <button onClick={() => setShowGlimpseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              {glimpseError && (
                <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                  <p className="text-xs text-red-600">{glimpseError}</p>
                </div>
              )}
              <ImageUpload
                value={glimpseForm.photo_url}
                onChange={url => setGlimpseForm(p => ({ ...p, photo_url: url }))}
                label="Photo *"
              />
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Event Name</label>
                <input
                  value={glimpseForm.event_name}
                  onChange={e => setGlimpseForm(p => ({ ...p, event_name: e.target.value }))}
                  placeholder="e.g. ILC Leadership Summit 2026"
                  className={inputBase}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Caption</label>
                <input
                  value={glimpseForm.caption}
                  onChange={e => setGlimpseForm(p => ({ ...p, caption: e.target.value }))}
                  placeholder="e.g. Opening keynote session"
                  className={inputBase}
                />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowGlimpseModal(false)} className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleSaveGlimpse}
                disabled={savingGlimpse}
                className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white px-8 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest"
              >
                {savingGlimpse ? 'Saving...' : 'Add Photo'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResourcesPage;