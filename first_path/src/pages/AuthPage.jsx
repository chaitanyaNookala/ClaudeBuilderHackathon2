import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { authApi } from '../api/auth';

const FORM_POSITIONS = {
  idle:     { x: 200,  y: -80,  rotate: -3 },
  name:     { x: -220, y: -120, rotate: 2  },
  email:    { x: 220,  y: 60,   rotate: -2 },
  password: { x: -180, y: 80,   rotate: 3  },
  submit:   { x: 20,   y: -160, rotate: 0  },
};

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState('idle');
  const [splineLoaded, setSplineLoaded] = useState(false);

  const pos = FORM_POSITIONS[activeField] || FORM_POSITIONS.idle;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setActiveField('submit');
    try {
      let data;
      if (mode === 'login') {
        data = await authApi.login(email, password);
      } else {
        data = await authApi.register(email, password, name);
      }
      localStorage.setItem('fp_token', data.token);
      onAuth(data.user, data.token);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setError(typeof detail === 'string' ? detail : 'Something went wrong');
        setActiveField('idle');
        return;
      }
      const status = err.response?.status;
      const likelyUnreachable =
        !err.response ||
        status === 404 ||
        status === 502 ||
        status === 503 ||
        status === 504;
      if (!likelyUnreachable) {
        setError('Could not sign you in. Check your details or try again.');
        setActiveField('idle');
        return;
      }
      // Backend missing, proxy error, or no HTTP response — local demo session
      console.warn('FirstPath: auth API unreachable, using local demo session', err.message);
      const demoUser = {
        name:
          (mode === 'register' ? name : email.split('@')[0])?.trim() || 'Traveler',
        email: email.trim() || 'demo@firstpath.com',
      };
      localStorage.setItem('fp_token', 'demo-token');
      onAuth(demoUser, 'demo-token');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0 z-0">
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: splineLoaded ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        >
          <Spline
            scene="https://prod.spline.design/jSETc6P7QF3KP7SM/scene.splinecode"
            onLoad={() => setSplineLoaded(true)}
            style={{ width: '100%', height: '100%' }}
          />
        </motion.div>
        <AnimatePresence>
          {!splineLoaded && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              exit={{ opacity: 0 }}
            >
              <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, transparent 30%, rgba(10,10,15,0.75) 100%)' }}
      />

      <motion.div
        className="relative z-10"
        animate={{ x: pos.x, y: pos.y, rotate: pos.rotate }}
        transition={{ type: 'spring', stiffness: 60, damping: 18, mass: 1.2 }}
      >
        <motion.div
          className="w-80 p-7 rounded-2xl backdrop-blur-xl border border-white/10 bg-black/40"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <h1 className="font-serif text-4xl font-bold text-white mb-1">FirstPath</h1>
            <p className="font-sans text-zinc-400 text-xs">
              {mode === 'login' ? 'Welcome back, traveler.' : 'Begin your journey.'}
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.05] font-sans text-sm text-white hover:bg-white/[0.1] transition-colors duration-300 mb-5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setActiveField('name')}
                onBlur={() => setActiveField('idle')}
                required
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05] font-sans text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-colors duration-300"
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField('idle')}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05] font-sans text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-colors duration-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField('idle')}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05] font-sans text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/25 transition-colors duration-300"
            />
            {error && <p className="font-sans text-xs text-red-400 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              onFocus={() => setActiveField('submit')}
              className="w-full py-3 rounded-xl bg-white text-black font-sans font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'One moment...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-4 font-sans text-xs text-zinc-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setActiveField('idle'); }}
              className="text-white hover:underline focus:outline-none"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
