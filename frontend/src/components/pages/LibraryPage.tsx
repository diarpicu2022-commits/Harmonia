// LibraryPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Library, Music2 } from 'lucide-react';
import { usePlayerStore, usePlaylistStore } from '../../store';
import { musicAPI, playlistAPI } from '../../services/api';
import SongCard from '../music/SongCard';

export function LibraryPage() {
  const { playlists, setPlaylists } = usePlaylistStore();
  const { loadQueue } = usePlayerStore();
  const navigate = useNavigate();

  useEffect(() => {
    playlistAPI.getAll().then(({ data }) => setPlaylists(data.playlists)).catch(() => {});
  }, []);

  return (
    <div className="px-8 py-8 min-h-full">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Clash Display',sans-serif" }}>
        Mi Biblioteca
      </motion.h1>

      {playlists.length === 0 ? (
        <div className="text-center mt-20">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--mood-surface)' }}>
            <Library size={28} style={{ color: 'var(--mood-primary)' }} />
          </div>
          <p className="text-white/30 text-sm">Tu biblioteca está vacía. ¡Crea una playlist o sube música!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {playlists.map((pl, i) => (
            <motion.div key={pl.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.03, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/playlist/${pl.id}`)}
              className="glass rounded-2xl p-4 cursor-pointer group"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-3"
                style={{ background: 'var(--mood-surface)' }}>
                {pl.coverArt
                  ? <img src={pl.coverArt} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <Music2 size={36} style={{ color: 'var(--mood-primary)', opacity: 0.4 }} />
                    </div>
                }
              </div>
              <p className="text-sm font-semibold text-white/85 truncate">{pl.name}</p>
              <p className="text-xs text-white/35">{pl.songs.length} canciones</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryPage;
