import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, getFullMediaUrl } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Heart, ListPlus, Check, X } from 'lucide-react';
import api from '../services/api';

export const SongCard = ({ song, queue = [] }) => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [addedIds, setAddedIds] = useState({});
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);

  if (!song) return null;

  const isCurrent = currentSong?.id === song.id;

  useEffect(() => {
    if (!showPlaylistMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowPlaylistMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPlaylistMenu]);

  const handlePlay = (e) => {
    if (e) e.stopPropagation();
    isCurrent ? togglePlayPause() : playSong(song, queue.length > 0 ? queue : [song]);
  };

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!user) { alert('Please sign in to like songs.'); return; }
    try {
      const res = await api.post('/user/favorites/toggle', { songId: song.id });
      setIsFav(res.data.isFavorite);
    } catch {}
  };

  const openPlaylistMenu = async (e) => {
    e.stopPropagation();
    if (!user) { alert('Please sign in first.'); return; }
    try {
      const res = await api.get('/user/playlists');
      if (res.data.success) { setPlaylists(res.data.playlists); setShowPlaylistMenu(true); }
    } catch {}
  };

  const addToPlaylist = async (e, pid) => {
    e.stopPropagation();
    try {
      await api.post(`/user/playlists/${pid}/songs`, { songId: song.id });
      setAddedIds(p => ({ ...p, [pid]: true }));
      setShowPlaylistMenu(false);
      showToastMsg('Added to playlist ✓');
    } catch (err) {
      const msg = err.response?.data?.message;
      showToastMsg(msg === 'Song already in playlist' ? 'Already in playlist' : 'Error');
      setShowPlaylistMenu(false);
    }
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div
      onClick={handlePlay}
      className="gs-card group relative rounded-xl cursor-pointer overflow-hidden"
      style={{ background: '#181818' }}
    >
      {/* Toast */}
      {toast && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap pointer-events-none shadow-lg"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
        >
          {toast}
        </div>
      )}

      {/* Cover */}
      <div className="relative aspect-square w-full overflow-hidden" style={{ background: '#282828' }}>
        <img
          src={getFullMediaUrl(song.cover_image)}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'; }}
        />

        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            type="button"
            onClick={handlePlay}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
          >
            {isCurrent && isPlaying
              ? <Pause className="w-5 h-5 fill-current" />
              : <Play className="w-5 h-5 fill-current ml-0.5" />
            }
          </button>
        </div>

        {/* Genre badge */}
        {song.genre_name && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold text-white backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.6)', borderLeft: `3px solid ${song.genre_color || '#7c3aed'}` }}
          >
            {song.genre_name}
          </span>
        )}

        {/* Now-playing indicator */}
        {isCurrent && isPlaying && (
          <div className="absolute bottom-2 right-2 flex items-end gap-0.5 h-4">
            <span className="w-1 bg-violet-400 animate-eq-1 rounded-full" />
            <span className="w-1 bg-violet-400 animate-eq-2 rounded-full" />
            <span className="w-1 bg-violet-400 animate-eq-3 rounded-full" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-0.5">
        <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-violet-400' : 'text-white'}`}>
          {song.title}
        </h3>
        <p className="text-xs text-neutral-400 truncate">{song.artist_name || 'Unknown Artist'}</p>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              type="button"
              onClick={handleFav}
              className={`transition-colors ${isFav ? 'text-rose-400' : 'text-neutral-500 hover:text-rose-400'}`}
              title="Like"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
            </button>

            {/* Add to playlist */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={openPlaylistMenu}
                className="text-neutral-500 hover:text-violet-400 transition-colors"
                title="Add to Playlist"
              >
                <ListPlus className="w-3.5 h-3.5" />
              </button>

              {showPlaylistMenu && (
                <div
                  onClick={e => e.stopPropagation()}
                  className="absolute bottom-7 left-0 z-50 rounded-xl shadow-2xl min-w-[160px] py-1 overflow-hidden"
                  style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                    <span className="text-[11px] font-bold text-neutral-300">Add to Playlist</span>
                    <button onClick={e => { e.stopPropagation(); setShowPlaylistMenu(false); }} className="text-neutral-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {playlists.length === 0 ? (
                    <p className="px-3 py-3 text-[11px] text-neutral-500 text-center">No playlists yet.</p>
                  ) : (
                    playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={e => addToPlaylist(e, pl.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-[12px] text-neutral-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                      >
                        <span className="truncate">{pl.name}</span>
                        {addedIds[pl.id] && <Check className="w-3 h-3 text-emerald-400 ml-2 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <span className="text-[10px] text-neutral-600">{song.plays || 0} plays</span>
        </div>
      </div>
    </div>
  );
};
