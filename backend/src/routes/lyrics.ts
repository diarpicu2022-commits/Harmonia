import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/', async (req, res) => {
  const { artist, title } = req.query as { artist: string; title: string };
  if (!artist || !title) return res.status(400).json({ error: 'artist and title required' }) as any;

  // Try lrclib first (has synced lyrics)
  try {
    const lrc = await axios.get(`https://lrclib.net/api/get`, {
      params: { artist_name: artist, track_name: title },
      timeout: 5000,
    });
    if (lrc.data?.syncedLyrics || lrc.data?.plainLyrics) {
      return res.json({
        lyrics: lrc.data.plainLyrics || '',
        syncedLyrics: lrc.data.syncedLyrics || null,
        source: 'lrclib',
      });
    }
  } catch { /* try next */ }

  // Fallback to lyrics.ovh
  try {
    const ovh = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 5000 });
    if (ovh.data?.lyrics) {
      return res.json({ lyrics: ovh.data.lyrics, syncedLyrics: null, source: 'lyrics.ovh' });
    }
  } catch { /* no lyrics found */ }

  res.status(404).json({ error: 'Lyrics not found' });
});

export default router;
