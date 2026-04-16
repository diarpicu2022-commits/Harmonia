import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../store';
import { userAPI } from '../services/api';

let currentHowl: Howl | null = null;
let ytPlayer: any = null;
let ytReady = false;
let progressInterval: ReturnType<typeof setInterval> | null = null;

// Load YouTube IFrame API once
const loadYouTubeAPI = () => {
  if (document.getElementById('yt-api-script')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
};

export const useAudioEngine = () => {
  const {
    currentSong, isPlaying, volume, isMuted,
    setProgress, setDuration, nextSong, progress, isFullscreen,
  } = usePlayerStore();
  const playStartRef = useRef<number>(0);
  const songRef = useRef(currentSong);
  songRef.current = currentSong;
  const lastFullscreenRef = useRef(isFullscreen);
  lastFullscreenRef.current = isFullscreen;

  const stopCurrent = useCallback(() => {
    if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
    if (currentHowl) { currentHowl.stop(); currentHowl.unload(); currentHowl = null; }
    if (ytPlayer) { try { ytPlayer.stopVideo(); } catch { /* noop */ } }
  }, []);

  const startProgressTracking = useCallback((getDuration: () => number, getPosition: () => number) => {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      const pos = getPosition();
      const dur = getDuration() || (currentSong?.duration || 1);
      if (dur > 0) setProgress(pos / dur);
    }, 250);
  }, [setProgress]);

  // ─── Load & play song ──────────────────────────────────────────────────────

  useEffect(() => {
    // Skip if fullscreen just toggled (same song, don't reload)
    const fullscreenChanged = lastFullscreenRef.current !== isFullscreen;
    lastFullscreenRef.current = isFullscreen;
    
    if (!currentSong) return;
    if (fullscreenChanged && songRef.current?.id === currentSong.id) return;
    stopCurrent();
    setProgress(0);
    playStartRef.current = Date.now();

    if (currentSong.source === 'youtube' && currentSong.youtubeId) {
      // YouTube playback via hidden iframe
      loadYouTubeAPI();
      const initYT = () => {
        const container = document.getElementById('yt-player-container');
        if (!container) { setTimeout(initYT, 300); return; }

        if (ytReady && ytPlayer) {
          ytPlayer.loadVideoById(currentSong.youtubeId!);
          setDuration(0);
        } else {
          (window as any).onYouTubeIframeAPIReady = () => {
            ytReady = true;
            ytPlayer = new (window as any).YT.Player('yt-player-container', {
              height: '0', width: '0',
              videoId: currentSong.youtubeId,
              playerVars: { autoplay: 1, controls: 0, rel: 0 },
              events: {
                onReady: (e: any) => {
                  e.target.setVolume(isMuted ? 0 : volume * 100);
                  if (isPlaying) e.target.playVideo();
                  setDuration(e.target.getDuration());
                  startProgressTracking(
                    () => ytPlayer?.getDuration() || 0,
                    () => ytPlayer?.getCurrentTime() || 0
                  );
                },
                onStateChange: (e: any) => {
                  if (e.data === 0) nextSong(); // ended
                  if (e.data === 1) setDuration(ytPlayer?.getDuration() || 0);
                },
              },
            });
          };
        }
      };
      initYT();

    } else if (currentSong.source === 'spotify' || currentSong.source === 'deezer') {
      // Spotify/Deezer: show message and use preview if available
      const src = currentSong.previewUrl || '';
      if (!src) {
        console.warn('No preview available for', currentSong.source);
        return;
      }
      currentHowl = new Howl({
        src: [src],
        html5: true,
        volume: isMuted ? 0 : volume,
        autoplay: isPlaying,
        onload: () => {
          const dur = currentHowl?.duration() || 0;
          setDuration(dur || currentSong.duration || 0);
        },
        onend: () => nextSong(),
        onplay: () => startProgressTracking(
          () => currentHowl?.duration() || currentSong.duration || 0,
          () => currentHowl?.seek() as number || 0
        ),
        onloaderror: (_, err) => console.error('Audio load error:', err),
      });
    } else if (currentSong.audioUrl || currentSong.previewUrl) {
      // Howler for local / preview audio
      const src = currentSong.audioUrl?.startsWith('/')
        ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${currentSong.audioUrl}`
        : (currentSong.audioUrl || currentSong.previewUrl || '');

      currentHowl = new Howl({
        src: [src],
        html5: true,
        volume: isMuted ? 0 : volume,
        autoplay: isPlaying,
        onload: () => {
          const dur = currentHowl?.duration() || 0;
          setDuration(dur || currentSong.duration || 0);
          if (!dur && currentSong.duration) {
            startProgressTracking(
              () => currentSong.duration || 0,
              () => currentHowl?.seek() as number || 0
            );
          }
        },
        onend: () => nextSong(),
        onplay: () => startProgressTracking(
          () => currentHowl?.duration() || currentSong.duration || 0,
          () => currentHowl?.seek() as number || 0
        ),
        onpause: () => { if (progressInterval) clearInterval(progressInterval); },
        onloaderror: (_, err) => console.error('Audio load error:', err),
      });
    }

    return () => {
      // Track listening history on song change
      if (songRef.current && playStartRef.current) {
        const duration = Math.floor((Date.now() - playStartRef.current) / 1000);
        if (duration > 5) userAPI.trackHistory(songRef.current.id, duration).catch(() => {});
      }
    };
  }, [currentSong?.id]);

  // ─── Play/Pause ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (currentHowl) {
      if (isPlaying) currentHowl.play();
      else currentHowl.pause();
    }
    if (ytPlayer && ytReady) {
      try {
        if (isPlaying) ytPlayer.playVideo();
        else ytPlayer.pauseVideo();
      } catch { /* noop */ }
    }
  }, [isPlaying]);

  // ─── Volume ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const v = isMuted ? 0 : volume;
    if (currentHowl) currentHowl.volume(v);
    if (ytPlayer && ytReady) { try { ytPlayer.setVolume(v * 100); } catch { /* noop */ } }
  }, [volume, isMuted]);

  // ─── Seek ──────────────────────────────────────────────────────────────────

  const seekTo = useCallback((ratio: number) => {
    if (currentHowl) {
      const dur = currentHowl.duration();
      if (dur) { currentHowl.seek(ratio * dur); setProgress(ratio); }
    }
    if (ytPlayer && ytReady) {
      try {
        const dur = ytPlayer.getDuration();
        if (dur) { ytPlayer.seekTo(ratio * dur, true); setProgress(ratio); }
      } catch { /* noop */ }
    }
  }, [setProgress]);

  return { seekTo };
};
