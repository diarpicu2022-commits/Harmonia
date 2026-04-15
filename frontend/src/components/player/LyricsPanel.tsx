import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Music2 } from 'lucide-react';
import { usePlayerStore } from '../../store';
import { lyricsAPI } from '../../services/api';

export default function LyricsPanel() {
  const { toggleLyrics, currentSong, progress, duration } = usePlayerStore();
  const [lyrics, setLyrics] = useState<string>('');
  const [syncedLyrics, setSyncedLyrics] = useState<Array<{ time: number; text: string }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const currentTime = (progress || 0) * (duration || 0);

  useEffect(() => {
    if (!currentSong) return;
    setLoading(true); setError(false); setLyrics(''); setSyncedLyrics(null);

    lyricsAPI.get(currentSong.artist, currentSong.title)
      .then(({ data }) => {
        setLyrics(data.lyrics);
        if (data.syncedLyrics) {
          const parsed = data.syncedLyrics.split('\n').map((line: string) => {
            const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
            if (!match) return null;
            return { time: parseInt(match[1]) * 60 + parseFloat(match[2]), text: match[3].trim() };
          }).filter(Boolean) as Array<{ time: number; text: string }>;
          setSyncedLyrics(parsed);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [currentSong?.id]);

  const activeIndex = syncedLyrics
    ? syncedLyrics.findLastIndex((l: { time: number; text: string }) => l.time <= currentTime)
    : -1;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-80 flex-shrink-0 glass-strong border-l flex flex-col"
      style={{ borderColor: 'rgba(255,255,255,0.06)', zIndex: 40 }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="font-semibold text-white/90" style={{ fontFamily: "'Clash Display',sans-serif" }}>Letra</h2>
          {currentSong && <p className="text-xs text-white/40 truncate">{currentSong.title} — {currentSong.artist}</p>}
        </div>
        <button onClick={toggleLyrics} className="text-white/40 hover:text-white/80 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!currentSong && (
          <div className="text-center mt-12">
            <Music2 size={36} className="mx-auto mb-3 text-white/15" />
            <p className="text-white/25 text-sm">Reproduce una canción para ver la letra</p>
          </div>
        )}
        {loading && (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-4 rounded animate-pulse"
                style={{ background: 'rgba(255,255,255,0.06)', width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        )}
        {error && (
          <div className="text-center mt-12">
            <p className="text-white/25 text-sm">No se encontró la letra de esta canción</p>
          </div>
        )}

        {/* Synced lyrics */}
        {!loading && !error && syncedLyrics && (
          <div className="space-y-4">
            {syncedLyrics.map((line, i) => (
              <motion.p
                key={i}
                animate={{ opacity: i === activeIndex ? 1 : 0.25, scale: i === activeIndex ? 1.02 : 1 }}
                className="text-sm leading-relaxed transition-all cursor-pointer hover:opacity-60"
                style={{
                  color: i === activeIndex ? 'var(--mood-primary)' : 'rgba(255,255,255,0.6)',
                  textShadow: i === activeIndex ? '0 0 20px var(--mood-glow)' : 'none',
                  fontWeight: i === activeIndex ? '600' : '400',
                }}
              >
                {line.text || <span className="opacity-30">· · ·</span>}
              </motion.p>
            ))}
          </div>
        )}

        {/* Plain lyrics */}
        {!loading && !error && lyrics && !syncedLyrics && (
          <div className="space-y-1">
            {lyrics.split('\n').map((line, i) => (
              <p key={i} className="text-sm leading-relaxed"
                style={{ color: line ? 'rgba(255,255,255,0.7)' : 'transparent', minHeight: '1.4em' }}>
                {line || ''}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
