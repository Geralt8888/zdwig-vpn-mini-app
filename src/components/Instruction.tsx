import { useState } from 'react';
import { Check, Copy, Download, KeyRound, Server, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import { APP_CONFIG, INSTRUCTION_STEPS } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { copyText } from '../lib/clipboard';
import { openHapp } from '../lib/happ';
import { haptic, openExternal } from '../lib/telegram';
import { Button } from './ui/Button';
import { SectionHeading } from './ui/SectionHeading';

const APPS = [
  {
    name: 'Happ',
    platform: 'iOS · Android · macOS · Windows',
    url: 'https://happ.app',
  },
  {
    name: 'v2rayNG',
    platform: 'Android',
    url: 'https://github.com/2dust/v2rayNG/releases',
  },
  {
    name: 'Streisand',
    platform: 'iOS · macOS',
    url: 'https://apps.apple.com/app/streisand/id6450534064',
  },
];

export function Instruction() {
  const { currentKey, maskedKey, isTelegram } = useApp();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    haptic.tap();
    const ok = await copyText(currentKey);
    if (ok) {
      haptic.success();
      setCopied(true);
      toast('Ключ скопирован', 'success');
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      haptic.error();
      toast('Не удалось скопировать ключ', 'error');
    }
  };

  return (
    <section className="animate-page-in mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Быстрый старт"
        title="Инструкция"
        description="Подключение занимает меньше минуты. Нужен только ключ доступа и приложение Happ."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <Smartphone className="h-4 w-4 text-accent" aria-hidden="true" />
              4 шага до подключения
            </h3>

            <ol className="mt-4 space-y-3">
              {INSTRUCTION_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-extrabold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-[12.5px] leading-relaxed text-white/80">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/35 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="field-label">Ваш ключ</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c4b5fd] transition hover:text-white"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
              <code className="mt-2 block break-all font-mono text-[11px] leading-relaxed text-[#c7c9e8]">
                {maskedKey}
              </code>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button
                onClick={() => {
                  haptic.tap();
                  const opened = openHapp(currentKey);
                  toast(
                    opened ? 'Открываем Happ…' : 'Happ не открылся — скопируйте ключ вручную',
                    opened ? 'info' : 'error',
                  );
                }}
                icon={<Zap className="h-4 w-4" />}
              >
                Открыть Happ
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopy}
                icon={
                  copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )
                }
              >
                {copied ? 'Ключ скопирован' : 'Копировать ключ'}
              </Button>
            </div>

            {isTelegram ? (
              <p className="mt-3 text-[10.5px] leading-relaxed text-muted-2">
                В Telegram ключ копируется в буфер обмена — вставьте его в Happ через «Импорт из
                буфера обмена».
              </p>
            ) : null}
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <Download className="h-4 w-4 text-accent-2" aria-hidden="true" />
              Приложения
            </h3>
            <ul className="mt-3 space-y-2">
              {APPS.map((app) => (
                <li
                  key={app.name}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold">{app.name}</p>
                    <p className="text-[10.5px] text-muted-2">{app.platform}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      haptic.tap();
                      openExternal(app.url);
                    }}
                    className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10.5px] font-bold text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Открыть
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold">
              <Server className="h-4 w-4 text-gold" aria-hidden="true" />
              Сервер
            </h3>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
                <dt className="text-muted-2">Название</dt>
                <dd className="font-semibold">{APP_CONFIG.server.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
                <dt className="text-muted-2">Протокол</dt>
                <dd className="font-semibold">VLESS · Reality</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
                <dt className="text-muted-2">Порт</dt>
                <dd className="font-mono font-semibold">{APP_CONFIG.server.port}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-2">Хост</dt>
                <dd className="truncate font-mono text-[11px] font-semibold">{APP_CONFIG.server.host}</dd>
              </div>
            </dl>
          </div>

          <div className="glass flex items-start gap-2.5 rounded-2xl px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed text-muted">
              Не передавайте ключ третьим лицам: он даёт доступ к вашей подписке. При компрометации
              сбросьте ключ в профиле.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
