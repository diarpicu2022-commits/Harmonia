import { motion } from 'framer-motion';
import { Play, Pause, MoreHorizontal, Plus, Music2 } from 'lucide-react';
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

const SOURCE_BADGE: Record<string, { label: string; color: string }> = {
  youtube: { label: 'YT', color: '#EF4444' },
  spotify: { label: 'SP', color: '#1DB954' },
  deezer: { label: 'DZ', color: '#EF5466' },
  local: { label: 'LOCAL', color: '#7C3AED' },
  soundcloud: { label: 'SC', color: '#FF5500' },
};

export default function SongCard({ song, index, onPlay, onAddToQueue }: Props) {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore();
  const isActive = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isActive) togglePlay();
    else onPlay?.();
  };

  const badge = SOURCE_BADGE[song.source];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      onClick={handlePlay}
      className="song-card flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group"
      style={isActive ? { background: 'var(--mood-surface)', borderLeft: '3px solid var(--mood-primary)' } : {}}
    >
      {/* Index / Play button */}
      <div className="w-8 text-center flex-shrink-0">
        <span className="text-sm text-white/25 group-hover:hidden block"
          style={{ color: isActive ? 'var(--mood-primary)' : undefined }}>
          {isActive && isPlaying ? (
            <span className="flex items-center justify-center gap-0.5">
              {[1,2,3].map(i => <span key={i} className="waveform-bar" style={{ height: '12px', animationDelay: `${i*0.1}s` }} />)}
            </span>
          ) : index + 1}
        </span>
        <span className="hidden group-hover:block">
          {isActive && isPlaying
            ? <Pause size={16} className="mx-auto" style={{ color: 'var(--mood-primary)' }} />
            : <Play size={16} className="mx-auto" style={{ color: 'var(--mood-primary)' }} />
          }
        </span>
      </div>

      {/* Cover */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)' }}>
        {song.coverArt
          ? <img src={song.coverArt} alt="" className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center">
              <Music2 size={16} style={{ color: 'var(--mood-primary)' }} />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate"
          style={{ color: isActive ? 'var(--mood-primary)' : 'rgba(255,255,255,0.85)' }}>
          {song.title}
        </p>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {song.artist}{song.album && song.album !== 'Unknown Album' ? ` · ${song.album}` : ''}
        </p>
      </div>

      {/* Source badge */}
      {badge && (
        <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 opacity-60"
          style={{ background: badge.color + '22', color: badge.color, fontSize: '9px', letterSpacing: '0.05em' }}>
          {badge.label}
        </span>
      )}

      {/* Duration */}
      <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)', minWidth: '36px', textAlign: 'right' }}>
        {formatDuration(song.duration)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {onAddToQueue && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onAddToQueue(); }}
            className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors">
            <Plus size={14} />
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors">
          <MoreHorizontal size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}
