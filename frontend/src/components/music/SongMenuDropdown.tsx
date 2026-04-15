import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, ListPlus, Play, Trash2, Info, Plus } from 'lucide-react';
import { usePlayerStore } from '../../store';
import toast from 'react-hot-toast';
import type { Song } from '../../types';

interface Props {
  song: Song;
  onAddToPlaylist: () => void;
  index: number;
}

const MENU_ITEMS = [
  { icon: Play, label: 'Reproducir ahora', action: 'play-now' },
  { icon: ListPlus, label: 'Agregar al inicio de la cola', action: 'add-start' },
  { icon: ListPlus, label: 'Agregar al final de la cola', action: 'add-end' },
  { icon: Plus, label: 'Agregar a playlist', action: 'playlist' },
  { icon: Info, label: 'Ver información', action: 'info' },
];

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

  const handleAction = (action: string) => {
    setIsOpen(false);
    switch (action) {
      case 'play-now':
        loadQueue(currentQueue, index);
        toast.success('Reproduciendo');
        break;
      case 'add-start':
        addToQueue(song, 'start');
        toast.success('Agregada al inicio');
        break;
      case 'add-end':
        addToQueue(song, 'end');
        toast.success('Agregada al final');
        break;
      case 'playlist':
        onAddToPlaylist();
        break;
      case 'info':
        setShowInfo(true);
        break;
    }
  };

  const formatDuration = (s: number) => {
    if (!s) return '—';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white/80 transition-colors">
          <MoreHorizontal size={14} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 w-56 glass-strong rounded-xl py-1 z-50 shadow-xl"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              {MENU_ITEMS.map((item, i) => (
                <motion.button key={item.action} whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  onClick={() => handleAction(item.action)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors text-left">
                  <item.icon size={16} className="text-white/50" />
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInfo(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm glass-strong rounded-2xl p-5"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10">
                  {song.coverArt ? (
                    <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play size={24} style={{ color: 'var(--mood-primary)' }} />
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
                {song.genre && <div className="flex justify-between"><span>Género</span><span className="text-white/80">{song.genre}</span></div>}
                {song.year && <div className="flex justify-between"><span>Año</span><span className="text-white/80">{song.year}</span></div>}
              </div>
              <button onClick={() => setShowInfo(false)} className="w-full mt-4 py-2 rounded-xl btn-mood text-sm">
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}