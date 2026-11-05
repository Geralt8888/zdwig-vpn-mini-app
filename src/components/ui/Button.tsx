import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const base =
  'relative inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold tracking-[-0.01em] transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55';

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-[52px] px-5 text-[15px]',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-accent via-[#6366f1] to-accent-2 text-white shadow-[0_16px_38px_-16px_rgba(124,92,255,0.9)] hover:brightness-110',
  ghost:
    'border border-white/10 bg-white/[0.03] text-white/85 hover:bg-white/[0.07] hover:text-white',
  soft: 'border border-accent/30 bg-accent/15 text-[#c4b5fd] hover:bg-accent/25',
  danger: 'border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20',
  gold: 'bg-gradient-to-r from-gold to-[#f0b429] text-[#1a1405] hover:brightness-105',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    children,
    type = 'button',
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});
