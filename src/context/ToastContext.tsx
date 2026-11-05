import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ToastItem, ToastKind } from '../types';

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (message: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++nextId;
    setToasts((prev) => [...prev.slice(-2), { id, message, kind }]);

    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
      timers.current.delete(id);
    }, 3000);

    timers.current.set(id, timer);
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast должен использоваться внутри ToastProvider');
  return context;
}
