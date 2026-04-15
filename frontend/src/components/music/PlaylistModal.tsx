import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Music2, Check, Loader2 } from 'lucide-react';
import { playlistAPI } from '../../services/api';
import { usePlaylistStore } from '../../store';
import toast from 'react-hot-toast';
import type { Song, Playlist } from '../../types';

interface Props {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaylistModal({ song, isOpen, onClose }: Props) {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { playlists, setPlaylists } = usePlaylistStore();

  useEffect(() => {
    if (isOpen) {
      playlistAPI.getAll().then(res => setPlaylists(res.data.playlists)).catch(() => {});
    }
  }, [isOpen, setPlaylists]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);
    try {
      const { data } = await playlistAPI.create(newPlaylistName.trim());
      const newPlaylistId = data.playlist.id;
      await addSongToPlaylist(newPlaylistId);
      setNewPlaylistName('');
    } catch {
      toast.error('Error al crear playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const addSongToPlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      const pl = playlists.find(p => p.id === playlistId || p._id === playlistId);
      const currentSongs = pl?.songs || [];
      const songId = song.id;
      await playlistAPI.updateSongs(playlistId, [...currentSongs, songId]);
      toast.success('Canción agregada a playlist');
      onClose();
    } catch {
      toast.error('Error al agregar canción');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (playlistId: string) => {
    setSelectedId(playlistId);
    addSongToPlaylist(playlistId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md glass-strong rounded-2xl p-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Clash Display',sans-serif" }}>
                Agregar a playlist
              </h3>
              <button onClick={onClose} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-white/40 text-sm mb-4">No tienes playlists aún</p>
                <div className="flex gap-2">
                  <input
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    placeholder="Nombre de playlist..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
                  />
                  <button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim() || isCreating}
                    className="px-4 py-2 rounded-lg btn-mood text-sm disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playlists.map(pl => (
                  <motion.button key={pl._id || pl.id} whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                    onClick={() => handleSelect(pl._id || pl.id)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      {pl.coverArt ? (
                        <img src={pl.coverArt} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Music2 size={18} style={{ color: 'var(--mood-primary)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{pl.name}</p>
                      <p className="text-xs text-white/40">{pl.songs?.length || 0} canciones</p>
                    </div>
                    {selectedId === pl._id && loading && <Loader2 size={16} className="animate-spin text-white/40" />}
                  </motion.button>
                ))}
                <div className="pt-3 border-t border-white/6">
                  <div className="flex gap-2">
                    <input
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      placeholder="Crear nueva playlist..."
                      className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none"
                      onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
                    />
                    <button
                      onClick={handleCreatePlaylist}
                      disabled={!newPlaylistName.trim() || isCreating}
                      className="px-4 py-2 rounded-lg btn-mood text-sm disabled:opacity-50"
                    >
                      {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}