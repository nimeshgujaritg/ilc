import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import client from '../api/client';

const TYPE_COLORS = {
  General:   'bg-blue-50 text-blue-600 border-blue-200',
  Event:     'bg-purple-50 text-purple-600 border-purple-200',
  Important: 'bg-red-50 text-red-600 border-red-200',
};

const TYPE_ICONS = {
  General:   '📢',
  Event:     '📅',
  Important: '🔴',
};

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchAnnouncements();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="py-12 space-y-10">
      <div>
        <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Updates</p>
        <h1 className="text-4xl font-serif text-[#2a0b38]">Announcements</h1>
        <p className="text-gray-400 text-sm mt-2">Latest updates from the India Leadership Council.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
          <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No announcements yet.</p>
          <p className="text-gray-300 text-xs mt-1">Check back soon for updates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div
              key={a.id}
              className={`bg-white border rounded-xl p-6 lg:p-8 shadow-sm transition-all ${
                a.type === 'Important' ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl shrink-0">{TYPE_ICONS[a.type] || '📢'}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${TYPE_COLORS[a.type] || TYPE_COLORS.General}`}>
                      {a.type}
                    </span>
                    <span className="text-[10px] text-gray-300">
                      {new Date(a.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-[#2a0b38]">{a.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{a.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;