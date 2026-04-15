import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from 'passport';
import path from 'path';

import { connectDB } from './services/database';
import { configurePassport } from './middleware/passport';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import musicRoutes from './routes/music';
import playlistRoutes from './routes/playlist';
import searchRoutes from './routes/search';
import aiRoutes from './routes/ai';
import userRoutes from './routes/user';
import lyricsRoutes from './routes/lyrics';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security & middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('combined'));

app.set('trust proxy', 1);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  'http://localhost:5173',
  frontendUrl,
  'https://harmonia-git-main-diarpicu2022-commits-projects.vercel.app',
  'https://harmonia-okm9f25l3-diarpicu2022-commits-projects.vercel.app',
  'https://harmonia-42u3kfti9-diarpicu2022-commits-projects.vercel.app',
  'https://harmonia-frontend-chi.vercel.app',
  'https://harmonia-iuq94e0ib-diarpicu2022-commits-projects.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Passport
configurePassport();
app.use(passport.initialize());

// Static files for uploaded music
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🎵 Harmonia Backend running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch(console.error);

export default app;
