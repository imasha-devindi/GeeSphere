import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayer, getFullMediaUrl } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1,
  FileText, Download, Clock, Maximize2
} from 'lucide-react';
import api from '../services/api';

export const AudioPlayer = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const {
    currentSong, isPlaying, currentTime, duration,
    volume, isMuted, isShuffle, repeatMode,
    togglePlayPause, nextSong, prevSong, seekTo,
    setVolume, setIsMuted, toggleShuffle, toggleRepeatMode,
    setShowLyrics, setSleepTimerMinutes, sleepTimerMinutes
  } = usePlayer();

  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [timerMenuOpen, setTimerMenuOpen] = useState(false);
  const progressRef = useRef(null);

  if (!currentSong || isAuthPage) return null;

  const pct = duration ? (currentTime / duration) * 100 : 0;

  const formatTime = (s) => {
    if (isNaN(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    seekTo(ratio * duration);
  };

  const handleDownload = async () => {
    if (!user) { alert('Please sign in to download.'); return; }
    try {
      setDownloading(true);
      const res = await api.get(`/user/download/${currentSong.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSong.artist_name || 'Artist'} - ${currentSong.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
      style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.07)', height: '90px' }}
    >
      {/* Progress bar — clickable thin line at very top */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="w-full h-1 cursor-pointer group relative shrink-0"
        style={{ background: '#333' }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right,#7c3aed,#ec4899)'
          }}
        />
        {/* Thumb dot on hover */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `${pct}%`, transform: 'translate(-50%,-50%)' }}
        />
      </div>

      {/* Player body */}
      <div className="flex items-center justify-between px-4 flex-1">

        {/* LEFT — Song info */}
        <div className="flex items-center gap-3 w-[28%] min-w-0">
          <div className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg ${isPlaying ? 'now-playing-glow' : ''}`}>
            <img
              src={getFullMediaUrl(currentSong.cover_image)}
              alt={currentSong.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format'; }}
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1.5 gap-0.5">
                <span className="w-1 bg-violet-400 animate-eq-1 rounded-full" />
                <span className="w-1 bg-violet-400 animate-eq-2 rounded-full" />
                <span className="w-1 bg-violet-400 animate-eq-3 rounded-full" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-xs text-neutral-400 truncate">{currentSong.artist_name || 'Unknown Artist'}</p>
          </div>
        </div>

        {/* CENTER — Controls */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[44%]">
          {/* Buttons row */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? 'text-violet-400' : 'text-neutral-400 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button onClick={prevSong} className="text-neutral-300 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
            >
              {isPlaying
                ? <Pause className="w-5 h-5 fill-current" />
                : <Play className="w-5 h-5 fill-current ml-0.5" />
              }
            </button>

            <button onClick={nextSong} className="text-neutral-300 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={`transition-colors ${repeatMode !== 'off' ? 'text-violet-400' : 'text-neutral-400 hover:text-white'}`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Time row */}
          <div className="flex items-center gap-2 w-full text-[11px] text-neutral-500">
            <span className="w-8 text-right shrink-0">{formatTime(currentTime)}</span>
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 rounded-full cursor-pointer relative group"
              style={{ background: '#333' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: 'linear-gradient(to right,#7c3aed,#ec4899)' }}
              />
            </div>
            <span className="w-8 shrink-0">{formatTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT — Extra controls */}
        <div className="flex items-center justify-end gap-2 w-[28%]">
          {/* Lyrics */}
          <button
            onClick={() => setShowLyrics(true)}
            className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors relative"
            title="Lyrics"
          >
            <FileText className="w-4 h-4" />
            {currentSong.lyrics && (
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: '#7c3aed' }}
              />
            )}
          </button>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => setTimerMenuOpen(!timerMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${sleepTimerMinutes ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'}`}
              title="Sleep Timer"
            >
              <Clock className="w-4 h-4" />
            </button>
            {timerMenuOpen && (
              <div
                className="absolute right-0 bottom-12 w-40 rounded-xl shadow-2xl py-2 z-50 text-xs"
                style={{ background: '#282828', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="px-3 py-1 font-bold text-neutral-400 border-b border-white/5 mb-1 uppercase tracking-wider text-[10px]">
                  Sleep Timer
                </div>
                {[15, 30, 45, 60].map(m => (
                  <button
                    key={m}
                    onClick={() => { setSleepTimerMinutes(m); setTimerMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-neutral-200 hover:bg-white/5"
                  >
                    {m} minutes
                  </button>
                ))}
                {sleepTimerMinutes && (
                  <button
                    onClick={() => { setSleepTimerMinutes(null); setTimerMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-rose-400 hover:bg-white/5 border-t border-white/5 mt-1"
                  >
                    Turn Off
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-2 rounded-lg text-neutral-400 hover:text-emerald-400 transition-colors"
            title="Download MP3"
          >
            <Download className={`w-4 h-4 ${downloading ? 'animate-bounce text-emerald-400' : ''}`} />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={setIsMuted}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0
                ? <VolumeX className="w-4 h-4" />
                : <Volume2 className="w-4 h-4" />
              }
            </button>
            <div className="relative w-20 h-1 rounded-full cursor-pointer group" style={{ background: '#333' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(isMuted ? 0 : volume) * 100}%`,
                  background: 'linear-gradient(to right,#7c3aed,#ec4899)'
                }}
              />
              <input
                type="range"
                min={0} max={1} step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
