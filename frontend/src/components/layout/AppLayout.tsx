import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import PlayerBar from '../player/PlayerBar';
import AIChat from '../ai/AIChat';
import QueuePanel from '../player/QueuePanel';
import LyricsPanel from '../player/LyricsPanel';
import { usePlayerStore } from '../../store';

export default function AppLayout() {
  const { showQueue, showLyrics, isFullscreen } = usePlayerStore();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080810' }}>
      {/* Sidebar */}
      {!isFullscreen && (
        <Sidebar />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Player bar */}
        {!isFullscreen && <PlayerBar />}
      </div>

      {/* Side panels */}
      {showQueue && !isFullscreen && <QueuePanel />}
      {showLyrics && !isFullscreen && <LyricsPanel />}

      {/* AI Chat floating */}
      <AIChat />
    </div>
  );
}
