import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('mr_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem('mr_auth');
      }
    }
    setLoading(false);
  }, []);

  const persist = (userData) => {
    localStorage.setItem('mr_auth', JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const { user: u, token } = await authApi.login(email, password);
    persist({ ...u, token });
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const { user: u, token } = await authApi.register(data);
    persist({ ...u, token });
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mr_auth');
    setUser(null);
  }, []);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isManager: user?.role === 'manager',
    isMR: user?.role === 'mr',
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
