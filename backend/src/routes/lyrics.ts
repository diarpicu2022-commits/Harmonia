import { Router } from 'express';
import axios from 'axios';

const router = Router();

const cleanName = (s: string) => s.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/ft\..*/i, '').trim();

router.get('/', async (req, res) => {
  let { artist, title } = req.query as { artist: string; title: string };
  if (!artist || !title) return res.status(400).json({ error: 'artist and title required' }) as any;

  const cleanArtist = cleanName(artist);
  const cleanTitle = cleanName(title);
  const sources = [
    { name: 'lrclib', url: `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}` },
    { name: 'lyrics.ovh', url: `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}` },
  ];

  for (const src of sources) {
    try {
      const isLrclib = src.name === 'lrclib';
      const resp = await axios.get(src.url, { timeout: 8000 });
      if (isLrclib) {
        if (resp.data?.syncedLyrics || resp.data?.plainLyrics) {
          return res.json({
            lyrics: resp.data.plainLyrics || '',
            syncedLyrics: resp.data.syncedLyrics || null,
            source: 'lrclib',
          });
        }
      } else if (resp.data?.lyrics) {
        return res.json({ lyrics: resp.data.lyrics, syncedLyrics: null, source: 'lyrics.ovh' });
      }
    } catch { continue; }
  }

  res.status(404).json({ error: 'Lyrics not found' });
});

export default router;
