import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, Youtube, FileAudio, Check, AlertCircle } from 'lucide-react';

export const AdminUpload = () => {
  const [uploadType, setUploadType] = useState('youtube'); // 'youtube' | 'manual'
  const [genres, setGenres] = useState([]);

  // YouTube Form State
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [ytArtist, setYtArtist] = useState('');
  const [ytGenreId, setYtGenreId] = useState('');
  const [ytLyrics, setYtLyrics] = useState('');

  // Manual Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');
  const [manualGenreId, setManualGenreId] = useState('');
  const [manualLyrics, setManualLyrics] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/songs/genres').then(res => {
      if (res.data.success) {
        setGenres(res.data.genres);
        if (res.data.genres.length > 0) {
          setYtGenreId(res.data.genres[0].id);
          setManualGenreId(res.data.genres[0].id);
        }
      }
    });
  }, []);

  const handleYtSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/youtube/url', {
        url: ytUrl,
        title: ytTitle,
        artist_name: ytArtist,
        genre_id: ytGenreId,
        lyrics: ytLyrics
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Song imported successfully!' });
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error processing YouTube URL' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setMessage({ type: 'error', text: 'Please select an MP3 audio file.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('title', manualTitle);
    formData.append('artist_name', manualArtist);
    formData.append('genre_id', manualGenreId);
    formData.append('lyrics', manualLyrics);

    try {
      const res = await api.post('/youtube/manual-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'MP3 Song uploaded successfully!' });
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      <div className="text-center space-y-2 pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center space-x-2">
          <Upload className="w-8 h-8 text-blue-400" />
          <span>Upload Song to GeeSphere</span>
        </h1>
        <p className="text-xs text-slate-400">Add songs via YouTube URL conversion or direct MP3 file upload</p>
      </div>

      {/* Toggle Tab */}
      <div className="flex bg-slate-800 p-1 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setUploadType('youtube')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
            uploadType === 'youtube' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-400" />
          <span>YouTube URL Import</span>
        </button>

        <button
          onClick={() => setUploadType('manual')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
            uploadType === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileAudio className="w-4 h-4 text-emerald-400" />
          <span>Manual MP3 Upload</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* YouTube Import Form */}
      {uploadType === 'youtube' ? (
        <form onSubmit={handleYtSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">YouTube URL *</label>
            <input
              type="url"
              required
              placeholder="YouTube Video Link"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Song Title</label>
              <input
                type="text"
                placeholder="Song Title"
                value={ytTitle}
                onChange={(e) => setYtTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Artist Name</label>
              <input
                type="text"
                placeholder="Artist Name"
                value={ytArtist}
                onChange={(e) => setYtArtist(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Music Genre</label>
            <select
              value={ytGenreId}
              onChange={(e) => setYtGenreId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lyrics</label>
            <textarea
              rows={5}
              placeholder="Paste song lyrics line by line here..."
              value={ytLyrics}
              onChange={(e) => setYtLyrics(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {submitting ? 'Processing YouTube URL...' : 'Import Song'}
          </button>
        </form>
      ) : (
        /* Manual Upload Form */
        <form onSubmit={handleManualSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">MP3 Audio File *</label>
              <input
                type="file"
                accept="audio/mp3,audio/*"
                required
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Song Title *</label>
              <input
                type="text"
                required
                placeholder="Song Title"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Artist Name *</label>
              <input
                type="text"
                required
                placeholder="Artist Name"
                value={manualArtist}
                onChange={(e) => setManualArtist(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Genre</label>
            <select
              value={manualGenreId}
              onChange={(e) => setManualGenreId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
            >
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Song Lyrics</label>
            <textarea
              rows={5}
              placeholder="Paste song lyrics here..."
              value={manualLyrics}
              onChange={(e) => setManualLyrics(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? 'Uploading MP3 Song...' : 'Upload MP3 Song'}
          </button>
        </form>
      )}

    </div>
  );
};
