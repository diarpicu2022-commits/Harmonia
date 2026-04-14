import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parseFile } from 'music-metadata';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth';
import { Song } from '../models/index';

const router = Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'music');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'covers');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Invalid audio format'));
  },
});

const coverUpload = multer({ storage: coverStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// Search album art from MusicBrainz/Cover Art Archive
async function searchAlbumArt(artist: string, album: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`artist:"${artist}" AND release:"${album}"`);
    const mbRes = await axios.get(`https://musicbrainz.org/ws/2/release/?query=${query}&fmt=json&limit=1`, {
      headers: { 'User-Agent': 'Harmonia/1.0 (harmonia-app@example.com)' },
      timeout: 5000,
    });
    const releases = mbRes.data.releases;
    if (releases?.length > 0) {
      const releaseId = releases[0].id;
      const coverRes = await axios.get(`https://coverartarchive.org/release/${releaseId}`, { timeout: 5000 });
      return coverRes.data.images?.[0]?.thumbnails?.large || coverRes.data.images?.[0]?.image || null;
    }
  } catch { /* silent */ }
  return null;
}

// ─── Upload audio file ────────────────────────────────────────────────────────

router.post('/audio', authMiddleware, upload.single('audio'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' }) as any;

  try {
    const filePath = req.file.path;
    const meta = await parseFile(filePath);
    const common = meta.common;
    const format = meta.format;

    let coverArtUrl: string | undefined;

    // Extract embedded cover art
    if (common.picture?.[0]) {
      const pic = common.picture[0];
      const coverDir = path.join(process.cwd(), 'uploads', 'covers');
      if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });
      const coverName = `${uuidv4()}.jpg`;
      const coverPath = path.join(coverDir, coverName);
      fs.writeFileSync(coverPath, pic.data);
      coverArtUrl = `/uploads/covers/${coverName}`;
    }

    // Search online if no embedded art
    if (!coverArtUrl && common.artist && common.album) {
      const onlineArt = await searchAlbumArt(common.artist, common.album);
      if (onlineArt) coverArtUrl = onlineArt;
    }

    const userId = (req as any).userId;
    const song = await Song.create({
      title: common.title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      duration: Math.floor(format.duration || 0),
      coverArt: coverArtUrl,
      audioUrl: `/uploads/music/${req.file.filename}`,
      source: 'local',
      genre: common.genre?.[0],
      year: common.year,
      uploadedBy: userId,
      isPublic: false,
      tags: common.genre || [],
    });

    res.json({ song });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload processing failed' });
  }
});

// ─── Upload cover art only ────────────────────────────────────────────────────

router.post('/cover/:songId', authMiddleware, coverUpload.single('cover'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' }) as any;
  const userId = (req as any).userId;

  try {
    const song = await Song.findOne({ _id: req.params.songId, uploadedBy: userId });
    if (!song) return res.status(404).json({ error: 'Song not found' }) as any;

    song.coverArt = `/uploads/covers/${req.file.filename}`;
    await song.save();
    res.json({ coverArt: song.coverArt });
  } catch {
    res.status(500).json({ error: 'Cover update failed' });
  }
});

// Stubs for other routes (to keep file compilable)
export default router;
