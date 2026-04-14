import { Router, Request, Response } from 'express';
import { MusicAIAgent } from '../agents/MusicAIAgent';
import { authMiddleware } from '../middleware/auth';
import { User } from '../models/index';

const router = Router();
const aiAgent = MusicAIAgent.getInstance();

router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' }) as any;

  try {
    const reply = await aiAgent.chat(message, context || {});
    res.json({ reply });
  } catch {
    res.status(500).json({ error: 'AI unavailable' });
  }
});

router.post('/recommendations', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' }) as any;

    const recentArtists = user.listeningHistory
      .slice(-20)
      .map((h: any) => h.artist)
      .filter(Boolean);

    const recommendations = await aiAgent.getPersonalizedRecommendations({
      favoriteGenres: user.preferences.favoriteGenres,
      recentArtists,
      mood: user.preferences.mood,
      timeOfDay: new Date().getHours(),
    });
    res.json({ recommendations });
  } catch {
    res.status(500).json({ error: 'Recommendations failed' });
  }
});

router.post('/detect-mood', authMiddleware, async (req: Request, res: Response) => {
  const { recentSongs } = req.body;
  if (!recentSongs?.length) return res.json({ mood: 'default', themeColor: '#7C3AED', recommendation: 'Explore new music', energyLevel: 5 }) as any;

  try {
    const result = await aiAgent.detectMoodFromHistory(recentSongs);
    const userId = (req as any).userId;
    await User.findByIdAndUpdate(userId, {
      'preferences.mood': result.mood,
      'preferences.themeColor': result.themeColor,
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Mood detection failed' });
  }
});

router.post('/playlist-name', authMiddleware, async (req: Request, res: Response) => {
  const { songs } = req.body;
  try {
    const name = await aiAgent.generatePlaylistName(songs || []);
    res.json({ name });
  } catch {
    res.status(500).json({ name: 'My Playlist' });
  }
});

export default router;
