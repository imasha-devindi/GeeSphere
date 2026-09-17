import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { SongCard } from '../components/SongCard';
import { Heart, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    api.get('/user/favorites')
      .then(res => { if (res.data.success) setFavorites(res.data.favorites); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 flex items-end min-h-[180px]"
        style={{ background: 'linear-gradient(135deg,#4c1d95,#831843,#1a1a1a)' }}
      >
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl opacity-30" style={{ background: '#ec4899' }} />
        <div className="relative z-10 flex items-end justify-between w-full">
          <div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Collection</p>
            <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
              <Heart className="w-8 h-8 fill-rose-400 text-rose-400" />
              Liked Songs
            </h1>
            <p className="text-sm text-white/50 mt-2">{favorites.length} songs</p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => playSong(favorites[0], favorites)}
              className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Songs */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer rounded-xl h-52" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-5xl mb-4">🎵</p>
          <h3 className="text-lg font-bold text-white">No liked songs yet</h3>
          <p className="text-sm text-neutral-500 mt-1">Click the ❤️ on any song to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {favorites.map(s => <SongCard key={s.id} song={s} queue={favorites} />)}
        </div>
      )}
    </div>
  );
};
