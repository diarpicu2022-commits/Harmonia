import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, XCircle, Loader2, FileAudio } from 'lucide-react';
import { uploadAPI } from '../../services/api';
import type { UploadProgress } from '../../types';

const formatBytes = (b: number) =>
  b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

export default function UploadPage() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const updateUpload = (file: File, patch: Partial<UploadProgress>) =>
    setUploads(prev => prev.map(u => u.file === file ? { ...u, ...patch } : u));

  const processFile = async (file: File) => {
    setUploads(prev => [...prev, { file, progress: 0, status: 'uploading' }]);
    try {
      const { data } = await uploadAPI.uploadAudio(file, (pct) =>
        updateUpload(file, { progress: pct, status: pct < 100 ? 'uploading' : 'processing' })
      );
      updateUpload(file, { status: 'done', song: data.song, progress: 100 });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      updateUpload(file, { status: 'error', error: msg || 'Error al subir' });
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    accepted.forEach(processFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'] },
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  });

  const StatusIcon = ({ status }: { status: UploadProgress['status'] }) => {
    if (status === 'done') return <CheckCircle2 size={18} style={{ color: '#10B981' }} />;
    if (status === 'error') return <XCircle size={18} style={{ color: '#EF4444' }} />;
    return <Loader2 size={18} className="animate-spin" style={{ color: 'var(--mood-primary)' }} />;
  };

  return (
    <div className="px-8 py-8 min-h-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Display',sans-serif" }}>
          Subir Música
        </h1>
        <p className="text-white/40 text-sm mb-8">
          Sube tus archivos MP3, FLAC, WAV y más. La carátula y metadatos se buscan automáticamente.
        </p>
      </motion.div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className="relative rounded-3xl p-16 text-center cursor-pointer mb-8 overflow-hidden"
        style={{
          border: `2px dashed ${isDragActive ? 'var(--mood-primary)' : 'rgba(255,255,255,0.1)'}`,
          background: isDragActive ? 'var(--mood-surface)' : 'rgba(255,255,255,0.02)',
          boxShadow: isDragActive ? '0 0 0 4px var(--mood-glow)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <input {...getInputProps()} />

        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={isDragActive ? { scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="absolute rounded-full border"
              style={{ width: `${i * 120}px`, height: `${i * 120}px`, borderColor: 'var(--mood-primary)', opacity: 0.08 }}
            />
          ))}
        </div>

        <motion.div
          animate={isDragActive ? { y: [-4, 4, -4] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="relative z-10"
        >
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center btn-mood mood-glow">
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Clash Display',sans-serif" }}>
            {isDragActive ? '¡Suelta aquí!' : 'Arrastra tus canciones'}
          </h2>
          <p className="text-white/40 text-sm mb-4">o haz clic para seleccionar archivos</p>
          <p className="text-white/20 text-xs">MP3 · WAV · FLAC · AAC · OGG · M4A · Máx. 50MB por archivo</p>
        </motion.div>
      </div>

      {/* Upload list */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
              Subiendo {uploads.length} {uploads.length === 1 ? 'archivo' : 'archivos'}
            </h3>
            {uploads.map((u, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {u.song?.coverArt
                      ? <img src={u.song.coverArt} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <FileAudio size={20} style={{ color: 'var(--mood-primary)' }} />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white/85 truncate">
                        {u.song?.title || u.file.name}
                      </p>
                      <StatusIcon status={u.status} />
                    </div>
                    <p className="text-xs text-white/40 truncate mb-2">
                      {u.song ? `${u.song.artist} · ${u.song.album}` : formatBytes(u.file.size)}
                    </p>
                    {u.status !== 'done' && u.status !== 'error' && (
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div
                          className="h-full progress-fill"
                          initial={{ width: '0%' }}
                          animate={{ width: `${u.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    {u.status === 'done' && (
                      <p className="text-xs" style={{ color: '#10B981' }}>
                        ✓ Subida correctamente{u.song?.coverArt ? ' · Carátula encontrada' : ''}
                      </p>
                    )}
                    {u.status === 'error' && (
                      <p className="text-xs" style={{ color: '#EF4444' }}>{u.error}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
