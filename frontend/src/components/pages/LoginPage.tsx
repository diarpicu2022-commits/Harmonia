import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data } = await authAPI.login(form.email, form.password);
        setToken(data.token); setUser(data.user);
        toast.success(`¡Bienvenido, ${data.user.displayName}! 🎵`);
        navigate('/');
      } else {
        const { data } = await authAPI.register(form.email, form.password, form.displayName);
        setToken(data.token); setUser(data.user);
        toast.success('¡Cuenta creada! Bienvenido a Harmonia 🎵');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon: Icon, ...props }: any) => (
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      <input
        {...props}
        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm text-white/85 outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'inherit' }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--mood-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[800px] h-[800px] rounded-full -top-96 -left-96 opacity-10"
          style={{ background: 'conic-gradient(from 0deg, var(--mood-primary), transparent, var(--mood-secondary))' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[600px] h-[600px] rounded-full -bottom-64 -right-64 opacity-8"
          style={{ background: 'conic-gradient(from 180deg, var(--mood-secondary), transparent, var(--mood-primary))' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm glass-strong rounded-3xl p-8 relative z-10"
        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl btn-mood flex items-center justify-center mx-auto mb-4 mood-glow">
            <Music2 size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Clash Display',sans-serif" }}>
            Harmonia
          </h1>
          <p className="text-white/40 text-sm">Tu universo musical inteligente</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mode === m ? 'var(--mood-primary)' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
              }}>
              {m === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={authAPI.googleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium mb-5 transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </motion.button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-xs text-white/25">o con email</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <InputField icon={User} type="text" placeholder="Nombre completo" required
              value={form.displayName} onChange={(e: any) => setForm(f => ({ ...f, displayName: e.target.value }))} />
          )}
          <InputField icon={Mail} type="email" placeholder="Email" required
            value={form.email} onChange={(e: any) => setForm(f => ({ ...f, email: e.target.value }))} />
          <div className="relative">
            <InputField icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Contraseña" required
              value={form.password} onChange={(e: any) => setForm(f => ({ ...f, password: e.target.value }))} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold btn-mood transition-all mt-2 disabled:opacity-60">
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
