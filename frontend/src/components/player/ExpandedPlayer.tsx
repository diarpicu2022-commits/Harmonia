import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart, ListMusic, Mic2, Minimize2, Youtube, Maximize2, Volume1 } from 'lucide-react';
import { usePlayerStore } from '../../store';
import { useAudioEngine } from '../../hooks/useAudioEngine';

export default function ExpandedPlayer() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, duration, volume, toggleFullscreen, toggleMute, isMuted, repeatMode, cycleRepeat, isShuffled, toggleShuffle, toggleQueue, toggleLyrics, toggleLike, likedSongs, setVolume } = usePlayerStore();
  const { seekTo } = useAudioEngine();
  const [showVolSlider, setShowVolSlider] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const prevYoutubeId = useRef(currentSong?.youtubeId);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const loadYouTubeAPI = useCallback(() => {
    if ((window as any).YT) return Promise.resolve();
    return new Promise<void>((resolve) => {
      if (document.getElementById('yt-api-script')) {
        const check = setInterval(() => {
          if ((window as any).YT) { clearInterval(check); resolve(); }
        }, 100);
        return;
      }
      const tag = document.createElement('script');
      tag.id = 'yt-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onload = () => resolve();
      document.head.appendChild(tag);
    });
  }, []);

  const handleShuffle = () => { toggleShuffle(); };
  const handleRepeat = () => { cycleRepeat(); };
  const handleQueue = () => { toggleQueue(); };
  const handleLyrics = () => { toggleLyrics(); };
  const handleLike = () => {
    if (currentSong) {
      toggleLike(currentSong.id);
    }
  };
  const isCurrentSongLiked = currentSong ? likedSongs.some(s => s.id === currentSong.id) : false;

  useEffect(() => {
    const isYT = currentSong?.source === 'youtube' && !!currentSong.youtubeId;
    if (!showVideo || !isYT || !currentSong?.youtubeId) return;
    
    loadYouTubeAPI().then(() => {
      if (!(window as any).YT) return;
      
      if (!ytPlayer) {
        const player = new (window as any).YT.Player(playerContainerRef.current, {
          height: '100%',
          width: '100%',
          videoId: currentSong.youtubeId,
          playerVars: { autoplay: 1, controls: 0, rel: 0, mute: 1 },
          events: {
            onReady: (e: any) => {
              setYtPlayer(e.target);
              setYtReady(true);
              e.target.seekTo(progress * (duration || 0), true);
              if (!isPlaying) e.target.pauseVideo();
            },
            onStateChange: (e: any) => {
              if (e.data === 0) nextSong();
            },
          },
        });
        setYtPlayer(player);
      } else if (ytReady) {
        try {
          if (prevYoutubeId.current !== currentSong.youtubeId) {
            prevYoutubeId.current = currentSong.youtubeId;
            ytPlayer.loadVideoById(currentSong.youtubeId);
            ytPlayer.seekTo(progress * (duration || 0), true);
          }
        } catch {}
      }
    });
  }, [showVideo, currentSong?.youtubeId]);

  useEffect(() => {
    if (ytPlayer && ytReady) {
      try {
        if (isPlaying) ytPlayer.playVideo();
        else ytPlayer.pauseVideo();
      } catch {}
    }
  }, [isPlaying, ytPlayer, ytReady]);

  useEffect(() => {
    if (ytPlayer && ytReady) {
      try {
        ytPlayer.setVolume(isMuted ? 0 : volume * 100);
      } catch {}
    }
  }, [volume, isMuted, ytPlayer, ytReady]);

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
  }, [seekTo]);

  useEffect(() => {
    if (currentSong && !isYouTube && showVideo) {
      setShowVideo(false);
    }
  }, [currentSong, isYouTube, showVideo]);

  const loadVideo = () => {
    setShowVideo(true);
  };

  const closeVideo = () => {
    if (ytPlayer) {
      try { ytPlayer.stopVideo(); } catch {}
      try { ytPlayer.destroy(); } catch {}
      setYtPlayer(null);
      setYtReady(false);
    }
    setShowVideo(false);
  };

  useEffect(() => {
    if (!showVideo && ytPlayer) {
      try { ytPlayer.stopVideo(); } catch {}
    }
  }, [showVideo, ytPlayer]);

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
            <div ref={playerContainerRef} className="w-full h-full rounded-2xl" />
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

          <div className="relative flex items-center">
            <button 
              onClick={toggleMute} 
              onMouseEnter={() => setShowVolSlider(true)}
              className="p-2 text-white/60 hover:text-white transition-colors"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}>
              {isMuted || volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
            </button>
            {showVolSlider && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 120 }}
                exit={{ opacity: 0, width: 0 }}
                className="absolute left-full ml-3 flex items-center bg-black/60 rounded-full px-3 py-2"
                onMouseLeave={() => setShowVolSlider(false)}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--mood-primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                  }}
                />
              </motion.div>
            )}
          </div>
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
          <button onClick={handleLike} className={`p-2 transition-colors ${isCurrentSongLiked ? 'text-red-500' : 'hover:text-white'}`} title="Me gusta">
            <Heart size={20} fill={isCurrentSongLiked ? 'currentColor' : 'none'} />
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