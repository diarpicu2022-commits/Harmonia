import { Router } from 'express';
import axios from 'axios';

const router = Router();

const variations = (s: string) => {
  if (!s) return [''];
  const variants = [s];
  const cleaned = s.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/ft\..*/i, '').replace(/feat\..*/i, '').replace(/with.*/i, '').replace(/-.*$/, '').trim();
  if (cleaned && cleaned !== s) variants.push(cleaned);
  const noVer = s.replace(/v\d+/i, '').trim();
  if (noVer && noVer !== s) variants.push(noVer);
  return [...new Set(variants)];
};

router.get('/', async (req, res) => {
  let { artist, title } = req.query as { artist: string; title: string };
  if (!artist || !title) return res.status(400).json({ error: 'artist and title required' }) as any;

  console.log('[LYRICS] Searching:', artist, '-', title);

  const artistVars = variations(artist);
  const titleVars = variations(title);

  const searched = new Set();
  
  for (const a of artistVars) {
    for (const t of titleVars) {
      const key = `${a}|${t}`;
      if (searched.has(key)) continue;
      searched.add(key);
      
      for (const API of ['lrclib', 'lyrics.ovh']) {
        try {
          let url, check;
          if (API === 'lrclib') {
            url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(a)}&track_name=${encodeURIComponent(t)}`;
            const r = await axios.get(url, { timeout: 15000 });
            check = r.data;
          } else {
            url = `https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t)}`;
            const r = await axios.get(url, { timeout: 15000 });
            check = r.data;
          }
          
          if (API === 'lrclib' && (check?.syncedLyrics || check?.plainLyrics)) {
            return res.json({
              lyrics: check.plainLyrics || '',
              syncedLyrics: check.syncedLyrics || null,
              source: 'lrclib',
            });
          }
          if (API === 'lyrics.ovh' && check?.lyrics && check.lyrics.length > 50) {
            return res.json({ lyrics: check.lyrics, syncedLyrics: null, source: 'lyrics.ovh' });
          }
        } catch { continue; }
      }
    }
  }

  res.status(404).json({ error: 'Lyrics not found' });
});

export default router;
