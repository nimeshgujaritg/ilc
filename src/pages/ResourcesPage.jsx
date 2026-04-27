import React, { useEffect, useState } from 'react';
import { ExternalLink, BookOpen, Image, X } from 'lucide-react';
import client from '../api/client';

const CATEGORIES = ['All', 'Article', 'Report', 'Video', 'Tool'];

const CATEGORY_COLORS = {
  Article: 'bg-blue-50 text-blue-600 border-blue-200',
  Report:  'bg-purple-50 text-purple-600 border-purple-200',
  Video:   'bg-red-50 text-red-600 border-red-200',
  Tool:    'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [glimpses, setGlimpses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rRes, gRes] = await Promise.all([
          client.get('/resources'),
          client.get('/glimpses'),
        ]);
        setResources(rRes.data.resources);
        setGlimpses(gRes.data.glimpses);
      } catch (err) {
        console.error('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredResources = activeCategory === 'All'
    ? resources
    : resources.filter(r => r.category === activeCategory);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );

  return (
    <div className="py-12 space-y-16">

      {/* ── RESOURCES */}
      <div className="space-y-8">
        <div>
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Library</p>
          <h1 className="text-4xl font-serif text-[#2a0b38]">Knowledge Hub</h1>
          <p className="text-gray-400 text-sm mt-2">Curated resources exclusively for ILC members.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'bg-[#1a0525] text-white'
                  : 'bg-white border border-gray-200 text-gray-400 hover:border-[#1a0525] hover:text-[#1a0525]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredResources.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No resources in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredResources.map(resource => (
              <div
                key={resource.id}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2a0b38]/20 transition-all group"
              >
                {/* Resource image */}
                {resource.image_url ? (
                  <img
                    src={resource.image_url}
                    alt={resource.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-[#1a0525] to-[#2a0b38] flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-[#EDA300]/30" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${
                      CATEGORY_COLORS[resource.category] || 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {resource.category}
                    </span>
                    {resource.link && (
                      <button
                        onClick={() => window.open(resource.link, '_blank')}
                        className="text-gray-300 hover:text-[#EDA300] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-serif text-[#2a0b38] mb-2 group-hover:text-[#1a0525]">
                    {resource.title}
                  </h3>

                  {resource.description && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {resource.description}
                    </p>
                  )}

                  {resource.link && (
                    <button
                      onClick={() => window.open(resource.link, '_blank')}
                      className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest text-[#2a0b38] hover:text-[#EDA300] transition-colors"
                    >
                      View Resource
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── GLIMPSES */}
      <div className="space-y-8">
        <div>
          <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-2">Gallery</p>
          <h2 className="text-4xl font-serif text-[#2a0b38]">Glimpses</h2>
          <p className="text-gray-400 text-sm mt-2">Moments from exclusive ILC events.</p>
        </div>

        {glimpses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
            <Image className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No glimpses added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {glimpses.map(glimpse => (
              <button
                key={glimpse.id}
                onClick={() => setLightbox(glimpse)}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  src={glimpse.photo_url}
                  alt={glimpse.caption || 'ILC Event'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#1a0525]/0 group-hover:bg-[#1a0525]/60 transition-all duration-300 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-left">
                    {glimpse.event_name && (
                      <p className="text-[#EDA300] text-[9px] font-bold uppercase tracking-widest mb-1">
                        {glimpse.event_name}
                      </p>
                    )}
                    {glimpse.caption && (
                      <p className="text-white text-xs font-medium leading-tight">
                        {glimpse.caption}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.photo_url}
              alt={lightbox.caption || 'ILC Event'}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {(lightbox.caption || lightbox.event_name) && (
              <div className="text-center mt-4">
                {lightbox.event_name && (
                  <p className="text-[#EDA300] text-[10px] font-bold uppercase tracking-widest mb-1">
                    {lightbox.event_name}
                  </p>
                )}
                {lightbox.caption && (
                  <p className="text-white text-sm">{lightbox.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;