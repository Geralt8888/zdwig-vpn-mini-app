import { BadgeCheck, Check, Crown, Sparkles, Ticket, Zap } from 'lucide-react';
import { APP_CONFIG, TARIFFS } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/cn';
import { formatRub, planLabel } from '../lib/format';
import { openTelegramLink, haptic } from '../lib/telegram';
import type { TariffPlan } from '../types';
import { Button } from './ui/Button';
import { SectionHeading } from './ui/SectionHeading';

export function Tariffs() {
  const { discount, plan, hasPlan, daysRemaining } = useApp();
  const { toast } = useToast();

  const handleBuy = (tariff: TariffPlan) => {
    haptic.tap();
    toast(`Тариф «${tariff.name}»: оформление в Telegram-боте`, 'info');
    openTelegramLink(APP_CONFIG.links.bot);
  };

  return (
    <section className="animate-page-in mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Подписка"
        title="Тарифы"
        description="Один ключ для всех устройств. Безлимитный трафик, 12 локаций и поддержка 24/7."
        action={
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/75">
              <Crown className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              {planLabel(plan)}
            </span>
            {hasPlan ? (
              <span className="text-[10.5px] font-medium text-success">
                Активна ещё {daysRemaining} дн.
              </span>
            ) : (
              <span className="text-[10.5px] font-medium text-muted-2">Подписка не активна</span>
            )}
          </div>
        }
      />

      {discount > 0 ? (
        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3">
          <Ticket className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          <p className="text-xs font-semibold text-gold">
            Ваша скидка {discount}% уже применена к ценам ниже.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {TARIFFS.map((tariff) => {
          const total = tariff.pricePerMonth * tariff.months;
          const finalTotal = discount > 0 ? total * (1 - discount / 100) : total;
          const finalPerMonth = finalTotal / tariff.months;

          return (
            <article
              key={tariff.id}
              className={cn(
                'card flex flex-col',
                tariff.featured && 'border-accent/35 shadow-[0_30px_90px_-40px_rgba(139,92,255,0.65)]',
              )}
            >
              {tariff.featured ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent to-accent-2 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Выбор большинства
                </span>
              ) : null}

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                {tariff.badge ?? 'Тариф'}
              </p>
              <h3 className="mt-1 text-xl font-extrabold tracking-[-0.03em]">{tariff.name}</h3>

              <div className="mt-4 flex items-end gap-1.5">
                <span className="text-3xl font-extrabold tracking-[-0.04em]">
                  {formatRub(finalPerMonth)}
                </span>
                <span className="pb-1 text-xs font-medium text-muted-2">/ мес</span>
              </div>

              <p className="mt-1 text-[11px] text-muted-2">
                {discount > 0 ? (
                  <>
                    <span className="line-through">{formatRub(total)}</span>{' '}
                    <span className="font-bold text-gold">итого {formatRub(finalTotal)}</span>
                  </>
                ) : (
                  <>Итого {formatRub(total)} за {tariff.months} мес.</>
                )}
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {tariff.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[12.5px] text-white/80">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-5"
                fullWidth
                variant={tariff.featured ? 'primary' : 'ghost'}
                onClick={() => handleBuy(tariff)}
                icon={<Zap className="h-4 w-4" />}
              >
                Оформить
              </Button>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="glass flex items-start gap-2.5 rounded-2xl px-4 py-3">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          <p className="text-[11.5px] leading-relaxed text-muted">
            Оплата в Telegram-боте. Доступ активируется автоматически после оплаты.
          </p>
        </div>
        <div className="glass flex items-start gap-2.5 rounded-2xl px-4 py-3">
          <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <p className="text-[11.5px] leading-relaxed text-muted">
            Скидки с колеса фортуны суммируются по максимальной ставке и действуют на любой тариф.
          </p>
        </div>
        <div className="glass flex items-start gap-2.5 rounded-2xl px-4 py-3">
          <Crown className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-[11.5px] leading-relaxed text-muted">
            Продление подписки сохраняет все бонусы и выигранные дни.
          </p>
        </div>
      </div>
    </section>
  );
}
