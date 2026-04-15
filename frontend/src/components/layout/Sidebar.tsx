import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Library, Upload, Plus, LogOut, Music2, X } from 'lucide-react';
import { useAuthStore, usePlaylistStore } from '../../store';
import { playlistAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: Home, exact: true },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/library', label: 'Mi Biblioteca', icon: Library },
  { to: '/upload', label: 'Subir Música', icon: Upload },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { playlists, addPlaylist } = usePlaylistStore();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const { data } = await playlistAPI.create(newPlaylistName.trim());
      addPlaylist({ ...data.playlist, songs: [] });
      setShowCreateModal(false);
      setNewPlaylistName('');
      navigate(`/playlist/${data.playlist.id}`);
    } catch {
      toast.error('No se pudo crear la playlist');
    }
  };

  const openCreateModal = () => {
    setNewPlaylistName(`Mi Playlist ${playlists.length + 1}`);
    setShowCreateModal(true);
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-64 flex-shrink-0 flex flex-col h-full glass border-r border-white/5"
      style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-mood">
            <Music2 size={18} />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: "'Clash Display', sans-serif", color: 'var(--mood-primary)' }}>
            Harmonia
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isActive ? 'var(--mood-surface)' : 'transparent',
                  color: isActive ? 'var(--mood-primary)' : 'rgba(255,255,255,0.6)',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-sm font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--mood-primary)' }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Playlists section */}
      <div className="flex-1 overflow-y-auto mt-6 px-3">
        <div className="flex items-center justify-between px-3 mb-3">
          <span className="text-xs uppercase tracking-widest text-white/30 font-semibold">Playlists</span>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={openCreateModal}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--mood-surface)', color: 'var(--mood-primary)' }}
          >
            <Plus size={14} />
          </motion.button>
        </div>

        <div className="space-y-0.5">
          {playlists.map((pl) => (
            <NavLink key={pl.id} to={`/playlist/${pl.id}`}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer"
                  style={{
                    background: isActive ? 'var(--mood-surface)' : 'transparent',
                    color: isActive ? 'var(--mood-primary)' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: 'var(--mood-surface)' }}>
                    {pl.coverArt
                      ? <img src={pl.coverArt} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Music2 size={14} style={{ color: 'var(--mood-primary)' }} />
                        </div>
                    }
                  </div>
                  <span className="text-xs font-medium truncate">{pl.name}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
          {playlists.length === 0 && (
            <p className="text-xs text-white/25 px-3 py-2">
              Crea tu primera playlist con el botón +
            </p>
          )}
        </div>
      </div>

      {/* User profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          {user?.avatar
            ? <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" style={{ outline: "2px solid var(--mood-primary)", outlineOffset: "1px" }} />
            : <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--mood-primary)', color: 'white' }}>
                {user?.displayName?.[0]?.toUpperCase()}
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">{user?.displayName}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-colors"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-strong rounded-2xl p-5"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Clash Display',sans-serif" }}>
                  Nueva Playlist
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="Nombre de la playlist"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl text-white/60 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}
                  className="flex-1 py-3 rounded-xl btn-mood font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
