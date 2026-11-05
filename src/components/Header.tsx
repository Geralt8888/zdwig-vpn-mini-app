import { LogIn, LogOut, ShieldCheck, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/cn';
import { initials } from '../lib/format';
import { haptic } from '../lib/telegram';
import type { AuthMode, PageRoute } from '../types';

const NAV_ITEMS: Array<{ route: PageRoute; label: string }> = [
  { route: 'home', label: 'Главная' },
  { route: 'support', label: 'Поддержка' },
  { route: 'wheel', label: 'Колесо фортуны' },
  { route: 'tariffs', label: 'Тарифы' },
  { route: 'profile', label: 'Профиль' },
];

interface HeaderProps {
  route: PageRoute;
  onNavigate: (route: PageRoute) => void;
  onAuth: (mode: AuthMode) => void;
}

export function Header({ route, onNavigate, onAuth }: HeaderProps) {
  const { session, logout } = useAuth();
  const { spins, telegramUser } = useApp();
  const { toast } = useToast();

  const displayName = session?.name ?? telegramUser?.first_name ?? 'Гость';
  const avatarUrl = telegramUser?.photo_url;

  const go = (next: PageRoute) => {
    haptic.select();
    onNavigate(next);
  };

  const handleLogout = () => {
    haptic.tap();
    logout();
    toast('Вы вышли из локального профиля', 'success');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#07070d]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <button
          type="button"
          onClick={() => go('home')}
          className="order-1 flex min-w-0 items-center gap-2.5 text-left"
          aria-label="zdwig vpn — на главную"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 shadow-[0_10px_30px_-12px_rgba(139,92,255,0.9)]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[17px] font-extrabold leading-none tracking-[-0.03em]">
              zdwig <span className="text-gradient">vpn</span>
            </span>
            <span className="mt-1 hidden text-[10px] font-medium tracking-[0.08em] text-muted-2 sm:block">
              безопасно · быстро · приватно
            </span>
          </span>
        </button>

        <div className="no-scrollbar order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:order-2 lg:mx-0 lg:w-auto lg:flex-1 lg:overflow-visible lg:px-0">
          <nav aria-label="Основная навигация" className="flex items-center gap-1 lg:justify-center">
            {NAV_ITEMS.map((item) => {
              const active = route === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => go(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={cn('nav-pill inline-flex items-center gap-1.5', active && 'nav-pill-active')}
                >
                  {item.label}
                  {item.route === 'wheel' && spins > 0 ? (
                    <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-[#c4b5fd]">
                      {spins}
                    </span>
                  ) : null}
                </button>
              );
            })}

            <span className="mx-1 h-6 w-px shrink-0 bg-white/10" aria-hidden="true" />

            {session ? (
              <button
                type="button"
                onClick={handleLogout}
                className="nav-pill inline-flex items-center gap-1.5 text-red-300/80 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Выйти
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    haptic.tap();
                    onAuth('register');
                  }}
                  className="nav-pill inline-flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  Регистрация
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic.tap();
                    onAuth('login');
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-[#6366f1] px-3.5 py-2 text-[12.5px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(139,92,255,0.9)] transition hover:brightness-110 active:scale-[0.98]"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  Войти
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="order-2 ml-auto flex items-center gap-2 lg:order-3">
          {session ? (
            <span className="hidden max-w-[150px] truncate text-xs font-semibold text-white/70 sm:block">
              {session.name}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => go('profile')}
            aria-label="Открыть профиль"
            className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-accent to-accent-2 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-95"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials(displayName)}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
