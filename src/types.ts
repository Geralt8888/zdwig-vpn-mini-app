/** Тарифный план пользователя. */
export type Plan = 'Free' | 'Plus' | 'Pro';

/** Тип приза на колесе фортуны. */
export type PrizeKind = 'discount' | 'days' | 'months';

/** Визуальный тон сегмента колеса. */
export type PrizeTone = 'base' | 'rare' | 'gold';

export interface Prize {
  id: string;
  short: string;
  title: string;
  kind: PrizeKind;
  value: number;
  weight: number;
  emoji: string;
  tone: PrizeTone;
}

export interface Win {
  id: number;
  title: string;
  kind: PrizeKind;
  value: number;
  emoji: string;
  date: number;
}

/** Состояние, которое сохраняется в localStorage (совместимо с v1). */
export interface PersistedState {
  spins: number;
  expiresAt: number;
  discount: number;
  plan: Plan;
  wins: Win[];
  key: string | null;
  customKey: boolean;
  keyVisible: boolean;
  lastShare: string;
  spinDate: string;
}

/** Пользователь Telegram WebApp. */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

/** Локальный демо-профиль (не связан с Telegram). */
export interface AuthUser {
  name: string;
  email: string;
  passHash: string;
  createdAt: number;
}

export interface Session {
  name: string;
  email: string;
  at: number;
}

export interface IssuedKey {
  key: string;
  plan: Plan;
  expiresAt: number;
  demo: boolean;
}

export type PageRoute =
  | 'home'
  | 'wheel'
  | 'tariffs'
  | 'support'
  | 'profile'
  | 'instruction';

export type AuthMode = 'login' | 'register';

export type ToastKind = 'success' | 'error' | 'info';

export interface AuthResult {
  ok: boolean;
  error?: string;
}


export interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

export interface TariffPlan {
  id: 'month' | 'half' | 'year';
  name: string;
  months: number;
  pricePerMonth: number;
  badge?: string;
  featured?: boolean;
  features: string[];
}
