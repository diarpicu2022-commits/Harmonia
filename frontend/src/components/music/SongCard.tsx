import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { usePlayerStore } from '../../store';
import type { Song } from '../../types';

const formatDuration = (s: number) => {
  if (!s) return '—';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

interface Props {
  song: Song;
  index: number;
  onPlay?: () => void;
  onAddToQueue?: () => void;
}

export default function SongCard({ song, index, onPlay }: Props) {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore();
  const isActive = currentSong?.id === song.id;
  
  const handlePlay = () => {
    if (isActive) togglePlay();
    else onPlay?.();
  };

  const testClick = (msg: string) => {
    alert(msg);
  };

  const badge = (() => {
    const map: Record<string, { label: string; color: string }> = {
      youtube: { label: 'YT', color: '#EF4444' },
      spotify: { label: 'SP', color: '#1DB954' },
      deezer: { label: 'DZ', color: '#EF5466' },
    };
    return map[song.source];
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      onClick={handlePlay}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer"
      style={isActive ? { background: 'var(--mood-surface)' } : {}}
    >
      <div className="w-8 text-center text-white/40">{index + 1}</div>
      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center overflow-hidden">
        {song.coverArt ? (
          <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
        ) : <Music2 size={16} className="text-white/30" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{song.title}</p>
        <p className="text-xs text-white/40 truncate">{song.artist}</p>
      </div>
      {badge && (
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: badge.color + '22', color: badge.color }}>
          {badge.label}
        </span>
      )}
      <span className="text-xs text-white/30">{formatDuration(song.duration)}</span>
      <button onClick={(e) => { e.stopPropagation(); testClick('BOTON + FUNCIONA'); }} style={{ padding: '8px', background: 'blue', color: 'white', borderRadius: '4px', fontSize: '10px' }}>+</button>
      <button onClick={(e) => { e.stopPropagation(); testClick('BOTON MENU FUNCIONA'); }} style={{ padding: '8px', background: 'green', color: 'white', borderRadius: '4px', fontSize: '10px' }}>⋯</button>
    </motion.div>
  );
}