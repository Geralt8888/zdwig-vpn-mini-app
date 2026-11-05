import { useState } from 'react';
import { Check, Copy, Eye, EyeOff, Info, KeyRound, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/cn';
import { copyText } from '../lib/clipboard';
import { openHapp } from '../lib/happ';
import { haptic, showSystemAlert } from '../lib/telegram';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

const KEY_FORMAT_RE = /^(vless|vmess|trojan|ss|hysteria2?|tuic):\/\//i;

export function HappConnect() {
  const {
    currentKey,
    maskedKey,
    keyVisible,
    toggleKeyVisibility,
    setCustomKey,
    demoKey,
    backendConfigured,
    isTelegram,
  } = useApp();
  const { toast } = useToast();

  const [customOpen, setCustomOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    haptic.tap();
    const ok = await copyText(currentKey);

    if (!ok) {
      haptic.error();
      toast('Не удалось скопировать ключ', 'error');
      return;
    }

    haptic.success();
    setCopied(true);
    toast('Ключ скопирован', 'success');
    if (isTelegram) {
      showSystemAlert('Ключ скопирован в буфер обмена. Вставьте его в Happ.');
    }
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleHapp = () => {
    haptic.tap();
    const opened = openHapp(currentKey);
    toast(
      opened ? 'Открываем Happ…' : 'Happ не открылся — скопируйте ключ вручную',
      opened ? 'info' : 'error',
    );
  };

  const openCustom = () => {
    haptic.tap();
    setDraft(currentKey);
    setCustomOpen(true);
  };

  const copyDraft = async () => {
    const ok = await copyText(draft.trim() || demoKey);
    if (ok) {
      haptic.success();
      toast('Ключ скопирован', 'success');
    } else {
      haptic.error();
      toast('Не удалось скопировать ключ', 'error');
    }
  };

  const saveCustom = () => {
    const value = draft.trim();

    if (!value) {
      setCustomKey(null);
      setCustomOpen(false);
      haptic.success();
      toast('Возвращён автоматический ключ', 'success');
      return;
    }

    if (!KEY_FORMAT_RE.test(value) && !/^https?:\/\//i.test(value)) {
      haptic.error();
      toast('Неверный формат ключа', 'error');
      return;
    }

    setCustomKey(value);
    setCustomOpen(false);
    haptic.success();
    toast('Ключ сохранён', 'success');
  };

  return (
    <>
      <section id="connect" className="card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{APP_CONFIG.server.name}</p>
              <p className="text-[11px] text-muted-2">{APP_CONFIG.server.meta}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-success/25 bg-success/10 px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-wider text-success">
            онлайн
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/35 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="field-label">Ключ доступа</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  haptic.tap();
                  toggleKeyVisibility();
                }}
                aria-label={keyVisible ? 'Скрыть ключ' : 'Показать ключ'}
                aria-pressed={keyVisible}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/55 transition hover:bg-white/[0.07] hover:text-white"
              >
                {keyVisible ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Копировать ключ"
                className="grid h-8 w-8 place-items-center rounded-lg text-white/55 transition hover:bg-white/[0.07] hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <code className="mt-2 block break-all font-mono text-[11.5px] leading-relaxed text-[#c7c9e8]">
            {keyVisible ? currentKey : maskedKey}
          </code>
        </div>

        <Button
          size="lg"
          fullWidth
          onClick={handleHapp}
          className="mt-3"
          icon={<Zap className="h-4.5 w-4.5" />}
        >
          Подключить в Happ
        </Button>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            onClick={handleCopy}
            icon={copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          >
            {copied ? 'Скопировано' : 'Копировать'}
          </Button>
          <Button variant="ghost" onClick={openCustom} icon={<KeyRound className="h-4 w-4" />}>
            Свой ключ
          </Button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-2" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-muted-2">
            {backendConfigured
              ? 'Ключ выдаётся защищённым API. Один ключ работает на 5 устройствах.'
              : 'Демо-режим: ключ генерируется локально. Для реальных ключей подключите Cloudflare Worker.'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] font-medium text-muted-2">
          <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          VLESS · Reality · без логов
        </div>
      </section>

      <Modal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        icon={<KeyRound className="h-7 w-7" />}
        title="Пользовательский ключ"
        subtitle="VLESS · VMess · Trojan"
        footer={
          <>
            <Button fullWidth onClick={saveCustom}>
              Сохранить ключ
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setCustomOpen(false)}>
              Отмена
            </Button>
          </>
        }
      >
        <p className="text-center text-xs leading-relaxed text-muted">
          Вставьте свой ключ или оставьте автоматический. Пустое поле вернёт ключ zdwig.
        </p>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          spellCheck={false}
          placeholder="vless://..."
          className="field mt-4 min-h-[120px] resize-y py-3 font-mono text-xs"
          aria-label="Ключ подключения"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={copyDraft} icon={<Copy className="h-3.5 w-3.5" />}>
            Копировать
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraft(demoKey)}
            icon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Автоматический
          </Button>
        </div>

        <p className={cn('mt-3 text-center text-[10.5px]', backendConfigured ? 'text-success' : 'text-muted-2')}>
          {backendConfigured ? 'Подключён защищённый API' : 'Локальная генерация ключа'}
        </p>
      </Modal>
    </>
  );
}
