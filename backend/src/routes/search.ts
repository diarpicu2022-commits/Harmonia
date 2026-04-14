// ─── search.ts ────────────────────────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { MusicSearchService } from '../services/MusicSearchService';

const router = Router();
const searchService = MusicSearchService.getInstance();

router.get('/', async (req: Request, res: Response) => {
  const { q, source } = req.query as { q: string; source?: string };
  if (!q) return res.status(400).json({ error: 'Query required' }) as any;

  try {
    if (source === 'youtube') return res.json({ results: await searchService.searchYouTube(q) });
    if (source === 'spotify') return res.json({ results: await searchService.searchSpotify(q) });
    if (source === 'deezer') return res.json({ results: await searchService.searchDeezer(q) });
    res.json(await searchService.searchAll(q));
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
