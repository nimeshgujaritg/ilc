import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Pencil, Trash2, X, ChevronRight } from 'lucide-react';
import client from '../api/client';
import ImageUpload from '../components/ImageUpload';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const EMPTY_FORM = {
  title: '', date: '', time: '', location: '',
  description: '', capacity: '', calendly_link: '', image_url: ''
};

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await client.get('/events');
      setEvents(res.data.events);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title:         event.title || '',
      date:          event.date ? event.date.split('T')[0] : '',
      time:          event.time ? event.time.slice(0, 5) : '',
      location:      event.location || '',
      description:   event.description || '',
      capacity:      event.capacity || '',
      calendly_link: event.calendly_link || '',
      image_url:     event.image_url || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return setFormError('Title is required.');
    if (!form.date) return setFormError('Date is required.');
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title:         form.title.trim(),
        date:          form.date,
        time:          form.time || null,
        location:      form.location.trim() || null,
        description:   form.description.trim() || null,
        capacity:      form.capacity ? parseInt(form.capacity) : null,
        calendly_link: form.calendly_link.trim() || null,
        image_url:     form.image_url || null,
      };
      if (editingEvent) {
        await client.put(`/events/${editingEvent.id}`, payload);
      } else {
        await client.post('/events', payload);
      }
      await fetchEvents();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? All bookings will also be removed.')) return;
    setDeletingId(id);
    try {
      await client.delete(`/events/${id}`);
      setEvents(p => p.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  const inputBase = 'block w-full px-4 py-3 border border-gray-100 rounded-sm bg-[#FAFAFA] text-sm text-gray-800 outline-none focus:ring-1 focus:ring-[#2a0b38] transition-all';

  return (
    <div className="py-12 space-y-10">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Admin</p>
          <h1 className="text-4xl font-serif text-[#2a0b38]">Manage Events</h1>
          <p className="text-gray-400 text-sm mt-2">Create and manage events for ILC members.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] text-white px-6 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-400 text-sm">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No events yet.</p>
          <button onClick={openCreate} className="mt-4 text-[11px] font-bold uppercase tracking-widest text-[#2a0b38] underline">
            Create your first event
          </button>
        </div>
      )}

      {/* Events grid — card format */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Event image */}
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-[#1a0525] flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-[#EDA300]/30" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[#EDA300] text-[9px] font-bold uppercase tracking-widest mb-1">
                      {formatDate(event.date)}
                    </p>
                    <h3 className="text-lg font-serif text-[#2a0b38] leading-tight">
                      {event.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(event)}
                      className="p-2 text-gray-400 hover:text-[#2a0b38] transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {event.location && <span>📍 {event.location}</span>}
                  <span>👥 {event.booking_count}{event.capacity ? ` / ${event.capacity}` : ''} bookings</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-[#2a0b38]">
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                  <p className="text-xs text-red-600">{formError}</p>
                </div>
              )}

              {/* Image upload */}
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm(p => ({ ...p, image_url: url }))}
                label="Event Photo"
              />

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. ILC Leadership Summit 2026"
                  className={inputBase}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} className={inputBase} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Time</label>
                  <input type="time" name="time" value={form.time} onChange={handleChange} className={inputBase} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. The Taj Mahal Palace, Mumbai" className={inputBase} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the event..." className={`${inputBase} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Capacity</label>
                  <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 50" min="1" className={inputBase} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">Calendly Link</label>
                  <input name="calendly_link" value={form.calendly_link} onChange={handleChange} placeholder="https://calendly.com/..." className={inputBase} />
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={closeModal} className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#2a0b38] hover:bg-[#1a0525] disabled:opacity-50 text-white px-8 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-all"
              >
                {saving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                <ChevronRight className="w-4 h-4 text-[#EDA300]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsPage;