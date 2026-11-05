import type { Plan } from '../types';

/** Русские формы множественного числа: 1 спин / 2 спина / 5 спинов. */
export function plural(n: number, one: string, few: string, many: string): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
  return many;
}

export function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString('ru-RU');
  }
}

export function formatDateTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString('ru-RU');
  }
}

/** Скрывает секретную часть VLESS/VMess-ссылки, оставляя сервер видимым. */
export function maskKey(key: string): string {
  if (!key) return '';

  const schemeMatch = key.match(/^([a-z0-9+.-]+:\/\/)/i);
  if (schemeMatch) {
    const scheme = schemeMatch[1];
    const rest = key.slice(scheme.length);
    const at = rest.indexOf('@');
    if (at > 0) {
      const credentials = rest.slice(0, at);
      const visible = credentials.slice(0, Math.min(8, Math.ceil(credentials.length / 3)));
      return `${scheme}${visible}••••••••${rest.slice(at)}`;
    }
  }

  if (key.length <= 30) return `${key.slice(0, 10)}••••••`;
  return `${key.slice(0, 18)}••••••••••••${key.slice(-6)}`;
}

export function planLabel(plan: Plan): string {
  const map: Record<Plan, string> = {
    Free: 'Бесплатно',
    Plus: 'Плюс',
    Pro: 'Про',
  };
  return map[plan] ?? 'Бесплатно';
}

export function daysLeft(expiresAt: number): number {
  if (!expiresAt || expiresAt <= Date.now()) return 0;
  return Math.max(1, Math.ceil((expiresAt - Date.now()) / 86_400_000));
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const next = new Date(date.getTime());
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

export function formatRub(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value))} ₽`;
}

export function initials(name: string): string {
  const clean = name.trim();
  if (!clean) return 'Z';
  return clean.charAt(0).toUpperCase();
}
