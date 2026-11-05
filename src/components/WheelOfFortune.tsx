import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Clock,
  Gift,
  History,
  RotateCcw,
  Share2,
  Sparkles,
  Ticket,
  Trophy,
} from 'lucide-react';
import { PRIZES } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useWheel } from '../hooks/useWheel';
import { cn } from '../lib/cn';
import { formatDateTime, plural } from '../lib/format';
import { shareApp } from '../lib/happ';
import { haptic } from '../lib/telegram';
import { pickPrizeIndex } from '../lib/wheel';
import type { Prize } from '../types';
import { Button } from './ui/Button';
import { Confetti } from './ui/Confetti';
import { Modal } from './ui/Modal';
import { SectionHeading } from './ui/SectionHeading';

interface WinState {
  prize: Prize;
}

const KIND_HINT: Record<Prize['kind'], string> = {
  discount: 'Скидка применится автоматически при оформлении тарифа.',
  days: 'Дни добавлены к вашей подписке.',
  months: 'Месяцы добавлены к вашей подписке.',
};

export function WheelOfFortune() {
  const { spins, wins, discount, consumeSpin, awardPrize, shareForSpin } = useApp();
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [win, setWin] = useState<WinState | null>(null);
  const [noSpinsOpen, setNoSpinsOpen] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const handleResult = useCallback(
    (prize: Prize) => {
      awardPrize(prize);
      setWin({ prize });
      setConfettiKey((key) => key + 1);
      haptic.success();
    },
    [awardPrize],
  );

  const { spinning, spin } = useWheel(canvasRef, { onResult: handleResult });

  const handleSpin = useCallback(() => {
    if (spinning) return;

    if (spins <= 0) {
      haptic.warning();
      setNoSpinsOpen(true);
      return;
    }

    if (!consumeSpin()) {
      setNoSpinsOpen(true);
      return;
    }

    haptic.tap();
    setWin(null);
    spin(pickPrizeIndex());
  }, [spinning, spins, consumeSpin, spin]);

  const handleShare = useCallback(() => {
    if (!shareForSpin()) {
      haptic.warning();
      toast('Бонусный спин за приглашение уже получен сегодня', 'info');
      return;
    }

    haptic.success();
    shareApp();
    toast('+1 спин за приглашение друга', 'success');
    setNoSpinsOpen(false);
  }, [shareForSpin, toast]);

  const recentWins = useMemo(() => wins.slice(0, 6), [wins]);

  return (
    <>
      <Confetti trigger={confettiKey} />

      <section className="animate-page-in mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Бонусы"
          title="Колесо фортуны"
          description="Крутите бесплатные спины и получайте скидки и дни подписки. Каждый день — новый шанс."
          action={
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
              <Ticket className="h-4 w-4 text-gold" aria-hidden="true" />
              <span className="text-sm font-extrabold">{spins}</span>
              <span className="text-[11px] font-medium text-muted">
                {plural(spins, 'спин', 'спина', 'спинов')}
              </span>
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="card flex flex-col items-center p-4 sm:p-6">
            <div className="relative mx-auto w-full max-w-[430px]">
              <div className="pointer-events-none absolute left-1/2 top-[-10px] z-10 -translate-x-1/2">
                <div className="h-0 w-0 border-x-[11px] border-t-[18px] border-x-transparent border-t-gold drop-shadow-[0_6px_14px_rgba(255,209,102,0.55)]" />
              </div>

              <canvas
                ref={canvasRef}
                className="aspect-square w-full rounded-full"
                aria-label="Колесо фортуны с призами"
                role="img"
              />

              <button
                type="button"
                onClick={handleSpin}
                disabled={spinning}
                className={cn(
                  'absolute left-1/2 top-1/2 grid h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#0b0c16]/95 text-center shadow-[0_16px_40px_-18px_rgba(0,0,0,0.9)] backdrop-blur transition active:scale-95',
                  spinning ? 'cursor-not-allowed opacity-70' : 'hover:border-accent/50',
                )}
                aria-label="Крутить колесо"
              >
                <span className="flex flex-col items-center gap-0.5">
                  {spinning ? (
                    <RotateCcw className="h-5 w-5 animate-spin text-accent-2" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" />
                  )}
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                    {spinning ? 'Крутим' : 'Крутить'}
                  </span>
                  <span className="text-[9px] font-semibold text-muted-2">
                    {spins > 0 ? `${spins} ${plural(spins, 'спин', 'спина', 'спинов')}` : 'нет спинов'}
                  </span>
                </span>
              </button>
            </div>

            <div className="mt-5 w-full max-w-[430px]">
              <Button
                size="lg"
                fullWidth
                loading={spinning}
                onClick={handleSpin}
                icon={<Gift className="h-4.5 w-4.5" />}
              >
                {spinning ? 'Колесо крутится…' : 'Крутить бесплатно'}
              </Button>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={handleShare} icon={<Share2 className="h-4 w-4" />}>
                  +1 спин
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setNoSpinsOpen(true)}
                  icon={<Clock className="h-4 w-4" />}
                >
                  Когда спины?
                </Button>
              </div>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-2">
                Бесплатные спины обновляются каждый день. Бонусный спин за приглашение — раз в сутки.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card p-4 sm:p-5">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <Gift className="h-4 w-4 text-accent" aria-hidden="true" />
                Призы на колесе
              </h3>
              <ul className="mt-3 grid grid-cols-2 gap-1.5">
                {PRIZES.map((prize) => (
                  <li
                    key={prize.id}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[11px] font-semibold',
                      prize.tone === 'gold'
                        ? 'border-gold/25 bg-gold/10 text-gold'
                        : prize.tone === 'rare'
                          ? 'border-accent/25 bg-accent/10 text-[#c4b5fd]'
                          : 'border-white/[0.07] bg-white/[0.03] text-white/75',
                    )}
                  >
                    <span aria-hidden="true">{prize.emoji}</span>
                    <span className="truncate">{prize.short}</span>
                  </li>
                ))}
              </ul>

              {discount > 0 ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-[11.5px] font-bold text-gold">
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  Ваша скидка: {discount}%
                </div>
              ) : null}
            </div>

            <div className="card p-4 sm:p-5">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <History className="h-4 w-4 text-accent-2" aria-hidden="true" />
                История выигрышей
              </h3>

              {recentWins.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-muted-2">
                  Пока пусто. Крутите колесо — призы появятся здесь.
                </p>
              ) : (
                <ul className="mt-3 space-y-1.5">
                  {recentWins.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2"
                    >
                      <span className="text-base" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-semibold">{item.title}</p>
                        <p className="text-[10px] text-muted-2">{formatDateTime(item.date)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={Boolean(win)}
        onClose={() => setWin(null)}
        icon={<span className="text-4xl">{win?.prize.emoji ?? '🎁'}</span>}
        title="Поздравляем!"
        subtitle={win?.prize.title}
        footer={
          <>
            <Button fullWidth onClick={() => setWin(null)}>
              Забрать приз
            </Button>
            {spins > 0 ? (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setWin(null);
                  window.setTimeout(handleSpin, 260);
                }}
                icon={<RotateCcw className="h-4 w-4" />}
              >
                Крутить ещё ({spins})
              </Button>
            ) : null}
          </>
        }
      >
        <p className="text-center text-sm leading-relaxed text-muted">
          {win ? KIND_HINT[win.prize.kind] : ''}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-gold">
          <Trophy className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-extrabold">{win?.prize.title}</span>
        </div>
      </Modal>

      <Modal
        open={noSpinsOpen}
        onClose={() => setNoSpinsOpen(false)}
        icon={<Clock className="h-7 w-7" />}
        title="Спины закончились"
        subtitle="Но это ненадолго"
        footer={
          <>
            <Button fullWidth onClick={handleShare} icon={<Share2 className="h-4 w-4" />}>
              Пригласить друга (+1 спин)
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setNoSpinsOpen(false)}>
              Закрыть
            </Button>
          </>
        }
      >
        <p className="text-center text-sm leading-relaxed text-muted">
          Бесплатные спины обновятся завтра. А пока можно получить дополнительный спин, поделившись
          приложением с другом.
        </p>
      </Modal>
    </>
  );
}
