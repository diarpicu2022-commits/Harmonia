// ─── Core Domain Types ────────────────────────────────────────────────────────

export type MoodType = 'happy' | 'energetic' | 'calm' | 'melancholic' | 'focused' | 'romantic' | 'default';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverArt?: string;
  audioUrl?: string;
  youtubeId?: string;
  spotifyId?: string;
  previewUrl?: string;
  source: 'local' | 'youtube' | 'spotify' | 'soundcloud' | 'deezer';
  genre?: string;
  year?: number;
  lyrics?: string;
  bpm?: number;
  key?: string;
  energy?: number;
  valence?: number;
  playCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  songs: Song[];
  mood?: MoodType;
  totalDuration: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  preferences: {
    mood: MoodType;
    favoriteGenres: string[];
    themeColor: string;
  };
}

// ─── Player State ─────────────────────────────────────────────────────────────

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  currentQueue: Song[];
  currentIndex: number;
  showQueue: boolean;
  showLyrics: boolean;
  isFullscreen: boolean;
}

// ─── Search Results ───────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverArt?: string;
  source: 'youtube' | 'spotify' | 'soundcloud' | 'deezer';
  youtubeId?: string;
  spotifyId?: string;
  previewUrl?: string;
  sourceUrl?: string;
}

export interface SearchResults {
  youtube: SearchResult[];
  spotify: SearchResult[];
  deezer: SearchResult[];
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface AIRecommendation {
  query: string;
  reason: string;
  searchTerm: string;
}

export interface MoodAnalysis {
  mood: MoodType;
  themeColor: string;
  recommendation: string;
  energyLevel: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  song?: Song;
  error?: string;
}
