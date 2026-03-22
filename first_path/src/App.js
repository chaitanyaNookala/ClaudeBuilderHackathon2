import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CloudBackground } from './components/CloudBackground';
import { FlameGuide } from './components/FlameGuide';
import { Hero } from './components/Hero';
import { BranchSelector } from './components/BranchSelector';
import { UserProfile } from './components/UserProfile';
import { Journey } from './components/Journey';
import { GenerateScreen } from './components/GenerateScreen';
import { ResultScreen } from './components/ResultScreen';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import { authApi } from './api/auth';
import { generateRoadmap } from './api/roadmap';
import './App.css';

const BRANCH_COLORS = {
  standard: '#f5c842',
  disability: '#5be3b0',
  firstgen: '#f07048',
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [, setToken] = useState(localStorage.getItem('fp_token'));
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentScreen, setCurrentScreen] = useState('profile');
  const [roadmapResult, setRoadmapResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [flameFlare, setFlameFlare] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      document.documentElement.style.setProperty('--branch-color', BRANCH_COLORS[selectedBranch]);
    }
  }, [selectedBranch]);

  const triggerFlare = useCallback(() => {
    setFlameFlare(true);
    setTimeout(() => setFlameFlare(false), 400);
  }, []);

  const handleBranchSelect = useCallback((branch) => {
    setSelectedBranch(branch);
    setCurrentScreen('chapters');
    triggerFlare();
  }, [triggerFlare]);

  const handleAnswer = useCallback((question, answer) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
    triggerFlare();
  }, [triggerFlare]);

  const handleChaptersComplete = useCallback(() => {
    setCurrentScreen('generate');
    triggerFlare();
    setTimeout(() => {
      const el = document.querySelector('[data-testid="generate-screen"]');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [triggerFlare]);

  const handleGenerate = useCallback(async () => {
    if (!profileData) {
      console.error('Missing profile for roadmap generation');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateRoadmap(answers, selectedBranch, profileData);
      setRoadmapResult(result);
      setCurrentScreen('result');
      triggerFlare();
      setTimeout(() => {
        const el = document.querySelector('[data-testid="result-screen"]');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [answers, selectedBranch, triggerFlare, profileData]);

  const handleSave = useCallback(async () => {
    console.info('Save journey — wire to backend when available');
  }, []);

  const handleRestart = useCallback(() => {
    setSelectedBranch(null);
    setAnswers({});
    setProfileData(null);
    setCurrentScreen('profile');
    setRoadmapResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('fp_token');
    setUser(null);
    setToken(null);
    setSelectedBranch(null);
    setAnswers({});
    setCurrentScreen('profile');
    setRoadmapResult(null);
    setProfileData(null);
  }, []);

  const accentColor = selectedBranch ? BRANCH_COLORS[selectedBranch] : '#e2e8f0';

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-root">
        <CloudBackground scrollProgress={0} />
        <FlameGuide color="#e2e8f0" flare={false} />
        <AuthPage onAuth={(userData, tokenVal) => {
          setUser(userData || { name: 'Traveler', email: 'demo@firstpath.com' });
          setToken(tokenVal || 'demo-token');
        }} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <CloudBackground scrollProgress={scrollProgress} />
      <FlameGuide color={accentColor} flare={flameFlare} />

      <nav className="fixed top-0 right-0 z-40 flex items-center gap-3 p-4 md:p-6">
        <span className="font-sans text-xs text-zinc-500 hidden md:block">
          {user.name || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white text-xs font-sans transition-colors duration-300"
        >
          Sign out
        </button>
      </nav>

      <main>
        {currentScreen === 'profile' && !profileData && (
          <UserProfile
            onComplete={(data) => {
              setProfileData(data);
              setCurrentScreen('hero');
              window.scrollTo({ top: 0 });
            }}
          />
        )}
        <Hero />
        {!selectedBranch && profileData && (
          <BranchSelector onSelect={handleBranchSelect} />
        )}
        {selectedBranch && currentScreen !== 'hero' && (
          <>
            <Journey
              branch={selectedBranch}
              profileData={profileData}
              accentColor={accentColor}
              answers={answers}
              onAnswer={handleAnswer}
              onComplete={handleChaptersComplete}
            />
            {currentScreen === 'generate' && (
              <GenerateScreen
                answers={answers}
                accentColor={accentColor}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
            {currentScreen === 'result' && roadmapResult && (
              <ResultScreen
                result={roadmapResult}
                accentColor={accentColor}
                onSave={handleSave}
                onRestart={handleRestart}
                onFlare={triggerFlare}
                profileData={profileData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
