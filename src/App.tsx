import { useEffect, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { Instruction } from './components/Instruction';
import { Profile } from './components/Profile';
import { Support } from './components/Support';
import { Tariffs } from './components/Tariffs';
import { ToastViewport } from './components/ui/Toast';
import { WheelOfFortune } from './components/WheelOfFortune';
import { useHashRoute } from './hooks/useHashRoute';
import { initTelegram } from './lib/telegram';
import type { AuthMode, PageRoute } from './types';

export function App() {
  const { route, navigate } = useHashRoute();
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  useEffect(() => {
    initTelegram();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [route]);

  const handleNavigate = (next: PageRoute) => {
    navigate(next);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header route={route} onNavigate={handleNavigate} onAuth={setAuthMode} />

      <main className="flex-1">
        {route === 'home' ? (
          <HomePage onNavigate={handleNavigate} onAuth={setAuthMode} />
        ) : null}
        {route === 'wheel' ? <WheelOfFortune /> : null}
        {route === 'tariffs' ? <Tariffs /> : null}
        {route === 'support' ? <Support /> : null}
        {route === 'profile' ? (
          <Profile onAuth={setAuthMode} onNavigate={handleNavigate} />
        ) : null}
        {route === 'instruction' ? <Instruction /> : null}
      </main>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        open={authMode !== null}
        mode={authMode ?? 'login'}
        onClose={() => setAuthMode(null)}
        onSwitchMode={setAuthMode}
      />

      <ToastViewport />
    </div>
  );
}
