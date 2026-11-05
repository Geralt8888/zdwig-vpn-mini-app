# zdwig vpn — Telegram Mini App

Современная версия Telegram Mini App и веб-версии **zdwig vpn**: тёмный интерфейс,
подключение через Happ, колесо фортуны на Canvas и локальные профили.

Переписано на **React 19 + TypeScript + Tailwind CSS v4 + Vite**.

## Возможности

- **SPA-навигация** без перезагрузки: Главная, Поддержка, Колесо фортуны, Тарифы, Профиль, Инструкция.
- **Тёмная тема Telegram WebApp**: адаптив под мобильные и десктопные экраны, портрет и ландшафт.
- **Подключение через Happ**: копирование VLESS-ключа, deep-link `happ://add/...`, системные уведомления Telegram.
- **Колесо фортуны**: 12 призов, плавная анимация, 3 бесплатных спина в день, бонус за приглашение, история выигрышей и конфетти.
- **Регистрация и вход**: модальные окна с валидацией, показом пароля и хранением хеша пароля локально.
- **Тарифы и скидки**: скидка с колеса автоматически применяется к цене.
- **Демо-режим**: без бэкенда ключ генерируется локально, прогресс хранится в `localStorage`.

## Стек

| Технология | Версия |
| --- | --- |
| React | 19 |
| TypeScript | 5.8 |
| Vite | 6 |
| Tailwind CSS | 4 (`@tailwindcss/vite`) |
| lucide-react | иконки |

## Структура проекта

```
src/
  components/
    ui/              Button, Modal, Toast, Confetti, SectionHeading
    Header.tsx       Шапка и навигация
    HeroSection.tsx  Первый экран
    HappConnect.tsx  Ключ, копирование, Happ, свой ключ
    WheelOfFortune.tsx
    AuthModal.tsx
    Tariffs.tsx
    Profile.tsx
    Support.tsx
    Instruction.tsx
    HomePage.tsx
    Footer.tsx
  context/           ToastContext, AuthContext, AppContext
  hooks/             useHashRoute, useWheel
  lib/               api, storage, crypto, format, telegram, happ, wheel
  config.ts          Конфигурация, призы, тарифы
  types.ts           Общие типы
  App.tsx            Роутинг и модальные окна
  main.tsx           Точка входа и провайдеры
worker.js            Cloudflare Worker для выдачи ключей
wrangler.toml        Конфигурация Worker
legacy/              Старая версия приложения (index.legacy.html)
```

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте `http://localhost:5173`.

Сборка и предпросмотр:

```bash
npm run build
npm run preview
```

Проверка типов:

```bash
npm run typecheck
```

## Переменные окружения

Создайте `.env` на основе `.env.example`:

```env
# URL Cloudflare Worker. Пусто = демо-режим.
VITE_API_BASE_URL=

# Только для локальной отладки (НЕ для продакшена):
# VITE_FVPN_API_URL=
# VITE_FVPN_API_KEY=
```

> **Важно:** все переменные `VITE_*` попадают в клиентский бандл. Не храните в них
> секреты для продакшена. Реальный ключ VPN-провайдера должен жить только в
> Cloudflare Worker как секрет.

## Реальные ключи через Cloudflare Worker

Worker проверяет подпись Telegram `initData` и только затем выдаёт ключ.

### 1. Установка Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Секреты

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put VPN_API_KEY
npx wrangler secret put VPN_API_URL
```

- `BOT_TOKEN` — токен бота из BotFather.
- `VPN_API_KEY` — ключ VPN-провайдера (например, `fvpn_live_...`).
- `VPN_API_URL` — base URL API провайдера. Без него Worker выдаёт демо-ключ.

Адаптер провайдера находится в `worker.js` (`issueVpnKey`). По умолчанию он
выполняет `POST {VPN_API_URL}/keys` с `Authorization: Bearer <VPN_API_KEY>`.
Если у вашего провайдера другой формат — отредактируйте эту функцию.

### 3. Локальная разработка Worker

```bash
cp .dev.vars.example .dev.vars
npx wrangler dev
```

`.dev.vars` уже добавлен в `.gitignore` и никогда не должен попадать в репозиторий.

### 4. Деплой

```bash
npx wrangler deploy
```

Проверка:

```bash
curl https://zdwig-vpn-api.<account>.workers.dev/health
```

Полученный URL укажите в `.env`:

```env
VITE_API_BASE_URL=https://zdwig-vpn-api.<account>.workers.dev
```

### 5. Ограничение Origin

В `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGIN = "https://<username>.github.io"
```

## Деплой на GitHub Pages

1. Соберите проект: `npm run build`.
2. Опубликуйте содержимое `dist/` (например, через GitHub Actions или ветку `gh-pages`).
3. В `vite.config.ts` уже установлен `base: './'`, поэтому сборка работает в подпапке.
4. Добавьте адрес приложения в BotFather: `/newapp` или `Bot Settings → Menu Button`.

## Как работает защита

1. Клиент отправляет `Telegram.WebApp.initData` на Worker.
2. Worker проверяет HMAC-SHA256 подпись с помощью `BOT_TOKEN`.
3. Проверяются `auth_date` (не старше 24 часов) и `user.id`.
4. Только после этого выдаётся ключ.

Подделать `initData` без токена бота невозможно.

## Локальные данные

Прогресс хранится в `localStorage` и совместим с предыдущей версией:

- `zdwig.v1:<telegram_id>` или `zdwig.v1:guest` — спины, подписка, ключ, история.
- `zdwig.auth.v1` — локальные демо-профили (пароль в виде SHA-256 хеша).
- `zdwig.session.v1` — активная локальная сессия.
- `zdwig.guest` — идентификатор гостя.

Демо-профиль не связан с сервером. Не используйте реальные пароли.

## Безопасность

- Не коммитьте `BOT_TOKEN`, `VPN_API_KEY`, `.env` и `.dev.vars`.
- Если секрет уже публиковался — отзовите его:
  - BotFather → `/revoke`;
  - панель VPN-провайдера → rotate API key.
- Храните секреты только через `wrangler secret put` или Cloudflare Dashboard.
- Для продакшена не используйте `VITE_FVPN_API_KEY`: он попадёт в бандл.

## Скрипты

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Проверка типов + production-сборка |
| `npm run preview` | Предпросмотр сборки |
| `npm run typecheck` | Проверка TypeScript |

---

© 2026 zdwig vpn
