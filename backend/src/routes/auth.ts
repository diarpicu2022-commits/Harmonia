import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { User } from '../models/index';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'harmonia-secret-change-in-prod';
const JWT_EXPIRES = '7d';

const generateToken = (userId: string): string =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ─── Register ─────────────────────────────────────────────────────────────────

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').isLength({ min: 2 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }) as any;

    const { email, password, displayName } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already registered' }) as any;

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ email, displayName, passwordHash, preferences: { mood: 'default', favoriteGenres: [], themeColor: '#7C3AED' } });

      const token = generateToken(user._id.toString());
      res.status(201).json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar, preferences: user.preferences } });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// ─── Login ─────────────────────────────────────────────────────────────────────

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }) as any;

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' }) as any;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' }) as any;

      const token = generateToken(user._id.toString());
      res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar, preferences: user.preferences } });
    } catch {
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

const frontendUrls = [
  'http://localhost:5173',
  'https://harmonia-git-main-diarpicu2022-commits-projects.vercel.app',
  'https://harmonia-okm9f25l3-diarpicu2022-commits-projects.vercel.app',
  'https://harmonia-42u3kfti9-diarpicu2022-commits-projects.vercel.app',
];
const defaultFrontend = frontendUrls[1];

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${defaultFrontend}/login?error=google_failed` }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    res.redirect(`${defaultFrontend}/auth/callback?token=${token}`);
  }
);

// ─── Verify Token ─────────────────────────────────────────────────────────────

router.get('/verify', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' }) as any;

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User not found' }) as any;
    res.json({ user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar, preferences: user.preferences } });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
