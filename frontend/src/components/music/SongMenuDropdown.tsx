import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ListPlus, Play, Info, Plus, Clock } from 'lucide-react';
import { usePlayerStore } from '../../store';
import toast from 'react-hot-toast';
import type { Song } from '../../types';

interface Props {
  song: Song;
  onAddToPlaylist: () => void;
  index: number;
}

export default function SongMenuDropdown({ song, onAddToPlaylist, index }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentQueue, addToQueue, loadQueue } = usePlayerStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlayNow = () => {
    loadQueue(currentQueue, index);
    toast.success('Reproduciendo');
    setIsOpen(false);
  };

  const handleAddToQueueStart = () => {
    addToQueue(song, 'start');
    toast.success('Agregada al inicio');
    setIsOpen(false);
  };

  const handleAddToQueueEnd = () => {
    addToQueue(song, 'end');
    toast.success('Agregada al final');
    setIsOpen(false);
  };

  const formatDuration = (s: number) => {
    if (!s) return '—';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        style={{ minWidth: '32px', minHeight: '32px' }}
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 w-48 bg-gray-900 rounded-xl border border-white/10 z-50 py-1"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          <button
            onClick={handlePlayNow}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 text-left"
          >
            <Play size={16} /> Reproducir ahora
          </button>
          <button
            onClick={handleAddToQueueStart}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 text-left"
          >
            <Clock size={16} /> Agregar al inicio
          </button>
          <button
            onClick={handleAddToQueueEnd}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 text-left"
          >
            <ListPlus size={16} /> Agregar al final
          </button>
          <button
            onClick={() => { setIsOpen(false); onAddToPlaylist(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 text-left"
          >
            <Plus size={16} /> Agregar a playlist
          </button>
          <button
            onClick={() => { setIsOpen(false); setShowInfo(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 text-left"
          >
            <Info size={16} /> Ver información
          </button>
        </div>
      )}

      {showInfo && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
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
                    <Play size={24} className="text-white/30" />
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
    </>
  );
}