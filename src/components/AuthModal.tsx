import { useEffect, useId, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Info, LogIn, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { haptic } from '../lib/telegram';
import type { AuthMode } from '../types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export function AuthModal({ open, mode, onClose, onSwitchMode }: AuthModalProps) {
  const { register, login } = useAuth();
  const { toast } = useToast();
  const formId = useId();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  useEffect(() => {
    if (!open) return;
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setLoading(false);
  }, [open, mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const result = isRegister
        ? await register(name, email, password)
        : await login(email, password);

      if (!result.ok) {
        setError(result.error ?? 'Не удалось выполнить действие.');
        haptic.error();
        return;
      }

      haptic.success();
      toast(isRegister ? 'Профиль создан. Добро пожаловать!' : 'Вы вошли в профиль', 'success');
      onClose();
    } catch {
      setError('Что-то пошло не так. Попробуйте ещё раз.');
      haptic.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={isRegister ? <UserPlus className="h-7 w-7" /> : <LogIn className="h-7 w-7" />}
      title={isRegister ? 'Регистрация' : 'Вход'}
      subtitle={isRegister ? 'Создайте локальный профиль' : 'Вернитесь к своему профилю'}
      footer={
        <>
          <Button type="submit" form={formId} fullWidth loading={loading} icon={isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}>
            {isRegister ? 'Создать профиль' : 'Войти'}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>
            Отмена
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-3" noValidate>
        {isRegister ? (
          <label className="block">
            <span className="field-label">Имя</span>
            <div className="relative mt-1.5">
              <User
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                aria-hidden="true"
              />
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Как к вам обращаться"
                className="field pl-10"
                disabled={loading}
              />
            </div>
          </label>
        ) : null}

        <label className="block">
          <span className="field-label">Эл. почта</span>
          <div className="relative mt-1.5">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              className="field pl-10"
              disabled={loading}
            />
          </div>
        </label>

        <label className="block">
          <span className="field-label">Пароль</span>
          <div className="relative mt-1.5">
            <ShieldCheck
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder={isRegister ? 'Минимум 6 символов' : 'Ваш пароль'}
              className="field px-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => {
                haptic.tap();
                setShowPassword((value) => !value);
              }}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-white/45 transition hover:bg-white/[0.07] hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-2" aria-hidden="true" />
          <p className="text-[10.5px] leading-relaxed text-muted-2">
            Демо-профиль хранится только в этом браузере. Не используйте реальный пароль — данные не
            отправляются на сервер.
          </p>
        </div>
      </form>

      <p className="mt-4 text-center text-xs text-muted">
        {isRegister ? 'Уже есть профиль?' : 'Ещё нет профиля?'}{' '}
        <button
          type="button"
          onClick={() => {
            haptic.select();
            onSwitchMode(isRegister ? 'login' : 'register');
          }}
          className="font-bold text-[#c4b5fd] transition hover:text-white"
        >
          {isRegister ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </p>
    </Modal>
  );
}
