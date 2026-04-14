// AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { authAPI } from '../../services/api';

export function AuthCallback() {
  const [params] = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }
    setToken(token);
    authAPI.verify().then(({ data }) => { setUser(data.user); navigate('/'); }).catch(() => navigate('/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white/50 text-sm animate-pulse">Iniciando sesión con Google...</div>
    </div>
  );
}

export default AuthCallback;
