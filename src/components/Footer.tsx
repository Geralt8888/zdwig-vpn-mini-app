import { ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { haptic } from '../lib/telegram';
import type { PageRoute } from '../types';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

const LINKS: Array<{ route: PageRoute; label: string }> = [
  { route: 'wheel', label: 'Колесо фортуны' },
  { route: 'tariffs', label: 'Тарифы' },
  { route: 'instruction', label: 'Инструкция' },
  { route: 'support', label: 'Поддержка' },
];

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="safe-bottom border-t border-white/[0.06] bg-black/20">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2">
            <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-extrabold tracking-[-0.02em]">
              zdwig <span className="text-gradient">vpn</span>
            </p>
            <p className="text-[11px] text-muted-2">Telegram Mini App · демо-версия</p>
          </div>
        </div>

        <nav aria-label="Навигация в подвале" className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map((link) => (
            <button
              key={link.route}
              type="button"
              onClick={() => {
                haptic.select();
                onNavigate(link.route);
              }}
              className="text-xs font-semibold text-muted transition hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <p className="text-[11px] leading-relaxed text-muted-2">
          © {new Date().getFullYear()} {APP_CONFIG.name}. Не храните реальные пароли в демо-профиле.
        </p>
      </div>
    </footer>
  );
}
