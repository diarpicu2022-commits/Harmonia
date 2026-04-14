// QueuePanel.tsx
import { motion } from 'framer-motion';
import { X, GripVertical, Music2 } from 'lucide-react';
import { usePlayerStore } from '../../store';

export default function QueuePanel() {
  const { currentQueue, currentIndex, toggleQueue, jumpToIndex, removeFromQueue } = usePlayerStore();

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
          : currentQueue.map((song, i) => (
            <motion.div
              key={`${song.id}-${i}`}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => jumpToIndex(i)}
              className="song-card flex items-center gap-3 px-4 py-2.5 cursor-pointer"
              style={i === currentIndex ? { background: 'var(--mood-surface)', borderLeft: '3px solid var(--mood-primary)' } : {}}
            >
              <GripVertical size={14} className="text-white/20 flex-shrink-0" />
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
              <button onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}
                className="text-white/20 hover:text-red-400 transition-colors p-1">
                <X size={13} />
              </button>
            </motion.div>
          ))
        }
      </div>
    </motion.div>
  );
}
