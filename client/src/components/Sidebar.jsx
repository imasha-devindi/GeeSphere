import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlayer, getFullMediaUrl } from '../context/PlayerContext';
import {
  Home, Search, Library, Heart, ListMusic,
  Plus, ChevronRight, LayoutDashboard,
  Music, Disc3
} from 'lucide-react';

export const Sidebar = ({ onCreatePlaylist }) => {
  const { user, isAdmin } = useAuth();
  const { currentSong, isPlaying } = usePlayer();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: '/',        icon: Home,      label: 'Home' },
    { to: '/search',  icon: Search,    label: 'Search' },
    { to: '/browse',  icon: Library,   label: 'Browse' },
  ];

  const userItems = user ? [
    { to: '/favorites', icon: Heart,     label: 'Liked Songs', color: 'text-rose-400' },
    { to: '/playlists', icon: ListMusic, label: 'Playlists',   color: 'text-violet-400' },
  ] : [];

  return (
    <aside
      className={`fixed left-0 top-0 h-full flex flex-col z-30 transition-all duration-300 select-none overflow-y-auto overflow-x-hidden ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
      style={{
        background: '#111111',
        paddingBottom: currentSong ? '96px' : '16px'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
        >
          <Disc3 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-extrabold text-lg leading-none tracking-tight">
              GeeSphere
            </span>
            <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Music Universe</p>
          </div>
        )}
      </div>

      {/* Primary Nav */}
      <nav className="px-2 space-y-0.5 shrink-0">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              isActive(to)
                ? 'bg-white/10 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive(to) ? 'text-white' : ''}`} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 border-t border-white/5 shrink-0" />

      {/* Library Section */}
      <div className="flex items-center justify-between px-4 mb-2 shrink-0">
        {!collapsed && (
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Your Library
          </span>
        )}
        {user && !collapsed && (
          <button
            onClick={onCreatePlaylist}
            className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title="New Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="px-2 space-y-0.5 shrink-0">
        {userItems.map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              isActive(to)
                ? 'bg-white/10 text-white'
                : `text-neutral-400 hover:text-white hover:bg-white/5`
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive(to) ? 'text-white' : color}`} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {!user && !collapsed && (
          <div className="mx-1 mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-neutral-400 mb-2">Sign in to view your playlists & favorites</p>
            <Link
              to="/login"
              className="block text-center py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
            >
              Sign In
            </Link>
          </div>
        )}

        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              location.pathname.startsWith('/admin')
                ? 'bg-violet-500/20 text-violet-300'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-violet-400" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Now Playing Mini (in sidebar) */}
      {currentSong && !collapsed && (
        <div
          className="mx-3 mb-3 p-3 rounded-xl flex items-center gap-2.5 border border-white/5"
          style={{ background: '#1a1a1a' }}
        >
          <div className={`relative w-9 h-9 rounded-lg overflow-hidden shrink-0 ${isPlaying ? 'now-playing-glow' : ''}`}>
            <img
              src={getFullMediaUrl(currentSong.cover_image)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format'; }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-[10px] text-neutral-500 truncate">{currentSong.artist_name}</p>
          </div>
          {isPlaying && (
            <div className="ml-auto flex items-end gap-0.5 shrink-0 h-4">
              <span className="w-1 bg-violet-400 animate-eq-1 rounded-full" />
              <span className="w-1 bg-violet-400 animate-eq-2 rounded-full" />
              <span className="w-1 bg-violet-400 animate-eq-3 rounded-full" />
            </div>
          )}
        </div>
      )}

    </aside>
  );
};
