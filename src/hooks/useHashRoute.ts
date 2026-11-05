import { useCallback, useEffect, useState } from 'react';
import type { PageRoute } from '../types';

const ROUTES: PageRoute[] = ['home', 'wheel', 'tariffs', 'support', 'profile', 'instruction'];

/** Алиасы для старых якорных ссылок из v1. */
const ALIASES: Record<string, PageRoute> = {
  '': 'home',
  home: 'home',
  wheel: 'wheel',
  wheelsection: 'wheel',
  tariffs: 'tariffs',
  support: 'support',
  profile: 'profile',
  account: 'profile',
  instruction: 'instruction',
};

function parseHash(hash: string): PageRoute {
  const clean = hash
    .replace(/^#/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('?')[0]
    .toLowerCase();

  if (ROUTES.includes(clean as PageRoute)) return clean as PageRoute;
  return ALIASES[clean] ?? 'home';
}

export function useHashRoute(): {
  route: PageRoute;
  navigate: (next: PageRoute) => void;
} {
  const [route, setRoute] = useState<PageRoute>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((next: PageRoute) => {
    if (parseHash(window.location.hash) === next) {
      setRoute(next);
      return;
    }
    window.location.hash = `/${next}`;
  }, []);

  return { route, navigate };
}
