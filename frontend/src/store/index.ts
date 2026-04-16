import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song, User, MoodType, PlayerState, ChatMessage, Playlist } from '../types';
import { DoublyLinkedListClient } from '../utils/DoublyLinkedListClient';
import { userAPI } from '../services/api';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'harmonia-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);

// ─── Mood Store ───────────────────────────────────────────────────────────────

interface MoodStore {
  mood: MoodType;
  themeColor: string;
  energyLevel: number;
  setMood: (mood: MoodType, themeColor?: string, energy?: number) => void;
}

const MOOD_COLORS: Record<MoodType, string> = {
  happy: '#F59E0B',
  energetic: '#EF4444',
  calm: '#0EA5E9',
  melancholic: '#6366F1',
  focused: '#10B981',
  romantic: '#EC4899',
  default: '#7C3AED',
};

export const useMoodStore = create<MoodStore>()((set) => ({
  mood: 'default',
  themeColor: '#7C3AED',
  energyLevel: 5,
  setMood: (mood, themeColor, energy) => {
    const color = themeColor || MOOD_COLORS[mood];
    document.documentElement.setAttribute('data-mood', mood);
    document.documentElement.style.setProperty('--mood-primary', color);
    set({ mood, themeColor: color, energyLevel: energy ?? 5 });
    userAPI.updatePreferences({ mood, themeColor: color }).catch(() => {});
  },
}));

// ─── Player Store (DoublyLinkedList powered) ──────────────────────────────────

interface PlayerStore extends PlayerState {
  playlist: DoublyLinkedListClient<Song>;
  loadQueue: (songs: Song[], startIndex?: number) => void;
  play: (song?: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  nextSong: () => Song | null;
  prevSong: () => Song | null;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song, position?: 'start' | 'end' | number) => void;
  removeFromQueue: (index: number) => void;
  jumpToIndex: (index: number) => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
  toggleFullscreen: () => void;
}

export const usePlayerStore = create<PlayerStore>()((set, get) => {
  const playlist = new DoublyLinkedListClient<Song>();

  return {
    playlist,
    currentSong: null,
    isPlaying: false,
    volume: 0.8,
    progress: 0,
    duration: 0,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'none',
    currentQueue: [],
    currentIndex: -1,
    showQueue: false,
    showLyrics: false,
    isFullscreen: false,

    loadQueue: (songs, startIndex = 0) => {
      playlist.fromArray(songs);
      playlist.setCurrent(startIndex);
      const song = songs[startIndex] || null;
      set({
        currentQueue: songs,
        currentSong: song,
        currentIndex: startIndex,
        isPlaying: true,
      });
      if (song) userAPI.trackHistory(song.id, 0).catch(() => {});
    },

    play: (song) => {
      if (song) {
        const idx = get().currentQueue.findIndex(s => s.id === song.id);
        if (idx >= 0) {
          playlist.setCurrent(idx);
          set({ currentSong: song, currentIndex: idx, isPlaying: true, progress: 0 });
          userAPI.trackHistory(song.id, 0).catch(() => {});
        }
      } else {
        set({ isPlaying: true });
      }
    },

    pause: () => set({ isPlaying: false }),

    togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),

    nextSong: () => {
      const { repeatMode, isShuffled, currentQueue } = get();
      if (repeatMode === 'one') {
        set({ progress: 0, isPlaying: true });
        return get().currentSong;
      }
      if (isShuffled) {
        const idx = Math.floor(Math.random() * currentQueue.length);
        const song = currentQueue[idx];
        playlist.setCurrent(idx);
        set({ currentSong: song, currentIndex: idx, progress: 0, isPlaying: true });
        if (song) userAPI.trackHistory(song.id, 0).catch(() => {});
        return song;
      }
      const next = playlist.next(repeatMode === 'all');
      if (next) {
        set({ currentSong: next, currentIndex: playlist.getCurrentIndex(), progress: 0, isPlaying: true });
        userAPI.trackHistory(next.id, 0).catch(() => {});
      } else {
        set({ isPlaying: false });
      }
      return next;
    },

    prevSong: () => {
      const prev = playlist.prev(true);
      if (prev) set({ currentSong: prev, currentIndex: playlist.getCurrentIndex(), progress: 0, isPlaying: true });
      return prev;
    },

    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),
    setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
    toggleMute: () => set(s => ({ isMuted: !s.isMuted })),
    toggleShuffle: () => set(s => ({ isShuffled: !s.isShuffled })),

    cycleRepeat: () => set(s => ({
      repeatMode: s.repeatMode === 'none' ? 'all' : s.repeatMode === 'all' ? 'one' : 'none',
    })),

    addToQueue: (song, position = 'end') => {
      if (position === 'start') playlist.addFirst(song);
      else if (position === 'end') playlist.addLast(song);
      else if (typeof position === 'number') playlist.addAt(position, song);
      const queue = playlist.toArray();
      set({ currentQueue: queue });
    },

    removeFromQueue: (index) => {
      playlist.removeAt(index);
      const queue = playlist.toArray();
      set({ currentQueue: queue });
    },

    jumpToIndex: (index) => {
      playlist.setCurrent(index);
      const song = playlist.getCurrentData();
      if (song) set({ currentSong: song, currentIndex: index, progress: 0, isPlaying: true });
    },

    toggleQueue: () => set(s => ({ showQueue: !s.showQueue })),
    toggleLyrics: () => set(s => ({ showLyrics: !s.showLyrics })),
toggleFullscreen: () => {
      sessionStorage.setItem('fullscreen-toggling', 'true');
      set(s => ({ isFullscreen: !s.isFullscreen }));
    },
  };
});

// ─── AI Chat Store ────────────────────────────────────────────────────────────

interface AIChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setTyping: (v: boolean) => void;
  toggleChat: () => void;
  clearChat: () => void;
}

export const useAIChatStore = create<AIChatStore>()((set) => ({
  messages: [{
    id: '0',
    role: 'assistant',
    content: '🎵 Hola! Soy Harmonia, tu asistente musical con IA. Puedo recomendarte música, hablar sobre artistas, ayudarte a crear playlists perfectas, o lo que necesites. ¿Qué quieres escuchar hoy?',
    timestamp: new Date(),
  }],
  isOpen: false,
  isTyping: false,
  addMessage: (msg) => set(s => ({
    messages: [...s.messages, { ...msg, id: crypto.randomUUID(), timestamp: new Date() }],
  })),
  setTyping: (isTyping) => set({ isTyping }),
  toggleChat: () => set(s => ({ isOpen: !s.isOpen })),
  clearChat: () => set({ messages: [] }),
}));

// ─── Playlists Store ──────────────────────────────────────────────────────────

interface PlaylistStore {
  playlists: Playlist[];
  setPlaylists: (p: Playlist[]) => void;
  addPlaylist: (p: Playlist) => void;
  removePlaylist: (id: string) => void;
  updatePlaylist: (id: string, data: Partial<Playlist>) => void;
}

export const usePlaylistStore = create<PlaylistStore>()((set) => ({
  playlists: [],
  setPlaylists: (playlists) => set({ playlists }),
  addPlaylist: (p) => set(s => ({ playlists: [p, ...s.playlists] })),
  removePlaylist: (id) => set(s => ({ playlists: s.playlists.filter(p => p.id !== id) })),
  updatePlaylist: (id, data) => set(s => ({
    playlists: s.playlists.map(p => p.id === id ? { ...p, ...data } : p),
  })),
}));
