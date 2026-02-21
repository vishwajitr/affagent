import { useState, useEffect } from 'react';
import { authApi } from '../services/api';

const TOKEN_KEY = 'voxly_token';
const AUTH_KEY = 'voxly_auth';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userId: string | null;
}

function getStoredAuth(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(AUTH_KEY);
    if (token && raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { isAuthenticated: false, username: null, userId: null };
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth);

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = async (username: string, password: string): Promise<void> => {
    const res = await authApi.login(username, password);
    const { token, username: uname, userId } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAuth({ isAuthenticated: true, username: uname, userId });
  };

  const register = async (username: string, password: string): Promise<void> => {
    const res = await authApi.register(username, password);
    const { token, username: uname, userId } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setAuth({ isAuthenticated: true, username: uname, userId });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
    setAuth({ isAuthenticated: false, username: null, userId: null });
  };

  return { ...auth, login, register, logout };
}
