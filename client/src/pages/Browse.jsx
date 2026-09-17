import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { SongCard } from '../components/SongCard';
import { LayoutGrid, List as ListIcon } from 'lucide-react';

export const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [songs, setSongs]   = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const selectedGenre = searchParams.get('genre') || '';
  const selectedSort  = searchParams.get('sort')  || 'latest';
  const searchTerm    = searchParams.get('q')     || '';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/songs?genre=${encodeURIComponent(selectedGenre)}&sort=${selectedSort}&search=${encodeURIComponent(searchTerm)}`),
      api.get('/songs/genres'),
    ]).then(([sRes, gRes]) => {
      if (sRes.data.success) setSongs(sRes.data.songs);
      if (gRes.data.success) setGenres(gRes.data.genres);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedGenre, selectedSort, searchTerm]);

  const update = (key, val) => {
    const p = new URLSearchParams(searchParams);
    val ? p.set(key, val) : p.delete(key);
    setSearchParams(p);
  };

  return (
    <div className="space-y-7">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Music Catalogue</h1>
        <p className="text-sm text-neutral-400 mt-1">
          {songs.length} tracks{selectedGenre ? ` in ${selectedGenre}` : ''}
        </p>
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update('genre', '')}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
          style={!selectedGenre
            ? { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff' }
            : { background: 'rgba(255,255,255,0.07)', color: '#a3a3a3' }
          }
        >
          All
        </button>
        {genres.map(g => (
          <button
            key={g.id}
            onClick={() => update('genre', g.name)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={selectedGenre === g.name
              ? { background: g.color || '#7c3aed', color: '#fff', boxShadow: `0 0 12px ${g.color || '#7c3aed'}66` }
              : { background: 'rgba(255,255,255,0.07)', color: '#a3a3a3' }
            }
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Sort */}
        <select
          value={selectedSort}
          onChange={e => update('sort', e.target.value)}
          className="text-sm text-white rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="latest">Newest First</option>
          <option value="popular">Most Played</option>
          <option value="az">Title A–Z</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center rounded-lg overflow-hidden" style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Songs grid / list */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="shimmer rounded-xl h-52" />)}
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-5xl mb-4">🎵</p>
          <h3 className="text-lg font-bold text-white">No songs found</h3>
          <p className="text-sm text-neutral-500 mt-1">Try a different genre or filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {songs.map(s => <SongCard key={s.id} song={s} queue={songs} />)}
        </div>
      ) : (
        <div className="space-y-1 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {songs.map((s, i) => (
            <SongCard key={s.id} song={s} queue={songs} />
          ))}
        </div>
      )}
    </div>
  );
};
