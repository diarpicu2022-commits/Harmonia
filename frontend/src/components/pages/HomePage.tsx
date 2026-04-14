// ── HomePage.tsx ──────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useAuthStore, useMoodStore, usePlayerStore } from '../../store';
import { aiAPI, musicAPI } from '../../services/api';
import SongCard from '../music/SongCard';
import type { Song, AIRecommendation } from '../../types';

export function HomePage() {
  const { user } = useAuthStore();
  const { mood, energyLevel } = useMoodStore();
  const { loadQueue } = usePlayerStore();
  const [mySongs, setMySongs] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 17 ? 'Buenas tardes' : 'Buenas noches';

  const MOOD_LABELS: Record<string, string> = {
    happy: '😊 Feliz', energetic: '⚡ Energético', calm: '🌊 Tranquilo',
    melancholic: '🌙 Melancólico', focused: '🎯 Concentrado', romantic: '💕 Romántico', default: '🎵 Explorando',
  };

  useEffect(() => {
    musicAPI.getMySongs().then(({ data }) => setMySongs(data.songs)).catch(() => {});
    setLoadingRec(true);
    aiAPI.getRecommendations().then(({ data }) => setRecommendations(data.recommendations)).catch(() => {}).finally(() => setLoadingRec(false));
  }, []);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="px-8 py-8 pb-4 min-h-full">
      {/* Header */}
      <motion.div variants={container} initial="hidden" animate="show" className="mb-8">
        <motion.p variants={item} className="text-white/40 text-sm mb-1">{greeting},</motion.p>
        <motion.h1 variants={item} className="text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "'Clash Display',sans-serif" }}>
          {user?.displayName} 👋
        </motion.h1>
        <motion.div variants={item} className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'var(--mood-surface)', color: 'var(--mood-primary)', border: '1px solid var(--mood-primary)22' }}>
            {MOOD_LABELS[mood] || '🎵 Explorando'}
          </span>
          <span className="text-white/25 text-xs">Energía: {energyLevel}/10</span>
        </motion.div>
      </motion.div>

      {/* AI Recommendations */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} style={{ color: 'var(--mood-primary)' }} />
          <h2 className="font-bold text-white/90" style={{ fontFamily: "'Clash Display',sans-serif" }}>
            Recomendaciones IA para ti
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {loadingRec
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))
            : recommendations.slice(0, 6).map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  className="glass rounded-xl p-4 cursor-pointer group"
                >
                  <p className="text-sm font-semibold text-white/85 truncate mb-1">{rec.query}</p>
                  <p className="text-xs text-white/35 truncate">{rec.reason}</p>
                </motion.div>
              ))
          }
        </div>
      </section>

      {/* My Library */}
      {mySongs.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} style={{ color: 'var(--mood-primary)' }} />
              <h2 className="font-bold text-white/90" style={{ fontFamily: "'Clash Display',sans-serif" }}>Mi Biblioteca</h2>
            </div>
            <button className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
              style={{ color: 'var(--mood-primary)' }}>
              Ver todo <ChevronRight size={14} />
            </button>
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-1">
            {mySongs.slice(0, 6).map((song, i) => (
              <motion.div key={song.id} variants={item}>
                <SongCard song={song} index={i} onPlay={() => loadQueue(mySongs, i)} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
