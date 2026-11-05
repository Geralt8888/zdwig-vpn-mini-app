import { APP_CONFIG } from '../config';
import type { PersistedState } from '../types';

export const AUTH_KEY = 'zdwig.auth.v1';
export const SESSION_KEY = 'zdwig.session.v1';
const GUEST_KEY = 'zdwig.guest';

export function defaultState(): PersistedState {
  return {
    spins: APP_CONFIG.freeSpins,
    expiresAt: 0,
    discount: 0,
    plan: 'Free',
    wins: [],
    key: null,
    customKey: false,
    keyVisible: false,
    lastShare: '',
    spinDate: '',
  };
}

export function storageKeyFor(userId?: number): string {
  return `zdwig.v1:${userId ?? 'guest'}`;
}

export function loadState(storageKey: string): PersistedState {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return base;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return base;

    const merged: PersistedState = { ...base, ...(parsed as Partial<PersistedState>) };
    if (!Array.isArray(merged.wins)) merged.wins = [];
    if (typeof merged.spins !== 'number' || merged.spins < 0) merged.spins = APP_CONFIG.freeSpins;
    if (merged.plan !== 'Plus' && merged.plan !== 'Pro') merged.plan = 'Free';
    if (typeof merged.discount !== 'number' || merged.discount < 0) merged.discount = 0;
    if (typeof merged.expiresAt !== 'number' || merged.expiresAt < 0) merged.expiresAt = 0;
    if (typeof merged.key !== 'string') merged.key = null;

    return merged;
  } catch {
    return base;
  }
}

export function saveState(storageKey: string, state: PersistedState): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Приватный режим или переполнение — приложение продолжает работать в памяти.
  }
}

export function getGuestId(): string {
  try {
    const existing = localStorage.getItem(GUEST_KEY);
    if (existing) return existing;
  } catch {
    // Игнорируем недоступный localStorage.
  }

  const id = `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  try {
    localStorage.setItem(GUEST_KEY, id);
  } catch {
    // Игнорируем недоступный localStorage.
  }
  return id;
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJson(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Игнорируем недоступный localStorage.
  }
}
