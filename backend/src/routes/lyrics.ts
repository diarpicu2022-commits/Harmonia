import { Router } from 'express';
import axios from 'axios';

const router = Router();

const variations = (s: string) => {
  const variants = [s];
  const cleaned = s.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/ft\..*/i, '').replace(/feat\..*/i, '').replace(/with.*/i, '').trim();
  if (cleaned !== s) variants.push(cleaned);
  const noExt = s.replace(/\.[a-z]+$/i, '').trim();
  if (noExt !== s && noExt !== cleaned) variants.push(noExt);
  return [...new Set(variants)];
};

router.get('/', async (req, res) => {
  let { artist, title } = req.query as { artist: string; title: string };
  if (!artist || !title) return res.status(400).json({ error: 'artist and title required' }) as any;

  const artistVars = variations(artist);
  const titleVars = variations(title);

  const sources = [];
  for (const a of artistVars) {
    for (const t of titleVars) {
      sources.push(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(a)}&track_name=${encodeURIComponent(t)}`);
      sources.push(`https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t)}`);
    }
  }

  for (const url of sources) {
    try {
      const isLrclib = url.includes('lrclib');
      const resp = await axios.get(url, { timeout: 10000, headers: isLrclib ? { 'User-Agent': 'Harmonia/1.0' } : {} });
      if (isLrclib) {
        if (resp.data?.syncedLyrics || resp.data?.plainLyrics) {
          return res.json({
            lyrics: resp.data.plainLyrics || '',
            syncedLyrics: resp.data.syncedLyrics || null,
            source: 'lrclib',
          });
        }
      } else if (resp.data?.lyrics && resp.data.lyrics.length > 50) {
        return res.json({ lyrics: resp.data.lyrics, syncedLyrics: null, source: 'lyrics.ovh' });
      }
    } catch { continue; }
  }

  res.status(404).json({ error: 'Lyrics not found' });
});

export default router;
