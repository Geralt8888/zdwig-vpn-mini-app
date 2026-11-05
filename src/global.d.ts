import type { TelegramUser } from './types';

declare global {
  interface TelegramHapticFeedback {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  }

  interface TelegramBackButton {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: { user?: TelegramUser; start_param?: string };
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: Record<string, string>;
    ready(): void;
    expand(): void;
    close(): void;
    setHeaderColor(color: string): void;
    setBackgroundColor(color: string): void;
    setBottomBarColor?(color: string): void;
    disableVerticalSwipes?(): void;
    openLink(url: string, options?: { try_instant_view?: boolean }): void;
    openTelegramLink(url: string): void;
    showAlert(message: string, callback?: () => void): void;
    showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
    HapticFeedback: TelegramHapticFeedback;
    BackButton: TelegramBackButton;
  }

  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export {};
