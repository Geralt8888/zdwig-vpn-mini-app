import { ArrowRight, Gift, Globe2, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { openHapp } from '../lib/happ';
import { haptic } from '../lib/telegram';
import type { PageRoute } from '../types';
import { Button } from './ui/Button';

interface HeroSectionProps {
  onNavigate: (route: PageRoute) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const { currentKey, hasPlan } = useApp();
  const { toast } = useToast();

  const handleConnect = () => {
    haptic.tap();
    const opened = openHapp(currentKey);
    toast(
      opened ? 'Открываем Happ…' : 'Happ не открылся — скопируйте ключ вручную',
      opened ? 'info' : 'error',
    );
  };

  return (
    <section className="flex flex-col justify-center px-1 py-2 lg:pr-4">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/70 backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Telegram Mini App · 24/7
      </div>

      <h1 className="mt-4 text-balance text-[34px] font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-[44px] lg:text-[52px]">
        Интернет <span className="text-gradient">без границ</span>
      </h1>

      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        Быстрый VPN в один клик. Подключение через Happ, 12 локаций и безлимитный трафик — без
        логов, рекламы и ограничений скорости.
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Button size="lg" onClick={handleConnect} icon={<Zap className="h-4.5 w-4.5" />}>
          Подключить в Happ
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => {
            haptic.select();
            onNavigate('wheel');
          }}
          icon={<Gift className="h-4.5 w-4.5" />}
        >
          Крутить колесо
        </Button>
      </div>

      <button
        type="button"
        onClick={() => {
          haptic.select();
          onNavigate('instruction');
        }}
        className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#c4b5fd] transition hover:text-white"
      >
        Как подключиться
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        <div className="stat-tile">
          <Globe2 className="h-4 w-4 text-accent-2" aria-hidden="true" />
          <p className="mt-1.5 text-lg font-extrabold leading-none">{APP_CONFIG.features.locations}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-2">локаций</p>
        </div>
        <div className="stat-tile">
          <Smartphone className="h-4 w-4 text-accent" aria-hidden="true" />
          <p className="mt-1.5 text-lg font-extrabold leading-none">{APP_CONFIG.features.devices}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-2">устройств</p>
        </div>
        <div className="stat-tile">
          <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" />
          <p className="mt-1.5 text-lg font-extrabold leading-none">{APP_CONFIG.features.traffic}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-2">трафик</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-muted-2">
        <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1">
          VLESS · Reality
        </span>
        <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1">
          TLS 1.3
        </span>
        <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1">
          {hasPlan ? 'Подписка активна' : 'Бесплатный старт'}
        </span>
      </div>
    </section>
  );
}
