import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'input, textarea, select, button, [href]',
      );
      focusable?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'animate-sheet-in relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0d0e18]/95 p-5 shadow-[0_-20px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:rounded-3xl sm:p-6',
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-md',
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/15 sm:hidden" aria-hidden="true" />

        {icon ? (
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-accent/25 to-accent-2/10 text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            {icon}
          </div>
        ) : null}

        {title ? (
          <h3 id={titleId} className="text-center text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
            {title}
          </h3>
        ) : null}

        {subtitle ? (
          <p className="mt-1 text-center text-sm font-semibold text-[#c4b5fd]">{subtitle}</p>
        ) : null}

        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-5 flex flex-col gap-2">{footer}</div> : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
