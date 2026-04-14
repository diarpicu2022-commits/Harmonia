import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, Music2 } from 'lucide-react';
import { usePlaylistStore, usePlayerStore } from '../../store';
import SongCard from '../music/SongCard';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { playlists } = usePlaylistStore();
  const { loadQueue, toggleShuffle } = usePlayerStore();
  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/30">Playlist no encontrada</p>
      </div>
    );
  }

  const totalMins = Math.floor(playlist.songs.reduce((a, s) => a + (s.duration || 0), 0) / 60);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="relative px-8 py-10 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, var(--mood-surface) 0%, transparent 100%)' }}>
        <div className="flex items-end gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 mood-glow"
            style={{ background: 'var(--mood-surface)' }}
          >
            {playlist.coverArt
              ? <img src={playlist.coverArt} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Music2 size={48} style={{ color: 'var(--mood-primary)', opacity: 0.4 }} />
                </div>
            }
          </motion.div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Playlist</p>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Display',sans-serif" }}>
              {playlist.name}
            </h1>
            {playlist.description && <p className="text-white/50 text-sm mb-3">{playlist.description}</p>}
            <p className="text-white/35 text-xs">
              {playlist.songs.length} canciones · {totalMins} min
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => loadQueue(playlist.songs, 0)}
            className="flex items-center gap-2 px-6 py-3 rounded-full btn-mood font-semibold text-sm">
            <Play size={18} fill="white" /> Reproducir
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { loadQueue(playlist.songs, 0); toggleShuffle(); }}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Shuffle size={16} /> Aleatorio
          </motion.button>
        </div>
      </div>

      {/* Songs list */}
      <div className="px-8 pb-8">
        {playlist.songs.length === 0 ? (
          <p className="text-white/25 text-sm text-center mt-12">
            Esta playlist está vacía. ¡Busca canciones y agrégalas!
          </p>
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            className="space-y-1">
            {playlist.songs.map((song, i) => (
              <SongCard key={song.id} song={song} index={i}
                onPlay={() => loadQueue(playlist.songs, i)} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
