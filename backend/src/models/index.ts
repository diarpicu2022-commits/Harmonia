import mongoose, { Document, Schema } from 'mongoose';

// ─── User Model ───────────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: string;
  email: string;
  displayName: string;
  avatar?: string;
  googleId?: string;
  passwordHash?: string;
  preferences: {
    mood: 'happy' | 'energetic' | 'calm' | 'melancholic' | 'focused' | 'romantic' | 'default';
    favoriteGenres: string[];
    themeColor: string;
  };
  listeningHistory: Array<{ songId: string; playedAt: Date; durationPlayed: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  displayName: { type: String, required: true, trim: true },
  avatar: { type: String },
  googleId: { type: String, sparse: true, unique: true },
  passwordHash: { type: String },
  preferences: {
    mood: { type: String, enum: ['happy', 'energetic', 'calm', 'melancholic', 'focused', 'romantic', 'default'], default: 'default' },
    favoriteGenres: [{ type: String }],
    themeColor: { type: String, default: '#7C3AED' },
  },
  listeningHistory: [{
    songId: { type: String },
    playedAt: { type: Date, default: Date.now },
    durationPlayed: { type: Number, default: 0 },
  }],
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

// ─── Song Model ───────────────────────────────────────────────────────────────

export interface ISong extends Document {
  _id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverArt?: string;
  audioUrl?: string;
  youtubeId?: string;
  spotifyId?: string;
  soundcloudUrl?: string;
  source: 'local' | 'youtube' | 'spotify' | 'soundcloud' | 'deezer';
  genre?: string;
  year?: number;
  lyrics?: string;
  uploadedBy?: string;
  isPublic: boolean;
  playCount: number;
  tags: string[];
  waveformData?: number[];
  bpm?: number;
  key?: string;
  energy?: number;
  valence?: number;
  createdAt: Date;
}

const SongSchema = new Schema<ISong>({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  album: { type: String, default: 'Unknown Album', trim: true },
  duration: { type: Number, required: true },
  coverArt: { type: String },
  audioUrl: { type: String },
  youtubeId: { type: String },
  spotifyId: { type: String },
  soundcloudUrl: { type: String },
  source: { type: String, enum: ['local', 'youtube', 'spotify', 'soundcloud', 'deezer'], required: true },
  genre: { type: String },
  year: { type: Number },
  lyrics: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' } as any,
  isPublic: { type: Boolean, default: false },
  playCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  waveformData: [{ type: Number }],
  bpm: { type: Number },
  key: { type: String },
  energy: { type: Number, min: 0, max: 1 },
  valence: { type: Number, min: 0, max: 1 },
}, { timestamps: true });

SongSchema.index({ title: 'text', artist: 'text', album: 'text' });
export const Song = mongoose.model<ISong>('Song', SongSchema);

// ─── Playlist Model ───────────────────────────────────────────────────────────

export interface IPlaylist extends Document {
  name: string;
  description?: string;
  coverArt?: string;
  owner: string;
  songs: string[];
  isPublic: boolean;
  mood?: string;
  totalDuration: number;
  createdAt: Date;
}

const PlaylistSchema = new Schema<IPlaylist>({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  coverArt: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true } as any,
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  isPublic: { type: Boolean, default: false },
  mood: { type: String },
  totalDuration: { type: Number, default: 0 },
}, { timestamps: true });

export const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
