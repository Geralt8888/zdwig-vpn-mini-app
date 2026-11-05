import type { TelegramUser } from '../types';

/** SDK подключается синхронно в index.html, поэтому доступен на этапе импорта. */
export const telegram: TelegramWebApp | null = window.Telegram?.WebApp ?? null;

export const telegramUser: TelegramUser | null = telegram?.initDataUnsafe?.user ?? null;

export const isInTelegram = Boolean(telegram && (telegram.initData || telegramUser));

export function initTelegram(): void {
  if (!telegram) return;

  try {
    telegram.ready();
  } catch {
    // SDK может быть недоступен в веб-версии.
  }
  try {
    telegram.expand();
  } catch {
    // Игнорируем.
  }
  if (!isInTelegram) return;

  try {
    telegram.setHeaderColor('#07070d');
    telegram.setBackgroundColor('#07070d');
    telegram.setBottomBarColor?.('#07070d');
    telegram.disableVerticalSwipes?.();
  } catch {
    // Игнорируем ограничения версии Telegram.
  }
}

export const haptic = {
  tap(): void {
    try {
      telegram?.HapticFeedback.impactOccurred('light');
    } catch {
      // Игнорируем.
    }
  },
  select(): void {
    try {
      telegram?.HapticFeedback.selectionChanged();
    } catch {
      // Игнорируем.
    }
  },
  success(): void {
    try {
      telegram?.HapticFeedback.notificationOccurred('success');
    } catch {
      // Игнорируем.
    }
  },
  warning(): void {
    try {
      telegram?.HapticFeedback.notificationOccurred('warning');
    } catch {
      // Игнорируем.
    }
  },
  error(): void {
    try {
      telegram?.HapticFeedback.notificationOccurred('error');
    } catch {
      // Игнорируем.
    }
  },
};

export function openExternal(url: string): void {
  if (isInTelegram && telegram) {
    try {
      telegram.openLink(url);
      return;
    } catch {
      // Пробуем window.open ниже.
    }
  }
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    // Игнорируем блокировку popup.
  }
}

export function openTelegramLink(url: string): void {
  if (isInTelegram && telegram) {
    try {
      telegram.openTelegramLink(url);
      return;
    } catch {
      // Пробуем window.open ниже.
    }
  }
  openExternal(url);
}

/** Системное уведомление Telegram WebApp (или обычный alert в вебе). */
export function showSystemAlert(message: string): void {
  if (isInTelegram && telegram) {
    try {
      telegram.showAlert(message);
      return;
    } catch {
      // Игнорируем.
    }
  }
  window.alert(message);
}

export function showSystemConfirm(message: string, onConfirm: () => void): void {
  if (isInTelegram && telegram) {
    try {
      telegram.showConfirm(message, (confirmed) => {
        if (confirmed) onConfirm();
      });
      return;
    } catch {
      // Игнорируем.
    }
  }
  if (window.confirm(message)) onConfirm();
}
