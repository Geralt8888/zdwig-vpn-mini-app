import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Clock,
  ExternalLink,
  LifeBuoy,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { haptic, openTelegramLink } from '../lib/telegram';
import { cn } from '../lib/cn';
import { Button } from './ui/Button';
import { SectionHeading } from './ui/SectionHeading';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ: FaqItem[] = [
  {
    question: 'Как подключить VPN?',
    answer:
      'Откройте главную страницу, скопируйте ключ и нажмите «Подключить в Happ». В приложении Happ выберите «Импортировать из буфера обмена» и подключитесь. Подробная инструкция — в разделе «Инструкция».',
  },
  {
    question: 'Ключ не подключается. Что делать?',
    answer:
      'Проверьте, что ключ скопирован полностью и начинается с vless://. Попробуйте переключить сервер или перезапустить Happ. Если проблема осталась — напишите в поддержку, приложив скриншот ошибки.',
  },
  {
    question: 'Сколько устройств можно подключить?',
    answer:
      'Один ключ поддерживает до 5 устройств одновременно. При подключении большего числа устройств часть из них может быть отключена.',
  },
  {
    question: 'Как работают спины и призы?',
    answer:
      'Каждый день доступно 3 бесплатных спина. Скидки применяются к тарифам автоматически, а выигранные дни и месяцы добавляются к подписке. Дополнительный спин можно получить за приглашение друга.',
  },
  {
    question: 'Это официальное приложение Telegram?',
    answer:
      'Нет, zdwig vpn — независимый сервис, который работает как Telegram Mini App и в веб-версии. Мы не связаны с Telegram.',
  },
  {
    question: 'Где хранятся мои данные?',
    answer:
      'Демо-профиль, спины и история выигрышей хранятся локально в вашем браузере. Ключи выдаются через защищённый API, секреты не попадают в клиент.',
  },
];

const CONTACTS = [
  {
    title: 'Поддержка',
    description: 'Ответим на вопросы и поможем с подключением.',
    value: '@zdwig_support',
    href: APP_CONFIG.links.support,
    icon: LifeBuoy,
    tone: 'text-accent-2',
  },
  {
    title: 'Telegram-канал',
    description: 'Новости, обновления и розыгрыши.',
    value: '@zdwigvpn',
    href: APP_CONFIG.links.channel,
    icon: Send,
    tone: 'text-accent',
  },
  {
    title: 'Бот',
    description: 'Оформление и продление подписки.',
    value: '@zdwigvpn_bot',
    href: APP_CONFIG.links.bot,
    icon: MessageCircle,
    tone: 'text-gold',
  },
];

export function Support() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="animate-page-in mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Помощь"
        title="Поддержка"
        description="Мы на связи 24/7. Выберите удобный канал или найдите ответ в частых вопросах."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {CONTACTS.map((contact) => {
          const Icon = contact.icon;
          return (
            <button
              key={contact.title}
              type="button"
              onClick={() => {
                haptic.tap();
                openTelegramLink(contact.href);
              }}
              className="card group text-left transition hover:border-white/15"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn('grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05]', contact.tone)}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <ExternalLink
                  className="h-4 w-4 text-white/25 transition group-hover:text-white/60"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-3 text-sm font-extrabold">{contact.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{contact.description}</p>
              <p className="mt-2 text-[12px] font-bold text-[#c4b5fd]">{contact.value}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="card p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold">
            <BookOpen className="h-4 w-4 text-accent" aria-hidden="true" />
            Частые вопросы
          </h3>

          <ul className="mt-3 divide-y divide-white/[0.06]">
            {FAQ.map((item, index) => {
              const open = openIndex === index;
              return (
                <li key={item.question}>
                  <button
                    type="button"
                    onClick={() => {
                      haptic.select();
                      setOpenIndex(open ? null : index);
                    }}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <span className="flex-1 text-[12.5px] font-semibold text-white/85">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-2 transition-transform duration-200',
                        open && 'rotate-180 text-accent-2',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {open ? (
                    <p className="animate-fade-in pb-3 pr-6 text-[11.5px] leading-relaxed text-muted">
                      {item.answer}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <Clock className="h-4 w-4 text-success" aria-hidden="true" />
              Время ответа
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <span className="text-[12px] font-semibold text-white/80">Telegram</span>
                <span className="text-[11px] font-bold text-success">до 15 минут</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <span className="text-[12px] font-semibold text-white/80">Эл. почта</span>
                <span className="text-[11px] font-bold text-muted">до 24 часов</span>
              </div>
            </div>
            <Button
              className="mt-3"
              fullWidth
              onClick={() => {
                haptic.tap();
                openTelegramLink(APP_CONFIG.links.support);
              }}
              icon={<LifeBuoy className="h-4 w-4" />}
            >
              Написать в поддержку
            </Button>
          </div>

          <div className="glass flex items-start gap-2.5 rounded-2xl px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed text-muted">
              Сотрудники поддержки никогда не запрашивают пароль, коды из SMS или доступ к вашему
              аккаунту.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
