import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, ListMusic, Mic2, Minimize2 } from 'lucide-react';
import { usePlayerStore } from '../../store';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, duration, volume, toggleFullscreen, toggleMute, isMuted, repeatMode, cycleRepeat, isShuffled, toggleShuffle, toggleQueue } = usePlayerStore();

  const formatTime = (s: number) => {
    if (!s) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #080810 100%)' }}>
        <button onClick={toggleFullscreen} className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white/60 hover:text-white">
          <Minimize2 size={24} />
        </button>
        <p className="text-white/30">No hay canción reproduciéndose</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, var(--mood-surface) 0%, #080810 60%, #080810 100%)' }}>
      
      <button onClick={toggleFullscreen} className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white/60 hover:text-white transition-colors z-10">
        <Minimize2 size={24} />
      </button>

      <div className="flex flex-col items-center max-w-lg w-full px-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
          className="w-72 h-72 rounded-2xl overflow-hidden shadow-2xl mb-10"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 100px var(--mood-glow)' }}>
          {currentSong.coverArt ? (
            <img src={currentSong.coverArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--mood-surface)' }}>
              <Volume2 size={64} style={{ color: 'var(--mood-primary)', opacity: 0.4 }} />
            </div>
          )}
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="w-full text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            {currentSong.title}
          </h2>
          <p className="text-xl text-white/50">{currentSong.artist}</p>
          {currentSong.album && currentSong.album !== 'Unknown Album' && (
            <p className="text-md text-white/30 mt-1">{currentSong.album}</p>
          )}
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="w-full mb-8">
          <div className="relative h-2 bg-white/10 rounded-full mb-3">
            <motion.div className="absolute h-full rounded-full"
              style={{ width: `${(progress / (duration || 1)) * 100}%`, background: 'var(--mood-primary)' }} />
          </div>
          <div className="flex justify-between text-sm text-white/40">
            <span>{formatTime(progress * (duration || 0))}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mb-8">
          <button onClick={toggleShuffle} className={`p-3 rounded-full transition-colors ${isShuffled ? 'text-white' : 'text-white/30 hover:text-white'}`}>
            <Shuffle size={22} />
          </button>
          
          <button onClick={prevSong} className="p-3 text-white/60 hover:text-white transition-colors">
            <SkipBack size={28} fill="currentColor" />
          </button>
          
          <button onClick={togglePlay} 
            className="p-5 rounded-full text-white transition-transform hover:scale-105"
            style={{ background: 'var(--mood-primary)' }}>
            {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
          </button>
          
          <button onClick={nextSong} className="p-3 text-white/60 hover:text-white transition-colors">
            <SkipForward size={28} fill="currentColor" />
          </button>
          
          <button onClick={cycleRepeat} className={`p-3 rounded-full transition-colors ${repeatMode !== 'none' ? 'text-white' : 'text-white/30 hover:text-white'}`}>
            <Repeat size={22} />
          </button>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 text-white/40">
          <button className="p-2 hover:text-white transition-colors">
            <Heart size={20} />
          </button>
          <button onClick={toggleQueue} className="p-2 hover:text-white transition-colors">
            <ListMusic size={20} />
          </button>
          <button className="p-2 hover:text-white transition-colors">
            <Mic2 size={20} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}