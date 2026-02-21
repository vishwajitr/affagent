import { useState, useEffect } from 'react';

const AUTH_KEY = 'affagent_auth';
const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo@123';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { isAuthenticated: false, username: null };
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth);

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = (username: string, password: string): boolean => {
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setAuth({ isAuthenticated: true, username });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, username: null });
    localStorage.removeItem(AUTH_KEY);
  };

  return { ...auth, login, logout };
}
