import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/cn';

const tones = {
  success: 'border-success/30 bg-[#0d1a16]/95 text-[#a7f3d0]',
  error: 'border-red-400/30 bg-[#1b0d12]/95 text-[#fecaca]',
  info: 'border-accent/30 bg-[#120e24]/95 text-[#ddd6fe]',
} as const;

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

export function ToastViewport() {
  const { toasts } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[120] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((item) => {
        const Icon = icons[item.kind];
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              'animate-sheet-in flex w-full max-w-sm items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl',
              tones[item.kind],
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">{item.message}</span>
          </div>
        );
      })}
    </div>
  );
}
