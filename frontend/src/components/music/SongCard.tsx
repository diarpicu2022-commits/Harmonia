import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Music2 } from 'lucide-react';
import { usePlayerStore } from '../../store';
import type { Song } from '../../types';
import PlaylistModal from './PlaylistModal';
import SongMenuDropdown from './SongMenuDropdown';

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
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else onPlay?.();
  };

  const badge = SOURCE_BADGE[song.source];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group active:bg-white/5"
        style={isActive ? { background: 'var(--mood-surface)', borderLeft: '3px solid var(--mood-primary)' } : {}}
        onClick={handlePlay}
      >
        <div className="w-8 text-center flex-shrink-0">
          <span className="text-sm text-white/25" style={{ color: isActive ? 'var(--mood-primary)' : undefined }}>
            {isActive && isPlaying ? (
              <span className="flex items-center justify-center gap-0.5">
                {[1,2,3].map(i => <span key={i} className="waveform-bar" style={{ height: '12px', animationDelay: `${i*0.1}s` }} />)}
              </span>
            ) : index + 1}
          </span>
        </div>

        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
          {song.coverArt ? (
            <img src={song.coverArt} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 size={16} style={{ color: 'var(--mood-primary)' }} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: isActive ? 'var(--mood-primary)' : 'white' }}>
            {song.title}
          </p>
          <p className="text-xs text-white/40 truncate">
            {song.artist}{song.album && song.album !== 'Unknown Album' ? ` · ${song.album}` : ''}
          </p>
        </div>

        {badge && (
          <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 opacity-60"
            style={{ background: badge.color + '22', color: badge.color, fontSize: '9px' }}>
            {badge.label}
          </span>
        )}

        <span className="text-xs flex-shrink-0 text-white/30" style={{ minWidth: '36px', textAlign: 'right' }}>
          {formatDuration(song.duration)}
        </span>

        <div className="flex-shrink-0" style={{ position: 'relative' }}>
          <SongMenuDropdown 
            song={song} 
            index={index}
            onAddToPlaylist={() => setShowPlaylistModal(true)} 
          />
        </div>
      </motion.div>

      <PlaylistModal 
        song={song} 
        isOpen={showPlaylistModal} 
        onClose={() => setShowPlaylistModal(false)} 
      />
    </>
  );
}