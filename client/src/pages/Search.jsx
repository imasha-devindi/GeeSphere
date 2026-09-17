import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { SongCard } from '../components/SongCard';
import { Search as SearchIcon } from 'lucide-react';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [songs, setSongs]   = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    api.get(`/songs?search=${encodeURIComponent(query)}`)
      .then(res => { if (res.data.success) setSongs(res.data.songs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-extrabold text-white">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {query && <p className="text-sm text-neutral-400 mt-1">{songs.length} songs found</p>}
      </div>

      {!query ? (
        <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <SearchIcon className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
          <p className="text-neutral-400 text-sm">Type in the search bar above to find songs.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer rounded-xl h-52" />)}
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-lg font-bold text-white">No results</h3>
          <p className="text-sm text-neutral-500 mt-1">Try a different keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {songs.map(s => <SongCard key={s.id} song={s} queue={songs} />)}
        </div>
      )}
    </div>
  );
};
