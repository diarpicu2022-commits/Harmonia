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
      <AnimatePresence mode="wait">
        {isFullscreen ? (
          <ExpandedPlayer key="expanded" />
        ) : (
          <>
            <Sidebar />
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
              <PlayerBar />
            </div>
            {showQueue && <QueuePanel />}
            {showLyrics && <LyricsPanel />}
          </>
        )}
      </AnimatePresence>
      <AIChat />
    </div>
  );
}
