import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ListMusic, Plus, Trash2, ExternalLink, Play, Music } from 'lucide-react';
import { SongCard } from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';

export const Playlist = ({ createOpen, onCreateClose }) => {
  const [playlists, setPlaylists]         = useState([]);
  const [selectedPlaylist, setSelected]   = useState(null);
  const [playlistSongs, setSongs]         = useState([]);
  const [showCreate, setShowCreate]       = useState(false);
  const [newName, setNewName]             = useState('');
  const [loading, setLoading]             = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => { fetchPlaylists(); }, []);

  // allow parent (Sidebar +button) to open create modal
  useEffect(() => {
    if (createOpen) { setShowCreate(true); if (onCreateClose) onCreateClose(); }
  }, [createOpen]);

  const fetchPlaylists = () => {
    api.get('/user/playlists')
      .then(res => {
        if (res.data.success) {
          setPlaylists(res.data.playlists);
          if (res.data.playlists.length > 0) selectPlaylist(res.data.playlists[0].id);
          else { setSelected(null); setSongs([]); }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const selectPlaylist = (id) => {
    api.get(`/user/playlists/${id}`)
      .then(res => {
        if (res.data.success) { setSelected(res.data.playlist); setSongs(res.data.songs); }
      });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post('/user/playlists', { name: newName });
      setNewName('');
      setShowCreate(false);
      fetchPlaylists();
    } catch { alert('Error creating playlist'); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;
    await api.delete(`/user/playlists/${id}`).catch(() => {});
    fetchPlaylists();
  };

  const handleRemoveSong = async (songId) => {
    if (!selectedPlaylist) return;
    await api.delete(`/user/playlists/${selectedPlaylist.id}/songs/${songId}`).catch(() => {});
    setSongs(p => p.filter(s => s.id !== songId));
  };

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="shimmer rounded-xl h-24" />)}
    </div>
  );

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Playlists</h1>
          <p className="text-sm text-neutral-400 mt-1">{playlists.length} playlists</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
        >
          <Plus className="w-4 h-4" /> New Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-5xl mb-4">🎵</p>
          <h3 className="text-lg font-bold text-white">No playlists yet</h3>
          <p className="text-sm text-neutral-500 mt-1 mb-5">Create a playlist to organize your music.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
          >
            + Create Playlist
          </button>
        </div>
      ) : (
        <>
          {/* Playlist tabs */}
          <div className="flex flex-wrap gap-2">
            {playlists.map(p => (
              <div key={p.id} className="relative group/tab">
                <button
                  onClick={() => selectPlaylist(p.id)}
                  className="pl-4 pr-8 py-2 rounded-full text-sm font-semibold transition-all"
                  style={selectedPlaylist?.id === p.id
                    ? { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.07)', color: '#a3a3a3' }
                  }
                >
                  {p.name} ({p.song_count || 0})
                </button>
                <button
                  onClick={e => handleDelete(e, p.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-white opacity-0 group-hover/tab:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Songs area */}
          {selectedPlaylist && (
            <div className="space-y-4">
              {/* Playlist banner */}
              <div
                className="relative overflow-hidden rounded-2xl p-6 flex items-end min-h-[140px]"
                style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81,#1a1a1a)' }}
              >
                <div className="relative z-10 flex items-end justify-between w-full">
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Playlist</p>
                    <h2 className="text-2xl font-extrabold text-white">{selectedPlaylist.name}</h2>
                    <p className="text-sm text-white/40 mt-1">{playlistSongs.length} songs</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {playlistSongs.length > 0 && (
                      <button
                        onClick={() => playSong(playlistSongs[0], playlistSongs)}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    )}
                    <Link
                      to="/browse"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/60 hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <ExternalLink className="w-3 h-3" /> Add Songs
                    </Link>
                  </div>
                </div>
              </div>

              {playlistSongs.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Music className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
                  <p className="text-sm text-neutral-400">No songs yet.</p>
                  <Link to="/browse" className="inline-block mt-3 text-xs font-bold text-violet-400 hover:text-violet-300">
                    Browse to add songs →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {playlistSongs.map(s => (
                    <div key={s.id} className="relative group/song">
                      <SongCard song={s} queue={playlistSongs} />
                      <button
                        onClick={() => handleRemoveSong(s.id)}
                        className="absolute top-2 right-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-rose-500 text-white opacity-0 group-hover/song:opacity-100 transition-opacity shadow"
                        title="Remove"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-sm rounded-2xl p-7 space-y-5 shadow-2xl"
            style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-xl font-bold text-white">New Playlist</h3>
            <input
              type="text"
              placeholder="My Playlist"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              required
              className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder-neutral-600 outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
