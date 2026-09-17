import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { SongCard } from '../components/SongCard';
import { Play, Flame, Sparkles, ChevronRight, Disc3 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

/* Greeting based on time */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/* Horizontal scroll row */
const Row = ({ title, icon: Icon, iconColor, songs, loading, viewAllTo }) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {viewAllTo && (
        <Link to={viewAllTo} className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-white transition-colors">
          Show all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>

    {loading ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="shimmer rounded-xl h-52" />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {songs.map(s => <SongCard key={s.id} song={s} queue={songs} />)}
      </div>
    )}
  </section>
);

export const Home = () => {
  const [trending, setTrending] = useState([]);
  const [latest, setLatest]     = useState([]);
  const [genres, setGenres]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const { playSong } = usePlayer();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get('/songs/trending'),
      api.get('/songs/latest'),
      api.get('/songs/genres'),
    ]).then(([t, l, g]) => {
      if (t.data.success) setTrending(t.data.songs);
      if (l.data.success) setLatest(l.data.songs);
      if (g.data.success) setGenres(g.data.genres);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* pick a random gradient for hero */
  const heroGradients = [
    'from-violet-900 via-purple-900 to-[#0f0f0f]',
    'from-rose-900 via-pink-900 to-[#0f0f0f]',
    'from-blue-900 via-indigo-900 to-[#0f0f0f]',
    'from-emerald-900 via-teal-900 to-[#0f0f0f]',
  ];
  const heroGrad = heroGradients[new Date().getHours() % heroGradients.length];

  return (
    <div className="space-y-10">

      {/* ── HERO BANNER ── */}
      <section
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${heroGrad} p-8 sm:p-10 min-h-[220px] flex items-end`}
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: '#7c3aed' }} />
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 rounded-full blur-2xl opacity-15" style={{ background: '#ec4899' }} />

        <div className="relative z-10 space-y-4 max-w-xl">
          <p className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            {getGreeting()}{user ? `, ${user.full_name.split(' ')[0]}` : ''}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Your Music,<br />
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Reimagined.
            </span>
          </h1>
          <p className="text-sm text-white/50 max-w-sm">
            Sri Lanka's free streaming universe — pop, baila, folk, unplugged & more.
          </p>

          <div className="flex items-center gap-3 pt-1">
            {trending.length > 0 && (
              <button
                onClick={() => playSong(trending[0], trending)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white hover:scale-105 transition-transform shadow-xl"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
              >
                <Play className="w-4 h-4 fill-current" /> Play Top Track
              </button>
            )}
            <Link
              to="/browse"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors hover:bg-white/15"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Explore Library
            </Link>
          </div>
        </div>
      </section>

      {/* ── QUICK GENRE PILLS ── */}
      {genres.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <Link
                key={g.id}
                to={`/browse?genre=${encodeURIComponent(g.name)}`}
                className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:brightness-110"
                style={{ background: g.color || '#7c3aed', boxShadow: `0 0 12px ${g.color || '#7c3aed'}55` }}
              >
                {g.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── TRENDING ── */}
      <Row
        title="🔥 Weekly Top Hits"
        icon={Flame}
        iconColor="text-amber-400"
        songs={trending}
        loading={loading}
        viewAllTo="/browse?sort=popular"
      />

      {/* ── LATEST RELEASES ── */}
      <Row
        title="✨ Latest Releases"
        icon={Sparkles}
        iconColor="text-violet-400"
        songs={latest}
        loading={loading}
        viewAllTo="/browse?sort=latest"
      />

    </div>
  );
};
