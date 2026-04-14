// music.ts
import { Router } from 'express';
import { Song } from '../models/index';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/my', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const songs = await Song.find({ uploadedBy: userId }).sort({ createdAt: -1 });
  res.json({ songs });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  await Song.findOneAndDelete({ _id: req.params.id, uploadedBy: userId });
  res.json({ success: true });
});

export default router;

// ─── re-export other routes as stubs ──────────────────────────────────────────
