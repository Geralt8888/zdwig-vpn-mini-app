/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL Cloudflare Worker, который выдаёт ключи. */
  readonly VITE_API_BASE_URL?: string;
  /** Прямой URL FVPN API — только для локальной отладки. */
  readonly VITE_FVPN_API_URL?: string;
  /** Прямой ключ FVPN — только для локальной отладки, попадает в бандл. */
  readonly VITE_FVPN_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
