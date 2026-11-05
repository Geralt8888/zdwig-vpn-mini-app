import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { APP_CONFIG } from '../config';
import { addDays, addMonths, daysLeft, maskKey } from '../lib/format';
import {
  defaultState,
  getGuestId,
  loadState,
  saveState,
  storageKeyFor,
  todayKey,
} from '../lib/storage';
import { isInTelegram, telegram, telegramUser } from '../lib/telegram';
import { generateDemoKey, isBackendConfigured, requestVpnKey } from '../lib/vpn';
import type { PersistedState, Plan, Prize, TelegramUser, Win } from '../types';

interface AppContextValue {
  state: PersistedState;
  telegramUser: TelegramUser | null;
  isTelegram: boolean;
  guestId: string;
  demoKey: string;
  currentKey: string;
  maskedKey: string;
  keyVisible: boolean;
  hasPlan: boolean;
  daysRemaining: number;
  spins: number;
  discount: number;
  plan: Plan;
  wins: Win[];
  backendConfigured: boolean;
  consumeSpin: () => boolean;
  awardPrize: (prize: Prize) => void;
  shareForSpin: () => boolean;
  setCustomKey: (value: string | null) => void;
  toggleKeyVisibility: () => void;
  resetProgress: () => void;
  syncBackendKey: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [guestId] = useState(getGuestId);
  const storageKey = useMemo(() => storageKeyFor(telegramUser?.id), []);
  const [state, setState] = useState<PersistedState>(() => loadState(storageKey));

  const seed = telegramUser ? `tg:${telegramUser.id}` : `guest:${guestId}`;
  const demoKey = useMemo(() => generateDemoKey(seed), [seed]);

  useEffect(() => {
    saveState(storageKey, state);
  }, [state, storageKey]);

  // Ежедневное обновление бесплатных спинов.
  useEffect(() => {
    setState((prev) => {
      const today = todayKey();
      if (prev.spinDate === today) return prev;

      return {
        ...prev,
        // Первый запуск не добавляет бонусов, но на следующий день возвращает 3 спина.
        spins: prev.spinDate ? APP_CONFIG.freeSpins : prev.spins,
        spinDate: today,
      };
    });
  }, [storageKey]);

  const syncBackendKey = useCallback(async () => {
    if (!isBackendConfigured) return;

    const issued = await requestVpnKey(telegram?.initData ?? '', seed);
    if (!issued?.key) return;

    setState((prev) => {
      if (prev.customKey) return prev;

      return {
        ...prev,
        key: issued.key,
        plan: issued.plan !== 'Free' ? issued.plan : prev.plan,
        expiresAt: issued.expiresAt || prev.expiresAt,
      };
    });
  }, [seed]);

  useEffect(() => {
    void syncBackendKey();
  }, [syncBackendKey]);

  const currentKey = state.customKey && state.key ? state.key : state.key || demoKey;
  const keyVisible = state.keyVisible;

  const consumeSpin = useCallback((): boolean => {
    if (state.spins <= 0) return false;

    setState((prev) => ({ ...prev, spins: Math.max(0, prev.spins - 1) }));
    return true;
  }, [state.spins]);

  const awardPrize = useCallback((prize: Prize) => {
    setState((prev) => {
      const now = Date.now();
      let discount = prev.discount;
      let expiresAt = prev.expiresAt;
      let plan = prev.plan;

      if (prize.kind === 'discount') {
        discount = Math.max(prev.discount, prize.value);
      } else {
        const base = new Date(prev.expiresAt > now ? prev.expiresAt : now);
        const next = prize.kind === 'days' ? addDays(base, prize.value) : addMonths(base, prize.value);

        expiresAt = next.getTime();
        plan =
          prize.kind === 'months' && prize.value >= 12
            ? 'Pro'
            : prev.plan === 'Pro'
              ? 'Pro'
              : 'Plus';
      }

      const win: Win = {
        id: now,
        title: prize.title,
        kind: prize.kind,
        value: prize.value,
        emoji: prize.emoji,
        date: now,
      };

      return {
        ...prev,
        discount,
        expiresAt,
        plan,
        wins: [win, ...prev.wins].slice(0, 30),
      };
    });
  }, []);

  const shareForSpin = useCallback((): boolean => {
    if (state.lastShare === todayKey()) return false;

    setState((prev) => ({
      ...prev,
      spins: prev.spins + 1,
      lastShare: todayKey(),
    }));
    return true;
  }, [state.lastShare]);

  const setCustomKey = useCallback((value: string | null) => {
    setState((prev) =>
      value
        ? { ...prev, customKey: true, key: value }
        : { ...prev, customKey: false, key: null },
    );
  }, []);

  const toggleKeyVisibility = useCallback(() => {
    setState((prev) => ({ ...prev, keyVisible: !prev.keyVisible }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(() => ({ ...defaultState(), spinDate: todayKey() }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      telegramUser,
      isTelegram: isInTelegram,
      guestId,
      demoKey,
      currentKey,
      maskedKey: maskKey(currentKey),
      keyVisible,
      hasPlan: state.expiresAt > Date.now(),
      daysRemaining: daysLeft(state.expiresAt),
      spins: state.spins,
      discount: state.discount,
      plan: state.plan,
      wins: state.wins,
      backendConfigured: isBackendConfigured,
      consumeSpin,
      awardPrize,
      shareForSpin,
      setCustomKey,
      toggleKeyVisibility,
      resetProgress,
      syncBackendKey,
    }),
    [
      state,
      guestId,
      demoKey,
      currentKey,
      keyVisible,
      consumeSpin,
      awardPrize,
      shareForSpin,
      setCustomKey,
      toggleKeyVisibility,
      resetProgress,
      syncBackendKey,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp должен использоваться внутри AppProvider');
  return context;
}
