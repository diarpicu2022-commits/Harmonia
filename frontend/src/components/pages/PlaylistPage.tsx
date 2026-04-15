import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, Music2, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { usePlaylistStore, usePlayerStore } from '../../store';
import { searchAPI, playlistAPI } from '../../services/api';
import type { Song, Playlist } from '../../types';
import SongCard from '../music/SongCard';
import toast from 'react-hot-toast';

async function fetchSongDetails(songId: string): Promise<Song | null> {
  if (!songId) return null;
  
  let source = 'spotify';
  let actualId = songId;
  
  if (songId.startsWith('yt') || songId.startsWith('sp') || songId.startsWith('dz')) {
    source = songId.substring(0, 2) === 'yt' ? 'youtube' : songId.substring(0, 2) === 'sp' ? 'spotify' : 'deezer';
    actualId = songId.substring(2);
  } else {
    return null;
  }
  
  try {
    const { data } = await searchAPI.searchSource(actualId, source);
    return data.results[0] || null;
  } catch {
    return null;
  }
}

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadQueue, toggleShuffle } = usePlayerStore();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleRemoveSong = async (songId: string) => {
    if (!playlist || !id) return;
    const currentSongIds = playlist.songs || [];
    const newSongIds = currentSongIds.filter(s => s !== songId);
    try {
      await playlistAPI.updateSongs(id, newSongIds);
      setPlaylist({ ...playlist, songs: newSongIds });
      setSongs(songs.filter(s => s.id !== songId));
      toast.success('Canción eliminada de la playlist');
    } catch {
      toast.error('Error al eliminar canción');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta playlist?')) return;
    setShowMenu(false);
    try {
      await playlistAPI.delete(id);
      toast.success('Playlist eliminada');
      navigate('/library');
    } catch {
      toast.error('Error al eliminar playlist');
    }
  };

  useEffect(() => {
    if (!id) return;
    
    playlistAPI.getById(id)
      .then(({ data }) => {
        setPlaylist(data.playlist);
        return data.playlist?.songs || [];
      })
      .then(songIds => {
        if (!songIds.length) {
          setLoading(false);
          return;
        }
        return Promise.all(songIds.map(fetchSongDetails));
      })
      .then(results => {
        if (results) setSongs(results.filter(Boolean) as Song[]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/30">Playlist no encontrada</p>
      </div>
    );
  }

  const totalMins = Math.floor(songs.reduce((a, s) => a + (s.duration || 0), 0) / 60);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="relative px-8 py-10 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, var(--mood-surface) 0%, transparent 100%)' }}>
        <div className="flex items-end gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 mood-glow"
            style={{ background: 'var(--mood-surface)' }}
          >
            {playlist.coverArt
              ? <img src={playlist.coverArt} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Music2 size={48} style={{ color: 'var(--mood-primary)', opacity: 0.4 }} />
                </div>
            }
          </motion.div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Playlist</p>
            <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Display',sans-serif" }}>
              {playlist.name}
            </h1>
            {playlist.description && <p className="text-white/50 text-sm mb-3">{playlist.description}</p>}
            <p className="text-white/35 text-xs">
              {playlist.songs.length} canciones · {totalMins} min
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => loadQueue(songs, 0)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-full btn-mood font-semibold text-sm disabled:opacity-50">
            <Play size={18} fill="white" /> Reproducir
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { loadQueue(songs, 0); toggleShuffle(); }}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Shuffle size={16} /> Aleatorio
          </motion.button>
          <div className="relative">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 rounded-full text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MoreHorizontal size={18} />
            </motion.button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 rounded-xl border border-white/10 z-50 py-1"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                <button
                  onClick={handleDeletePlaylist}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left"
                >
                  <Trash2 size={16} /> Eliminar playlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Songs list */}
      <div className="px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-white/30" />
          </div>
        ) : songs.length === 0 ? (
          <p className="text-white/25 text-sm text-center mt-12">
            Esta playlist está vacía. ¡Busca canciones y agrégalas!
          </p>
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            className="space-y-1">
            {songs.map((song, i) => (
              <SongCard key={song.id} song={song} index={i}
                onPlay={() => loadQueue(songs, i)}
                showRemoveButton
                onRemoveFromPlaylist={() => handleRemoveSong(song.id)} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}