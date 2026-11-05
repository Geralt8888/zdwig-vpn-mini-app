import {
  ArrowRight,
  Gauge,
  Gift,
  Headphones,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { haptic } from '../lib/telegram';
import type { AuthMode, PageRoute } from '../types';
import { HappConnect } from './HappConnect';
import { HeroSection } from './HeroSection';
import { Button } from './ui/Button';
import { SectionHeading } from './ui/SectionHeading';

interface HomePageProps {
  onNavigate: (route: PageRoute) => void;
  onAuth: (mode: AuthMode) => void;
}

const FEATURES = [
  {
    title: 'Скорость без лимитов',
    description: 'Современный протокол VLESS · Reality и безлимитный трафик на всех устройствах.',
    icon: Gauge,
    tone: 'text-accent-2',
  },
  {
    title: 'Приватность по умолчанию',
    description: 'Без логов активности, рекламы и трекеров. Ваши данные остаются вашими.',
    icon: Lock,
    tone: 'text-accent',
  },
  {
    title: 'До 5 устройств',
    description: 'Один ключ для телефона, планшета и компьютера. Подключение в пару кликов.',
    icon: MonitorSmartphone,
    tone: 'text-gold',
  },
  {
    title: 'Поддержка 24/7',
    description: 'Живые люди в Telegram помогут с настройкой и ответят на вопросы.',
    icon: Headphones,
    tone: 'text-success',
  },
];

const STEPS = [
  { title: 'Скопируйте ключ', text: 'Нажмите «Копировать» на карточке подключения.' },
  { title: 'Откройте Happ', text: 'Импортируйте ключ из буфера обмена.' },
  { title: 'Подключитесь', text: 'Нажмите «Подключить» и разрешите VPN.' },
];

export function HomePage({ onNavigate, onAuth }: HomePageProps) {
  const { spins, discount } = useApp();

  return (
    <div className="animate-page-in">
      <section className="mx-auto w-full max-w-[1180px] px-4 pb-2 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
          <HeroSection onNavigate={onNavigate} />
          <HappConnect />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Преимущества"
          title="Почему zdwig vpn"
          description="Всё, что нужно для спокойного и быстрого интернета — без сложных настроек."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card p-4">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] ${feature.tone}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-[13.5px] font-extrabold">{feature.title}</h3>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
              Как это работает
            </h3>
            <ol className="mt-4 space-y-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-extrabold text-white">
                    {index + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-[12.5px] font-bold">{step.title}</p>
                    <p className="text-[11px] leading-relaxed text-muted-2">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button
              className="mt-4"
              variant="ghost"
              fullWidth
              onClick={() => {
                haptic.select();
                onNavigate('instruction');
              }}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Подробная инструкция
            </Button>
          </div>

          <div className="card flex flex-col justify-between p-4 sm:p-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gold">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Бонусы
              </span>
              <h3 className="mt-3 text-lg font-extrabold tracking-[-0.03em]">
                Крутите колесо фортуны
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Ежедневно 3 бесплатных спина. Скидки до 90% и до года подписки в подарок.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10.5px] font-semibold text-white/70">
                  {spins} {spins === 1 ? 'спин' : spins < 5 ? 'спина' : 'спинов'} сегодня
                </span>
                {discount > 0 ? (
                  <span className="rounded-lg border border-gold/25 bg-gold/10 px-2 py-1 text-[10.5px] font-bold text-gold">
                    скидка {discount}%
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                onClick={() => {
                  haptic.select();
                  onNavigate('wheel');
                }}
                icon={<Gift className="h-4 w-4" />}
              >
                К колесу
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  haptic.tap();
                  onAuth('register');
                }}
                icon={<Sparkles className="h-4 w-4" />}
              >
                Создать профиль
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
