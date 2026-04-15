import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music2, ListPlus, Clock, Info, Plus, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '../../store';
import toast from 'react-hot-toast';
import type { Song } from '../../types';
import PlaylistModal from './PlaylistModal';

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
  const { currentSong, isPlaying, togglePlay, currentQueue, addToQueue, loadQueue } = usePlayerStore();
  const isActive = currentSong?.id === song.id;
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else onPlay?.();
  };

  const handleAddToQueueStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song, 'start');
    toast.success('Agregada al inicio de la cola');
    setShowMenu(false);
  };

  const handleAddToQueueEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song, 'end');
    toast.success('Agregada al final de la cola');
    setShowMenu(false);
  };

  const badge = SOURCE_BADGE[song.source];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group"
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

        <button
          onClick={(e) => { e.stopPropagation(); setShowPlaylistModal(true); }}
          className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        >
          <Plus size={18} />
        </button>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={18} />
          </button>
          
          {showMenu && (
            <div 
              className="absolute right-0 top-full mt-1 w-44 bg-gray-900 rounded-xl border border-white/10 z-[100] py-1"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            >
              <button
                onClick={handleAddToQueueStart}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
              >
                <Clock size={14} /> Agregar al inicio
              </button>
              <button
                onClick={handleAddToQueueEnd}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
              >
                <ListPlus size={14} /> Agregar al final
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowInfo(true); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
              >
                <Info size={14} /> Ver información
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {showInfo && (
        <div 
          className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowInfo(false)}
        >
          <div 
            className="bg-gray-900 rounded-2xl p-5 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10">
                {song.coverArt ? (
                  <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 size={24} className="text-white/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{song.title}</h3>
                <p className="text-sm text-white/60 truncate">{song.artist}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex justify-between"><span>Álbum</span><span className="text-white/80 truncate">{song.album || '—'}</span></div>
              <div className="flex justify-between"><span>Duración</span><span className="text-white/80">{formatDuration(song.duration)}</span></div>
              <div className="flex justify-between"><span>Fuente</span><span className="text-white/80 capitalize">{song.source}</span></div>
            </div>
            <button onClick={() => setShowInfo(false)} className="w-full mt-4 py-2.5 rounded-xl bg-purple-600 text-white font-medium">
              Cerrar
            </button>
          </div>
        </div>
      )}

      <PlaylistModal 
        song={song} 
        isOpen={showPlaylistModal} 
        onClose={() => setShowPlaylistModal(false)} 
      />
    </>
  );
}