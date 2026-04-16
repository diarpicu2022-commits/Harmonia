import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import PlayerBar from '../player/PlayerBar';
import AIChat from '../ai/AIChat';
import QueuePanel from '../player/QueuePanel';
import LyricsPanel from '../player/LyricsPanel';
import ExpandedPlayer from '../player/ExpandedPlayer';
import { usePlayerStore } from '../../store';

export default function AppLayout() {
  const { showQueue, showLyrics, isFullscreen } = usePlayerStore();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080810' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex h-full w-full ${isFullscreen ? 'fixed inset-0 z-50' : 'flex'}`}
      >
        {isFullscreen ? (
          <ExpandedPlayer key="expanded" />
        ) : (
          <>
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                <motion.div
                  key="main-content"
                  className="h-full"
                >
                  <Outlet />
                </motion.div>
              </main>
              <PlayerBar />
            </div>
            {showQueue && <QueuePanel />}
            {showLyrics && <LyricsPanel />}
          </>
        )}
      </motion.div>
      <AIChat />
    </div>
  );
}
