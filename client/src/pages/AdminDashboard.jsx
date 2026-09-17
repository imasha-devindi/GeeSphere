import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Music, 
  Users, 
  Play, 
  Download, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  BarChart3,
  Upload
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('songs'); // 'songs' | 'users'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, songsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/songs?limit=50')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (songsRes.data.success) setSongs(songsRes.data.songs);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    try {
      await api.delete(`/admin/songs/${id}`);
      setSongs(songs.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete song');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-status`);
      setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            <span>GeeSphere Admin Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage music library, uploads, and registered users</p>
        </div>

        <Link
          to="/admin/upload"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Song (YouTube / MP3)</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <Music className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Catalogue</span>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalSongs || 0}</p>
          <p className="text-xs text-slate-400">Total Songs</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-indigo-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Community</span>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-slate-400">Registered Users</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <Play className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Engagement</span>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalPlays || 0}</p>
          <p className="text-xs text-slate-400">Total Streams</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <Download className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Downloads</span>
          </div>
          <p className="text-2xl font-extrabold text-white">{stats?.totalDownloads || 0}</p>
          <p className="text-xs text-slate-400">MP3 Downloads</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex space-x-6">
        <button
          onClick={() => setActiveTab('songs')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'songs' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Song Library Management ({songs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* Songs Table */}
      {activeTab === 'songs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Song Title</th>
                <th className="p-4">Artist</th>
                <th className="p-4">Genre</th>
                <th className="p-4">Plays</th>
                <th className="p-4">Downloads</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {songs.map(song => (
                <tr key={song.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-semibold text-white flex items-center space-x-3">
                    <img src={song.cover_image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span>{song.title}</span>
                  </td>
                  <td className="p-4">{song.artist_name || 'Unknown'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {song.genre_name || 'Pop'}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{song.plays || 0}</td>
                  <td className="p-4 font-mono">{song.downloads || 0}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteSong(song.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-semibold text-white">{u.full_name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      u.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.is_active ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          u.is_active ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
