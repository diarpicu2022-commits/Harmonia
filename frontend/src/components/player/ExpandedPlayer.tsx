import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, ListMusic, Mic2, Minimize2, Youtube, Maximize2 } from 'lucide-react';
import { usePlayerStore } from '../../store';
import { useAudioEngine } from '../../hooks/useAudioEngine';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, duration, volume, toggleFullscreen, toggleMute, isMuted, repeatMode, cycleRepeat, isShuffled, toggleShuffle, toggleQueue, toggleLyrics } = usePlayerStore();
  const { seekTo } = useAudioEngine();
  const [showVideo, setShowVideo] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  const handleShuffle = () => { console.log('toggleShuffle clicked'); toggleShuffle(); };
  const handleRepeat = () => { console.log('cycleRepeat clicked'); cycleRepeat(); };
  const handleQueue = () => { console.log('toggleQueue clicked'); toggleQueue(); };
  const handleLyrics = () => { console.log('toggleLyrics clicked'); toggleLyrics(); };
  const handleLike = () => { console.log('like clicked'); };

  useEffect(() => {
    if (currentSong?.source === 'youtube' && currentSong.youtubeId) {
      let container = document.getElementById('yt-player-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'yt-player-container';
        container.style.display = 'none';
        document.body.appendChild(container);
      }
    }
  }, [currentSong]);

  const isYouTube = currentSong?.source === 'youtube' && currentSong.youtubeId;
  const hasVideo = isYouTube;
  const currentTimeSeconds = Math.floor(progress * (duration || 0));

  const formatTime = (s: number) => {
    if (!s) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
    if (showVideo && isYouTube) {
      setVideoKey(k => k + 1);
    }
  }, [seekTo, showVideo, isYouTube]);

  useEffect(() => {
    if (!isPlaying && showVideo && isYouTube) {
      setShowVideo(false);
    }
  }, [isPlaying, showVideo, isYouTube]);

  const loadVideo = () => {
    setShowVideo(true);
  };

  const closeVideo = () => {
    setShowVideo(false);
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

      <div className="flex flex-col items-center max-w-2xl w-full px-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
          className={`${showVideo && isYouTube ? 'w-full aspect-video' : 'w-72 h-72'} rounded-2xl overflow-hidden shadow-2xl mb-6 relative`}
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 100px var(--mood-glow)' }}>
          {showVideo && isYouTube ? (
            <iframe
              key={videoKey}
              id="yt-embed-player"
              className="w-full h-full rounded-2xl"
              src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&controls=1&rel=0&showinfo=0&modestbranding=1&start=${currentTimeSeconds}&mute=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : currentSong.coverArt ? (
            <img src={currentSong.coverArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--mood-surface)' }}>
              <Volume2 size={64} style={{ color: 'var(--mood-primary)', opacity: 0.4 }} />
            </div>
          )}
          {isYouTube && !showVideo && (
            <button onClick={loadVideo}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="p-4 rounded-full bg-red-500 text-white">
                <Youtube size={32} />
              </div>
            </button>
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
          <div className="relative h-2 bg-white/10 rounded-full mb-3 cursor-pointer group" onClick={handleSeek}>
            <motion.div className="absolute h-full rounded-full"
              style={{ width: `${(progress / (duration || 1)) * 100}%`, background: 'var(--mood-primary)' }} />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
              style={{ boxShadow: '0 0 8px var(--mood-glow)' }} />
          </div>
          <div className="flex justify-between text-sm text-white/40">
            <span>{formatTime(progress * (duration || 0))}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mb-8">
          <button onClick={handleShuffle} className={`p-3 rounded-full transition-colors ${isShuffled ? 'text-white' : 'text-white/30 hover:text-white'}`}>
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
          
          <button onClick={handleRepeat} className={`p-3 rounded-full transition-colors ${repeatMode !== 'none' ? 'text-white' : 'text-white/30 hover:text-white'}`}>
            <Repeat size={22} />
          </button>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 text-white/40">
          {hasVideo && !showVideo && (
            <button onClick={loadVideo}
              className="p-2 hover:text-red-500 transition-colors" title="Ver video">
              <Youtube size={20} />
            </button>
          )}
          {hasVideo && showVideo && (
            <button onClick={() => setShowVideo(false)}
              className="p-2 hover:text-red-500 transition-colors" title="Ver carátula">
              <Maximize2 size={20} />
            </button>
          )}
          <button onClick={handleLike} className="p-2 hover:text-white transition-colors" title="Me gusta">
            <Heart size={20} />
          </button>
          <button onClick={handleQueue} className="p-2 hover:text-white transition-colors" title="Cola">
            <ListMusic size={20} />
          </button>
          <button onClick={handleLyrics} className="p-2 hover:text-white transition-colors" title="Letras">
            <Mic2 size={20} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}