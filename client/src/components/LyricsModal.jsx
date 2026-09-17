import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Copy, Check, ZoomIn, ZoomOut, FileText } from 'lucide-react';

export const LyricsModal = () => {
  const { currentSong, showLyrics, setShowLyrics } = usePlayer();
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  if (!showLyrics || !currentSong) return null;

  const handleCopy = () => {
    if (currentSong.lyrics) {
      navigator.clipboard.writeText(currentSong.lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800">
              <img src={currentSong.cover_image || '/default-cover.jpg'} alt={currentSong.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{currentSong.title}</h3>
              <p className="text-xs text-slate-400">{currentSong.artist_name || 'Unknown Artist'} • Song Lyrics</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFontSize(Math.min(fontSize + 2, 28))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Increase Font Size"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFontSize(Math.max(fontSize - 2, 14))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Copy Lyrics"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowLyrics(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 leading-relaxed text-slate-200 whitespace-pre-line text-center">
          {currentSong.lyrics ? (
            <div style={{ fontSize: `${fontSize}px` }} className="space-y-4 font-normal">
              {currentSong.lyrics}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm font-sans">No lyrics available for this song yet.</p>
              <p className="text-xs text-slate-600 font-sans mt-1">Lyrics for this song will be added by the admin soon.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 text-xs text-slate-500 text-center bg-slate-950">
          GeeSphere Lyrics Database
        </div>

      </div>
    </div>
  );
};
