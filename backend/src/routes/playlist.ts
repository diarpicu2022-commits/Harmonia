// playlist.ts
import { Router } from 'express';
import { Playlist } from '../models/index';
import { authMiddleware } from '../middleware/auth';
const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const playlists = await Playlist.find({ owner: userId });
  res.json({ playlists });
});

router.get('/:id', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: userId });
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist no encontrada' });
  }
  res.json({ playlist });
});

router.post('/', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { name, description } = req.body;
  const playlist = await Playlist.create({ name, description, owner: userId, songs: [] });
  res.status(201).json({ playlist });
});

router.put('/:id/songs', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { songs } = req.body;
  const playlist = await Playlist.findOneAndUpdate(
    { _id: req.params.id, owner: userId },
    { songs },
    { new: true }
  );
  res.json({ playlist });
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  await Playlist.findOneAndDelete({ _id: req.params.id, owner: userId });
  res.json({ success: true });
});

export default router;
