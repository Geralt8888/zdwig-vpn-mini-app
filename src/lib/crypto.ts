/** Быстрый детерминированный хеш (fallback, если Web Crypto недоступен). */
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Детерминированный UUID из строкового seed (для демо-ключей). */
export function uuidFromSeed(seed: string): string {
  let hex = '';
  for (let i = 0; i < 4; i++) {
    hex += fnv1a(`${seed}|${i}`).toString(16).padStart(8, '0');
  }
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${((parseInt(hex.charAt(16), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

/**
 * SHA-256 для локального демо-профиля.
 * Пароли не покидают браузер и хранятся только в виде хеша.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    if (window.crypto?.subtle && window.TextEncoder) {
      const bytes = new TextEncoder().encode(password);
      const digest = await window.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Переходим к fallback ниже.
  }
  return `fallback:${fnv1a(password).toString(16)}`;
}
