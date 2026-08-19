import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { login as loginApi } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { clearToken, getToken, setToken } from '../lib/auth-storage';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!getToken());
    setIsLoading(false);

    setUnauthorizedHandler(() => {
      sessionStorage.setItem(
        'job_tracker_auth_notice',
        'Your session has expired. Please sign in again.',
      );
      clearToken();
      setIsAuthenticated(false);
    });
  }, []);

  const login = useCallback(async (password: string) => {
    const { accessToken } = await loginApi(password);
    setToken(accessToken);
    setIsAuthenticated(true);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
