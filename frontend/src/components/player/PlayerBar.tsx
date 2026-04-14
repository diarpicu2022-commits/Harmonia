import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Volume1, ListMusic, Mic2, Maximize2, Heart
} from 'lucide-react';
import { usePlayerStore } from '../../store';
import { useAudioEngine } from '../../hooks/useAudioEngine';

const formatTime = (secs: number) => {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const WaveformBars = () => (
  <div className="flex items-end gap-0.5 h-4">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="waveform-bar" style={{ height: `${[8,14,10,16,6][i-1]}px`, animationDelay: `${i*0.1}s` }} />
    ))}
  </div>
);

export default function PlayerBar() {
  const {
    currentSong, isPlaying, volume, isMuted, progress, duration,
    isShuffled, repeatMode, togglePlay, nextSong, prevSong,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
    toggleQueue, toggleLyrics, toggleFullscreen,
  } = usePlayerStore();
  const { seekTo } = useAudioEngine();

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  }, [seekTo]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.4 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong border-t"
      style={{ borderColor: 'rgba(255,255,255,0.06)', height: '88px', flexShrink: 0, position: 'relative', zIndex: 50 }}
    >
      {/* Progress bar at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 cursor-pointer group"
        style={{ background: 'rgba(255,255,255,0.06)' }}
        onClick={handleSeek}
      >
        <motion.div
          className="h-full progress-fill relative"
          style={{ width: `${(progress || 0) * 100}%` }}
          transition={{ duration: 0.1 }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
            style={{ boxShadow: '0 0 8px var(--mood-glow)' }} />
        </motion.div>
      </div>

      <div className="flex items-center h-full px-6 gap-4">

        {/* Song info */}
        <div className="flex items-center gap-3 w-72 min-w-0">
          <AnimatePresence mode="wait">
            {currentSong ? (
              <motion.div key={currentSong.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.3 }}
                className="relative flex-shrink-0"
              >
                <div className={`w-14 h-14 rounded-xl overflow-hidden vinyl-record ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  {currentSong.coverArt
                    ? <img src={currentSong.coverArt} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--mood-surface)' }}>
                        <span style={{ color: 'var(--mood-primary)', fontSize: 24 }}>♪</span>
                      </div>
                  }
                </div>
                {isPlaying && (
                  <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                    <WaveformBars />
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="w-14 h-14 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            )}
          </AnimatePresence>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.p key={currentSong?.id || 'none'} initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
                className="text-sm font-semibold text-white truncate">
                {currentSong?.title || 'Ninguna canción'}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {currentSong?.artist || '—'}
            </p>
          </div>

          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
            <Heart size={16} />
          </motion.button>
        </div>

        {/* Center: controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={toggleShuffle}
              style={{ color: isShuffled ? 'var(--mood-primary)' : 'rgba(255,255,255,0.35)' }}
              className="transition-colors">
              <Shuffle size={17} />
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
              onClick={prevSong} className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={22} fill="currentColor" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center btn-mood shadow-lg"
            >
              <AnimatePresence mode="wait">
                <motion.div key={isPlaying ? 'pause' : 'play'}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                  {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
              onClick={nextSong} className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={22} fill="currentColor" />
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={cycleRepeat}
              style={{ color: repeatMode !== 'none' ? 'var(--mood-primary)' : 'rgba(255,255,255,0.35)' }}
              className="transition-colors relative">
              <RepeatIcon size={17} />
              {repeatMode !== 'none' && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--mood-primary)' }} />
              )}
            </motion.button>
          </div>

          {/* Time display */}
          <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span className="w-8 text-right">{formatTime((progress || 0) * (duration || 0))}</span>
            <span className="text-white/10">/</span>
            <span className="w-8">{formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Right: extras */}
        <div className="flex items-center gap-3 w-72 justify-end">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={toggleLyrics}
            style={{ color: 'rgba(255,255,255,0.35)' }}
            className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <Mic2 size={17} />
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={toggleQueue}
            style={{ color: 'rgba(255,255,255,0.35)' }}
            className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <ListMusic size={17} />
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            style={{ color: 'rgba(255,255,255,0.35)' }}
            className="hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <Maximize2 size={17} />
          </motion.button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              style={{ color: 'rgba(255,255,255,0.5)' }}
              className="hover:text-white transition-colors">
              <VolumeIcon size={17} />
            </motion.button>
            <input type="range" min="0" max="1" step="0.02"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
