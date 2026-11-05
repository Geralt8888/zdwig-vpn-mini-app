import type { Prize, TariffPlan } from './types';

export const APP_CONFIG = {
  name: 'zdwig vpn',
  tagline: 'безопасно · быстро · приватно',
  freeSpins: 3,
  server: {
    name: 'DE-1 · Frankfurt',
    meta: 'VLESS · Reality · TLS 1.3',
    host: 'de1.zdwig.net',
    port: 443,
    sni: 'de1.zdwig.net',
    path: '/ws-zdwig',
    fp: 'chrome',
  },
  features: {
    locations: 12,
    devices: 5,
    traffic: '∞',
  },
  links: {
    channel: 'https://t.me/zdwigvpn',
    support: 'https://t.me/zdwig_support',
    bot: 'https://t.me/zdwigvpn_bot',
  },
} as const;

export const PRIZES: Prize[] = [
  { id: 'd5', short: '5%', title: 'Скидка 5%', kind: 'discount', value: 5, weight: 20, emoji: '🏷️', tone: 'base' },
  { id: 'day1', short: '1 день', title: '+1 день подписки', kind: 'days', value: 1, weight: 16, emoji: '⚡', tone: 'base' },
  { id: 'd10', short: '10%', title: 'Скидка 10%', kind: 'discount', value: 10, weight: 14, emoji: '🏷️', tone: 'base' },
  { id: 'day7', short: '7 дней', title: '+7 дней подписки', kind: 'days', value: 7, weight: 11, emoji: '🔥', tone: 'base' },
  { id: 'd15', short: '15%', title: 'Скидка 15%', kind: 'discount', value: 15, weight: 10, emoji: '🏷️', tone: 'base' },
  { id: 'm1', short: '1 мес', title: '+1 месяц подписки', kind: 'months', value: 1, weight: 8, emoji: '📅', tone: 'rare' },
  { id: 'd20', short: '20%', title: 'Скидка 20%', kind: 'discount', value: 20, weight: 7, emoji: '🏷️', tone: 'base' },
  { id: 'd30', short: '30%', title: 'Скидка 30%', kind: 'discount', value: 30, weight: 5, emoji: '💎', tone: 'rare' },
  { id: 'm3', short: '3 мес', title: '+3 месяца подписки', kind: 'months', value: 3, weight: 4, emoji: '🚀', tone: 'rare' },
  { id: 'd50', short: '50%', title: 'Скидка 50%', kind: 'discount', value: 50, weight: 3, emoji: '👑', tone: 'rare' },
  { id: 'm12', short: '1 год', title: '+1 год подписки', kind: 'months', value: 12, weight: 2, emoji: '🏆', tone: 'gold' },
  { id: 'd90', short: '90%', title: 'Скидка 90%', kind: 'discount', value: 90, weight: 1, emoji: '🎯', tone: 'gold' },
];

export const TARIFFS: TariffPlan[] = [
  {
    id: 'month',
    name: '1 месяц',
    months: 1,
    pricePerMonth: 199,
    features: ['До 5 устройств', '12 локаций на выбор', 'Без ограничения трафика'],
  },
  {
    id: 'half',
    name: '6 месяцев',
    months: 6,
    pricePerMonth: 149,
    badge: 'Выгодно',
    featured: true,
    features: ['Всё из тарифа «1 месяц»', 'Экономия 25%', 'Приоритетная поддержка'],
  },
  {
    id: 'year',
    name: '12 месяцев',
    months: 12,
    pricePerMonth: 99,
    features: ['Всё из тарифа «6 месяцев»', 'Экономия 50%', 'Лучшая цена за год'],
  },
];

export const INSTRUCTION_STEPS = [
  'Установите Happ из App Store или Google Play.',
  'Откройте Happ и нажмите «+» в правом верхнем углу.',
  'Выберите «Импортировать из буфера обмена» или вставьте ключ вручную.',
  'Нажмите «Подключить» и разрешите VPN-конфигурацию.',
];
