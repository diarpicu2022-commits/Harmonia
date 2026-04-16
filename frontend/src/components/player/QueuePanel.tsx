// QueuePanel.tsx
import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { X, GripVertical, Music2, ArrowUp, ArrowDown, Plus, ListPlus } from 'lucide-react';
import { usePlayerStore } from '../../store';
import type { Song } from '../../types';

export default function QueuePanel() {
  const { currentQueue, currentIndex, toggleQueue, jumpToIndex, removeFromQueue, addToQueue, loadQueue, currentSong } = usePlayerStore();
  const [reorderQueue, setReorderQueue] = useState<Song[]>(currentQueue);

  const handleReorder = (newQueue: Song[]) => {
    setReorderQueue(newQueue);
    loadQueue(newQueue, currentIndex);
  };

  const moveToStart = (i: number) => {
    const song = reorderQueue[i];
    const newQueue = reorderQueue.filter((_, idx) => idx !== i);
    newQueue.unshift(song);
    handleReorder(newQueue);
  };

  const moveToEnd = (i: number) => {
    const song = reorderQueue[i];
    const newQueue = reorderQueue.filter((_, idx) => idx !== i);
    newQueue.push(song);
    handleReorder(newQueue);
  };

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
        <h2 className="font-semibold text-white/90" style={{ fontFamily: "'Clash Display',sans-serif" }}>Cola de reproducción</h2>
        <button onClick={toggleQueue} className="text-white/40 hover:text-white/80 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {currentQueue.length === 0
          ? <p className="text-white/25 text-sm text-center mt-8">La cola está vacía</p>
          : <Reorder.Group axis="y" values={reorderQueue} onReorder={handleReorder} className="space-y-1">
            {reorderQueue.map((song, i) => (
              <Reorder.Item
                key={`${song.id}-${i}`}
                value={song}
                className="song-card flex items-center gap-2 px-4 py-2 cursor-grab active:cursor-grabbing"
                style={i === currentIndex ? { background: 'var(--mood-surface)', borderLeft: '3px solid var(--mood-primary)' } : {}}
              >
                <GripVertical size={14} className="text-white/20 flex-shrink-0" />
                <span className="text-xs text-white/20 w-5 text-center">{i + 1}</span>
                <div 
                  onClick={() => jumpToIndex(i)}
                  className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {song.coverArt
                      ? <img src={song.coverArt} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Music2 size={14} style={{ color: 'var(--mood-primary)' }} />
                        </div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/85 truncate">{song.title}</p>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100">
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveToStart(i); }}
                    className="text-white/30 hover:text-white/70 p-1" title="Mover al inicio">
                    <ArrowUp size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveToEnd(i); }}
                    className="text-white/30 hover:text-white/70 p-1" title="Mover al final">
                    <ArrowDown size={12} />
                  </button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}
                  className="text-white/20 hover:text-red-400 transition-colors p-1">
                  <X size={13} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        }
      </div>
    </motion.div>
  );
}
