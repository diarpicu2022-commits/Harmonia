import { Router } from 'express';
import axios from 'axios';

const router = Router();

const variations = (s: string) => {
  if (!s) return [''];
  const v = new Set([s]);
  v.add(s.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/ft\..*/gi, '').replace(/feat\..*/gi, '').replace(/with.*/gi, '').replace(/-.*$/gi, '').trim());
  v.add(s.replace(/v\d*/gi, '').trim());
  v.add(s.replace(/official.*$/gi, '').trim());
  v.add(s.replace(/audio.*/gi, '').replace(/video.*/gi, '').trim());
  v.delete('');
  return Array.from(v);
};

router.get('/', async (req, res) => {
  let { artist, title } = req.query as { artist: string; title: string };
  if (!artist || !title) return res.status(400).json({ error: 'artist and title required' }) as any;

  const artistVars = variations(artist);
  const titleVars = variations(title);
  const searched = new Set();
  
  const tryUrl = async (url: string) => {
    const resp = await axios.get(url, { timeout: 12000 }).catch(() => null);
    return resp?.data;
  };

  const combos = [];
  for (const a of artistVars) {
    for (const t of titleVars) {
      combos.push({ a, t });
      combos.push({ a, t: a + ' ' + t });
    }
  }

  for (const { a, t } of combos) {
    if (!a || !t) continue;
    const key = `${a}|${t}`;
    if (searched.has(key)) continue;
    searched.add(key);

    const data = await tryUrl(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(a)}&track_name=${encodeURIComponent(t)}`);
    if (data?.syncedLyrics || data?.plainLyrics) {
      return res.json({ lyrics: data.plainLyrics || '', syncedLyrics: data.syncedLyrics || null, source: 'lrclib' });
    }
  }

  for (const { a, t } of combos) {
    if (!a || !t) continue;
    const key = `ovh|${a}|${t}`;
    if (searched.has(key)) continue;
    searched.add(key);

    const data = await tryUrl(`https://api.lyrics.ovh/v1/${encodeURIComponent(a)}/${encodeURIComponent(t)}`);
    if (data?.lyrics && data.lyrics.length > 50) {
      return res.json({ lyrics: data.lyrics, syncedLyrics: null, source: 'lyrics.ovh' });
    }
  }

  res.status(404).json({ error: 'Lyrics not found' });
});

export default router;
