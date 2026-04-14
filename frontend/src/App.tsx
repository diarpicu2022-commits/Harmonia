import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuthStore, useMoodStore } from './store';
import { authAPI } from './services/api';
import { useAudioEngine } from './hooks/useAudioEngine';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './components/pages/LoginPage';
import HomePage from './components/pages/HomePage';
import SearchPage from './components/pages/SearchPage';
import LibraryPage from './components/pages/LibraryPage';
import UploadPage from './components/pages/UploadPage';
import PlaylistPage from './components/pages/PlaylistPage';
import AuthCallback from './components/pages/AuthCallback';

import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

// ─── Audio Engine (always active) ────────────────────────────────────────────
const AudioEngineProvider = () => {
  useAudioEngine();
  return <div id="yt-player-container" style={{ display: 'none' }} />;
};

// ─── Auth Guard ───────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Animated Routes ──────────────────────────────────────────────────────────
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="playlist/:id" element={<PlaylistPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// ─── Auth Initializer ─────────────────────────────────────────────────────────
const AuthInitializer = () => {
  const { token, setUser, logout, setLoading } = useAuthStore();
  const { setMood } = useMoodStore();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    authAPI.verify()
      .then(({ data }) => {
        setUser(data.user);
        if (data.user.preferences?.mood) {
          setMood(data.user.preferences.mood, data.user.preferences.themeColor);
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token]);

  return null;
};

// ─── Background Orbs (mood-reactive) ─────────────────────────────────────────
const BackgroundOrbs = () => (
  <>
    <div className="bg-orb bg-orb-1" />
    <div className="bg-orb bg-orb-2" />
    <div className="bg-orb bg-orb-3" />
  </>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer />
        <AudioEngineProvider />
        <BackgroundOrbs />
        <AnimatedRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,15,25,0.95)',
              color: '#F1F0FF',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
