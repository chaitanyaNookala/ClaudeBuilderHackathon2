import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

export default function AuthCallback() {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const processAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionId = params.get('session_id');
      if (!sessionId) { navigate('/login'); return; }
      try {
        const user = await authApi.exchangeSession(sessionId);
        navigate('/', { state: { user }, replace: true });
      } catch {
        navigate('/login');
      }
    };
    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-zinc-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
