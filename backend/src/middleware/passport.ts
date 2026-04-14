// ── middleware/passport.ts ───────────────────────────────────────────────────
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/index';

export const configurePassport = () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'harmonia-secret-change-in-prod';

  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.userId);
      done(null, user || false);
    } catch (err) { done(err, false); }
  }));

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.findOne({ email: profile.emails?.[0]?.value });
          if (user) {
            user.googleId = profile.id;
            if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails?.[0]?.value || '',
              displayName: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              preferences: { mood: 'default', favoriteGenres: [], themeColor: '#7C3AED' },
            });
          }
        }
        done(null, user);
      } catch (err) { done(err as Error, undefined); }
    }));
  }
};

// ── middleware/errorHandler.ts ───────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err.message, err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
};

// ── services/database.ts ─────────────────────────────────────────────────────
import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/harmonia';
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};
