import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResult, AuthUser, Session } from '../types';
import { hashPassword } from '../lib/crypto';
import { AUTH_KEY, SESSION_KEY, loadJson, saveJson } from '../lib/storage';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUsers(): AuthUser[] {
  const stored = loadJson<AuthUser[]>(AUTH_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AuthUser[]>(loadUsers);
  const [session, setSession] = useState<Session | null>(() => loadJson<Session>(SESSION_KEY));

  useEffect(() => {
    saveJson(AUTH_KEY, users);
  }, [users]);

  useEffect(() => {
    saveJson(SESSION_KEY, session);
  }, [session]);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName) return { ok: false, error: 'Введите имя.' };
      if (!EMAIL_RE.test(cleanEmail)) return { ok: false, error: 'Введите корректный адрес эл. почты.' };
      if (password.length < 6) return { ok: false, error: 'Пароль должен содержать минимум 6 символов.' };
      if (users.some((user) => user.email === cleanEmail)) {
        return { ok: false, error: 'Профиль с таким адресом эл. почты уже существует.' };
      }

      const passHash = await hashPassword(password);
      const user: AuthUser = {
        name: cleanName,
        email: cleanEmail,
        passHash,
        createdAt: Date.now(),
      };

      setUsers((prev) => [...prev, user]);
      setSession({ name: user.name, email: user.email, at: Date.now() });
      return { ok: true };
    },
    [users],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!EMAIL_RE.test(cleanEmail)) return { ok: false, error: 'Введите корректный адрес эл. почты.' };
      if (!password) return { ok: false, error: 'Введите пароль.' };

      const passHash = await hashPassword(password);
      const user = users.find((item) => item.email === cleanEmail);

      if (!user || user.passHash !== passHash) {
        return { ok: false, error: 'Неверный адрес эл. почты или пароль.' };
      }

      setSession({ name: user.name, email: user.email, at: Date.now() });
      return { ok: true };
    },
    [users],
  );

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      register,
      login,
      logout,
    }),
    [session, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return context;
}
