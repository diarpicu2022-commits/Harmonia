// user.ts
import { Router } from 'express';
import { User } from '../models/index';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById((req as any).userId).select('-passwordHash');
  res.json({ user });
});

router.put('/preferences', authMiddleware, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    (req as any).userId,
    { preferences: req.body },
    { new: true, select: '-passwordHash' }
  );
  res.json({ user });
});

router.post('/history', authMiddleware, async (req, res) => {
  const { songId, durationPlayed } = req.body;
  await User.findByIdAndUpdate((req as any).userId, {
    $push: { listeningHistory: { songId, durationPlayed, playedAt: new Date(), $slice: -100 } },
  });
  res.json({ success: true });
});

export default router;
