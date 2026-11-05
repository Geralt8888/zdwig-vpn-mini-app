import { APP_CONFIG } from '../config';
import { isInTelegram, openTelegramLink, telegram } from './telegram';

export function buildHappLink(key: string): string {
  return `happ://add/${encodeURIComponent(key)}`;
}

/** Пытается открыть Happ по deep-link. Возвращает true, если переход инициирован. */
export function openHapp(key: string): boolean {
  const scheme = buildHappLink(key);

  if (isInTelegram && telegram) {
    try {
      telegram.openLink(scheme);
      return true;
    } catch {
      // Пробуем обычный переход ниже.
    }
  }

  try {
    const link = document.createElement('a');
    link.href = scheme;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch {
    return false;
  }
}

export function shareApp(): void {
  const url = APP_CONFIG.links.bot || window.location.href;
  const text = 'Попробуй zdwig vpn — быстрый и безопасный VPN в Telegram ⚡';
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

  try {
    openTelegramLink(shareUrl);
  } catch {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }
}
