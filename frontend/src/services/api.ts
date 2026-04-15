import axios from 'axios';
import type { SearchResults, Song, Playlist, User, MoodAnalysis, AIRecommendation } from '../types';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, ''),
  timeout: 15000,
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('harmonia-auth')
    ? JSON.parse(localStorage.getItem('harmonia-auth')!).state?.token
    : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('harmonia-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (email: string, password: string, displayName: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { email, password, displayName }),

  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),

  verify: () => api.get<{ user: User }>('/auth/verify'),

  googleLogin: () => { 
    const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/api';
    window.location.href = `${apiUrl}/auth/google`; 
  },
};

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchAPI = {
  searchAll: (q: string) => api.get<SearchResults>('/search', { params: { q } }),
  searchSource: (q: string, source: string) => api.get<{ results: Song[] }>('/search', { params: { q, source } }),
};

// ─── Music ────────────────────────────────────────────────────────────────────

export const musicAPI = {
  getMySongs: () => api.get<{ songs: Song[] }>('/music/my'),
  deleteSong: (id: string) => api.delete(`/music/${id}`),
};

// ─── Playlists ────────────────────────────────────────────────────────────────

export const playlistAPI = {
  getAll: () => api.get<{ playlists: Playlist[] }>('/playlists'),
  create: (name: string, description?: string) =>
    api.post<{ playlist: Playlist }>('/playlists', { name, description }),
  updateSongs: (id: string, songs: string[]) =>
    api.put<{ playlist: Playlist }>(`/playlists/${id}/songs`, { songs }),
  delete: (id: string) => api.delete(`/playlists/${id}`),
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadAPI = {
  uploadAudio: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('audio', file);
    return api.post<{ song: Song }>('/upload/audio', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },
  uploadCover: (songId: string, file: File) => {
    const form = new FormData();
    form.append('cover', file);
    return api.post<{ coverArt: string }>(`/upload/cover/${songId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── AI ───────────────────────────────────────────────────────────────────────

export const aiAPI = {
  chat: (message: string, context: object) =>
    api.post<{ reply: string }>('/ai/chat', { message, context }),

  getRecommendations: () =>
    api.post<{ recommendations: AIRecommendation[] }>('/ai/recommendations', {}),

  detectMood: (recentSongs: Array<{ title: string; artist: string; genre?: string }>) =>
    api.post<MoodAnalysis>('/ai/detect-mood', { recentSongs }),

  generatePlaylistName: (songs: Array<{ title: string; artist: string }>) =>
    api.post<{ name: string }>('/ai/playlist-name', { songs }),
};

// ─── Lyrics ───────────────────────────────────────────────────────────────────

export const lyricsAPI = {
  get: (artist: string, title: string) =>
    api.get<{ lyrics: string; syncedLyrics: string | null; source: string }>(
      '/lyrics', { params: { artist, title } }
    ),
};

// ─── User ─────────────────────────────────────────────────────────────────────

export const userAPI = {
  getProfile: () => api.get<{ user: User }>('/user/profile'),
  updatePreferences: (prefs: object) => api.put('/user/preferences', prefs),
  trackHistory: (songId: string, durationPlayed: number) =>
    api.post('/user/history', { songId, durationPlayed }),
};

export default api;
