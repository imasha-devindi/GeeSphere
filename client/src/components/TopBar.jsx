import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronLeft, ChevronRight, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';

export const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3 shrink-0"
      style={{ background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Left side: Navigation arrows & Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        {/* Nav History Arrows */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            title="Go Forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search songs, artists, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-full pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </form>
      </div>

      {/* Right side: User Profile / Auth */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600/15 text-violet-300 border border-violet-500/20 hover:bg-violet-600/25 transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
                title={user.full_name}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
                >
                  {user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {isAdmin ? 'Admin' : 'Listener'}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {/* User info in dropdown */}
                  <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-violet-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
