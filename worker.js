/**
 * zdwig vpn — Cloudflare Worker API
 * ------------------------------------------------------------
 * Видає VLESS-ключі користувачам Telegram Mini App.
 * Секрети НІКОЛИ не потрапляють у клієнт: вони зберігаються
 * як environment secrets у Cloudflare.
 *
 * Ендпоінти:
 *   GET  /health    — перевірка живості (без секретів)
 *   POST /api/key   — { initData } -> { key, plan, expiresAt, demo }
 *
 * Змінні оточення (wrangler secret put ...):
 *   BOT_TOKEN     — токен Telegram-бота (обов'язково)
 *   VPN_API_KEY   — ключ VPN-провайдера (обов'язково для реальних ключів)
 *   VPN_API_URL   — base URL API провайдера (опційно; без нього — демо-ключ)
 *   ALLOWED_ORIGIN— дозволений Origin, напр. https://user.github.io (опційно)
 *   DEMO_MODE     — "1" щоб примусово видавати демо-ключі (опційно)
 */

const DEFAULT_SERVER = {
  name: 'DE-1 · Frankfurt',
  host: 'de1.zdwig.net',
  port: 443,
  sni: 'de1.zdwig.net',
  path: '/ws-zdwig',
  fp: 'chrome'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, origin) });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/health') {
        return json(
          {
            ok: true,
            service: 'zdwig-vpn-api',
            time: new Date().toISOString(),
            configured: {
              botToken: Boolean(env.BOT_TOKEN),
              vpnApi: Boolean(env.VPN_API_URL && env.VPN_API_KEY)
            }
          },
          200,
          env,
          origin
        );
      }

      if (request.method === 'POST' && url.pathname === '/api/key') {
        return await handleKey(request, env, origin);
      }

      return json({ error: 'not_found' }, 404, env, origin);
    } catch (error) {
      console.error('[zdwig] unhandled error:', error && error.stack ? error.stack : error);
      return json({ error: 'internal_error' }, 500, env, origin);
    }
  }
};

/* ============================================================
   /api/key
   ============================================================ */

async function handleKey(request, env, origin) {
  if (!env.BOT_TOKEN) {
    return json({ error: 'server_not_configured', hint: 'Set BOT_TOKEN secret' }, 500, env, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'invalid_json' }, 400, env, origin);
  }

  const initData = typeof body.initData === 'string' ? body.initData : '';
  if (!initData) {
    return json({ error: 'missing_init_data' }, 400, env, origin);
  }

  const auth = await validateInitData(initData, env.BOT_TOKEN);
  if (!auth.ok) {
    return json({ error: 'unauthorized', reason: auth.reason }, 401, env, origin);
  }

  const user = auth.user || {};
  const isDemo = env.DEMO_MODE === '1' || !env.VPN_API_URL;

  try {
    const issued = isDemo
      ? { key: demoKey(user), plan: 'Free', expiresAt: 0, demo: true }
      : await issueVpnKey(env, user);

    return json(
      {
        key: issued.key,
        plan: issued.plan || 'Free',
        expiresAt: issued.expiresAt || 0,
        demo: Boolean(issued.demo),
        user: { id: user.id, first_name: user.first_name || '' }
      },
      200,
      env,
      origin
    );
  } catch (error) {
    console.error('[zdwig] provider error:', error && error.message ? error.message : error);
    return json(
      {
        error: 'provider_unavailable',
        hint: 'Перевірте VPN_API_URL / VPN_API_KEY або тимчасово увімкніть DEMO_MODE=1'
      },
      502,
      env,
      origin
    );
  }
}

/* ============================================================
   Telegram initData validation (HMAC-SHA256)
   https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   ============================================================ */

async function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'missing_hash' };

  params.delete('hash');

  const pairs = [];
  for (const [key, value] of params.entries()) {
    pairs.push(key + '=' + value);
  }
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const secret = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));

  const dataKey = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', dataKey, encoder.encode(dataCheckString));
  const computed = toHex(signature);

  if (!timingSafeEqual(computed, hash.toLowerCase())) {
    return { ok: false, reason: 'bad_hash' };
  }

  const authDate = Number(params.get('auth_date') || 0);
  const maxAge = 24 * 60 * 60; // 24 години
  if (!authDate || Math.abs(Date.now() / 1000 - authDate) > maxAge) {
    return { ok: false, reason: 'expired' };
  }

  let user = null;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch (e) {
    user = null;
  }
  if (!user || !user.id) return { ok: false, reason: 'no_user' };

  return { ok: true, user: user };
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map(function (b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ============================================================
   VPN provider adapter
   ------------------------------------------------------------
   !!! ЗАМІНІТЬ ЦЕ НА РЕАЛЬНИЙ API ВАШОГО VPN-ПРОВАЙДЕРА !!!
   Формат запиту/відповіді може відрізнятися. Нижче — типовий
   варіант: POST {VPN_API_URL}/keys з Bearer-токеном.
   ============================================================ */

async function issueVpnKey(env, user) {
  const base = String(env.VPN_API_URL).replace(/\/+$/, '');
  const endpoint = /\/keys$/.test(base) ? base : base + '/keys';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + env.VPN_API_KEY
    },
    body: JSON.stringify({
      telegram_id: user.id,
      username: user.username || '',
      first_name: user.first_name || '',
      plan: 'free',
      server: DEFAULT_SERVER.name
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(function () { return ''; });
    throw new Error('Provider HTTP ' + response.status + ' ' + text.slice(0, 200));
  }

  const data = await response.json();

  // Провайдери повертають ключ під різними назвами — підтримуємо найпоширеніші.
  const key =
    data.key ||
    data.config ||
    data.connection_string ||
    data.vless ||
    data.link ||
    data.url ||
    (data.data && (data.data.key || data.data.config || data.data.link)) ||
    '';

  if (!key || typeof key !== 'string') {
    throw new Error('Provider response has no key');
  }

  return {
    key: key,
    plan: data.plan || data.tariff || 'Free',
    expiresAt: normalizeExpiry(data.expires_at || data.expiresAt || data.expiry),
    demo: false
  };
}

function normalizeExpiry(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value < 1e12 ? value * 1000 : value;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? 0 : ts;
}

/* ============================================================
   Demo key (детермінований, як у index.html)
   ============================================================ */

function demoKey(user) {
  const seed = user && user.id ? 'tg:' + user.id : 'guest';
  const id = uuidFromSeed(seed);
  const query = new URLSearchParams({
    type: 'ws',
    security: 'tls',
    sni: DEFAULT_SERVER.sni,
    host: DEFAULT_SERVER.host,
    path: DEFAULT_SERVER.path,
    fp: DEFAULT_SERVER.fp,
    alpn: 'h2,http/1.1'
  });
  return (
    'vless://' + id + '@' + DEFAULT_SERVER.host + ':' + DEFAULT_SERVER.port +
    '?' + query.toString() +
    '#' + encodeURIComponent('zdwig vpn · ' + DEFAULT_SERVER.name)
  );
}

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function uuidFromSeed(seed) {
  let hex = '';
  for (let i = 0; i < 4; i++) hex += fnv1a(seed + '|' + i).toString(16).padStart(8, '0');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '5' + hex.slice(13, 16),
    ((parseInt(hex.charAt(16), 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20),
    hex.slice(20, 32)
  ].join('-');
}

/* ============================================================
   Helpers
   ============================================================ */

function corsHeaders(env, origin) {
  const allowed = env.ALLOWED_ORIGIN || '*';
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };

  if (allowed === '*') headers['Access-Control-Allow-Origin'] = '*';
  else if (origin === allowed) headers['Access-Control-Allow-Origin'] = allowed;

  return headers;
}

function json(payload, status, env, origin) {
  return new Response(JSON.stringify(payload), {
    status: status,
    headers: Object.assign(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer'
      },
      corsHeaders(env, origin)
    )
  });
}
