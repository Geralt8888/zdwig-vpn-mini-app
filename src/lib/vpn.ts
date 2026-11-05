import { APP_CONFIG } from '../config';
import type { IssuedKey, Plan } from '../types';
import { uuidFromSeed } from './crypto';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
const FVPN_BASE = (import.meta.env.VITE_FVPN_API_URL ?? '').trim().replace(/\/+$/, '');
const FVPN_KEY = (import.meta.env.VITE_FVPN_API_KEY ?? '').trim();

/**
 * Прямой ключ FVPN (VITE_FVPN_API_KEY) предназначен только для локальной
 * отладки: переменные VITE_* попадают в клиентский бандл. В продакшене
 * ключ должен храниться в Cloudflare Worker как секрет.
 */
export const isBackendConfigured = Boolean(API_BASE || (FVPN_BASE && FVPN_KEY));

export function generateDemoKey(seed: string): string {
  const server = APP_CONFIG.server;
  const id = uuidFromSeed(seed);
  const query = new URLSearchParams({
    type: 'ws',
    security: 'tls',
    sni: server.sni,
    host: server.host,
    path: server.path,
    fp: server.fp,
    alpn: 'h2,http/1.1',
  });

  return `vless://${id}@${server.host}:${server.port}?${query.toString()}#${encodeURIComponent(
    `zdwig vpn · ${server.name}`,
  )}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizePlan(value: unknown): Plan {
  const raw = String(value ?? '').toLowerCase();
  if (raw.includes('pro')) return 'Pro';
  if (raw.includes('plus') || raw.includes('premium')) return 'Plus';
  return 'Free';
}

function normalizeExpiry(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value < 1e12 ? value * 1000 : value;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function extractKey(payload: unknown): string {
  const data = asRecord(payload);
  const nested = asRecord(data.data);
  const candidates = [
    data.key,
    data.config,
    data.connection_string,
    data.vless,
    data.link,
    data.url,
    nested.key,
    nested.config,
    nested.link,
  ];

  const found = candidates.find((value) => typeof value === 'string' && value.length > 8);
  return typeof found === 'string' ? found : '';
}

async function postJson(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Запрашивает ключ у Cloudflare Worker (безопасный путь) или напрямую у FVPN
 * (только локальная отладка). Возвращает null, если бэкенд не настроен.
 */
export async function requestVpnKey(initData: string, seed: string): Promise<IssuedKey | null> {
  if (!isBackendConfigured) return null;

  try {
    if (API_BASE) {
      if (!initData) return null;

      const payload = await postJson(`${API_BASE}/api/key`, { initData });
      const data = asRecord(payload);
      const key = extractKey(payload);
      if (!key) return null;

      return {
        key,
        plan: normalizePlan(data.plan),
        expiresAt: normalizeExpiry(data.expiresAt),
        demo: Boolean(data.demo),
      };
    }

    if (FVPN_BASE && FVPN_KEY) {
      const payload = await postJson(
        /\/keys$/.test(FVPN_BASE) ? FVPN_BASE : `${FVPN_BASE}/keys`,
        {
          telegram_id: seed.startsWith('tg:') ? seed.slice(3) : null,
          plan: 'free',
          server: APP_CONFIG.server.name,
        },
        { Authorization: `Bearer ${FVPN_KEY}` },
      );
      const data = asRecord(payload);
      const key = extractKey(payload);
      if (!key) return null;

      return {
        key,
        plan: normalizePlan(data.plan),
        expiresAt: normalizeExpiry(data.expires_at ?? data.expiresAt ?? data.expiry),
        demo: false,
      };
    }
  } catch (error) {
    // Не логируем ключ и тело ответа: только факт ошибки.
    console.warn('[zdwig] VPN API недоступен, используется демо-ключ:', error instanceof Error ? error.message : 'unknown');
  }

  return null;
}
