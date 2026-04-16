import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music2 } from 'lucide-react';
import { searchAPI } from '../../services/api';
import { usePlayerStore } from '../../store';
import type { SearchResults, SearchResult, Song } from '../../types';
import SongCard from '../music/SongCard';

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  youtube: { label: 'YouTube', color: '#EF4444' },
  spotify: { label: 'Spotify', color: '#1DB954' },
  deezer: { label: 'Deezer', color: '#EF5466' },
};

const SOURCES = ['youtube', 'spotify', 'deezer'] as const;
type SourceKey = typeof SOURCES[number];

const toSong = (r: SearchResult): Song => ({
  id: r.id, title: r.title, artist: r.artist, album: r.album || '',
  duration: r.duration, coverArt: r.coverArt, youtubeId: r.youtubeId,
  spotifyId: r.spotifyId, previewUrl: r.previewUrl, source: r.source,
});

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SourceKey>('youtube');
  const { loadQueue, addToQueue } = usePlayerStore();

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    try {
      const { data } = await searchAPI.searchAll(query);
      setResults(data);
      // Pick source with most results
      const best = SOURCES.slice().sort(
        (a, b) => (data[b]?.length ?? 0) - (data[a]?.length ?? 0)
      )[0];
      setActiveTab(best);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  }, [query, loading]);

  const activeResults: SearchResult[] = results?.[activeTab] ?? [];
  const activeSongs = activeResults.map(toSong);

  return (
    <div className="px-8 py-8 min-h-full">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Clash Display',sans-serif" }}>
        Buscar Música
      </motion.h1>

      {/* Search bar */}
      <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Busca canciones, artistas, álbumes..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-white/85 text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--mood-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--mood-glow)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-4 rounded-2xl text-sm font-medium btn-mood disabled:opacity-50 whitespace-nowrap">
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
      </motion.form>

      {/* Source tabs */}
      {results && (
        <div className="flex gap-2 mb-6">
          {SOURCES.map(source => {
            const count = results[source]?.length ?? 0;
            const { label, color } = SOURCE_LABELS[source];
            const isActive = activeTab === source;
            return (
              <motion.button key={source} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(source)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? color + '22' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? color + '55' : 'rgba(255,255,255,0.06)'}`,
                  color: isActive ? color : 'rgba(255,255,255,0.5)',
                }}>
                <Music2 size={14} />
                {label}
                <span className="text-xs opacity-60">{count}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </motion.div>
        )}
        {!loading && activeResults.length > 0 && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-1">
            {activeSongs.map((song, i) => (
              <SongCard key={song.id} song={song} index={i}
                onPlay={() => loadQueue(activeSongs, i)}
                onAddToQueue={() => addToQueue(song, 'end')} />
            ))}
          </motion.div>
        )}
        {!loading && results && activeResults.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center mt-16">
            <p className="text-white/25 text-sm">
              No se encontraron resultados en {SOURCE_LABELS[activeTab].label}
            </p>
          </motion.div>
        )}
        {!loading && !results && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center mt-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--mood-surface)' }}>
              <Search size={28} style={{ color: 'var(--mood-primary)' }} />
            </div>
            <p className="text-white/40 text-sm">Busca en YouTube, Spotify y Deezer al mismo tiempo</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
