import { useState } from 'react';
import {
  CalendarDays,
  Check,
  Copy,
  Crown,
  Gift,
  KeyRound,
  LogIn,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Ticket,
  Trophy,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { copyText } from '../lib/clipboard';
import { daysLeft, formatDate, initials, planLabel, plural } from '../lib/format';
import { openHapp } from '../lib/happ';
import { haptic, showSystemConfirm } from '../lib/telegram';
import type { AuthMode, PageRoute } from '../types';
import { Button } from './ui/Button';
import { SectionHeading } from './ui/SectionHeading';

interface ProfileProps {
  onAuth: (mode: AuthMode) => void;
  onNavigate: (route: PageRoute) => void;
}

export function Profile({ onAuth, onNavigate }: ProfileProps) {
  const {
    telegramUser,
    currentKey,
    maskedKey,
    plan,
    discount,
    spins,
    wins,
    hasPlan,
    state,
    resetProgress,
  } = useApp();
  const { session, logout } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const displayName =
    session?.name ??
    telegramUser?.first_name ??
    (telegramUser?.username ? `@${telegramUser.username}` : 'Гость');
  const subtitle =
    session?.email ??
    (telegramUser?.username
      ? `@${telegramUser.username}`
      : telegramUser
        ? `Telegram ID ${telegramUser.id}`
        : 'Локальный профиль не создан');

  const days = daysLeft(state.expiresAt);

  const handleCopy = async () => {
    haptic.tap();
    const ok = await copyText(currentKey);
    if (ok) {
      haptic.success();
      setCopied(true);
      toast('Ключ скопирован', 'success');
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      haptic.error();
      toast('Не удалось скопировать ключ', 'error');
    }
  };

  const handleReset = () => {
    haptic.tap();
    showSystemConfirm(
      'Сбросить прогресс? Спины, скидки, подписка и история выигрышей будут удалены.',
      () => {
        resetProgress();
        haptic.success();
        toast('Прогресс сброшен', 'success');
      },
    );
  };

  const handleLogout = () => {
    haptic.tap();
    logout();
    toast('Вы вышли из локального профиля', 'success');
  };

  return (
    <section className="animate-page-in mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Аккаунт"
        title="Профиль"
        description="Подписка, ключ доступа и статистика — всё в одном месте."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-accent to-accent-2 text-xl font-extrabold">
                {telegramUser?.photo_url ? (
                  <img src={telegramUser.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(displayName)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-extrabold tracking-[-0.03em]">{displayName}</p>
                <p className="truncate text-[11.5px] text-muted-2">{subtitle}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-[#c4b5fd]">
                    <Crown className="h-3 w-3" aria-hidden="true" />
                    {planLabel(plan)}
                  </span>
                  {telegramUser ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/65">
                      Telegram
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="stat-tile text-center">
                <p className="text-lg font-extrabold leading-none">{spins}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-2">
                  {plural(spins, 'спин', 'спина', 'спинов')}
                </p>
              </div>
              <div className="stat-tile text-center">
                <p className="text-lg font-extrabold leading-none">{wins.length}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-2">
                  призов
                </p>
              </div>
              <div className="stat-tile text-center">
                <p className="text-lg font-extrabold leading-none text-gold">{discount}%</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-2">
                  скидка
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {session ? (
                <Button variant="ghost" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>
                  Выйти из профиля
                </Button>
              ) : (
                <>
                  <Button
                    variant="soft"
                    onClick={() => {
                      haptic.tap();
                      onAuth('login');
                    }}
                    icon={<LogIn className="h-4 w-4" />}
                  >
                    Войти
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      haptic.tap();
                      onAuth('register');
                    }}
                    icon={<UserPlus className="h-4 w-4" />}
                  >
                    Регистрация
                  </Button>
                </>
              )}
              <Button
                variant="danger"
                onClick={handleReset}
                icon={<RotateCcw className="h-4 w-4" />}
                className={session ? 'sm:col-span-2' : ''}
              >
                Сбросить прогресс
              </Button>
            </div>
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
              Подписка
            </h3>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
                <p className="field-label">Статус</p>
                <p className={`mt-1 text-sm font-bold ${hasPlan ? 'text-success' : 'text-muted'}`}>
                  {hasPlan ? 'Активна' : 'Не активна'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
                <p className="field-label">Осталось дней</p>
                <p className="mt-1 text-sm font-bold">{days > 0 ? days : '—'}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
                <p className="field-label">Действует до</p>
                <p className="mt-1 text-sm font-bold">
                  {state.expiresAt ? formatDate(state.expiresAt) : '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
                <p className="field-label">Тариф</p>
                <p className="mt-1 text-sm font-bold">{planLabel(plan)}</p>
              </div>
            </div>

            <Button
              className="mt-3"
              fullWidth
              onClick={() => {
                haptic.select();
                onNavigate('tariffs');
              }}
              icon={<Zap className="h-4 w-4" />}
            >
              {hasPlan ? 'Продлить подписку' : 'Выбрать тариф'}
            </Button>
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <Trophy className="h-4 w-4 text-gold" aria-hidden="true" />
              Последние призы
            </h3>

            {wins.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-muted-2">
                Вы ещё не крутили колесо. Самое время попробовать!
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {wins.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-2">
                      {formatDate(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Button
              className="mt-3"
              variant="ghost"
              fullWidth
              onClick={() => {
                haptic.select();
                onNavigate('wheel');
              }}
              icon={<Gift className="h-4 w-4" />}
            >
              К колесу фортуны
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <KeyRound className="h-4 w-4 text-accent-2" aria-hidden="true" />
              Ключ доступа
            </h3>

            <code className="mt-3 block break-all rounded-xl border border-white/[0.08] bg-black/35 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-[#c7c9e8]">
              {maskedKey}
            </code>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={handleCopy}
                icon={
                  copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )
                }
              >
                {copied ? 'Готово' : 'Копировать'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  haptic.tap();
                  const opened = openHapp(currentKey);
                  toast(
                    opened ? 'Открываем Happ…' : 'Happ не открылся — скопируйте ключ вручную',
                    opened ? 'info' : 'error',
                  );
                }}
                icon={<Zap className="h-4 w-4" />}
              >
                Happ
              </Button>
            </div>

            <Button
              className="mt-2"
              variant="ghost"
              fullWidth
              onClick={() => {
                haptic.select();
                onNavigate('instruction');
              }}
            >
              Инструкция по подключению
            </Button>
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <CalendarDays className="h-4 w-4 text-accent" aria-hidden="true" />
              Бонусы
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-white/80">
                  <Ticket className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  Скидка
                </span>
                <span className="text-sm font-extrabold text-gold">{discount}%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-white/80">
                  <Gift className="h-3.5 w-3.5 text-accent-2" aria-hidden="true" />
                  Спины
                </span>
                <span className="text-sm font-extrabold">{spins}</span>
              </div>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted-2">
              Скидка и дни подписки начисляются автоматически после выигрыша на колесе.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
