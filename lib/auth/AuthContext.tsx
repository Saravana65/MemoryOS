'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../types/user';
import * as authApi from '../api/auth';
import { setAccessToken } from '../api/client';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: authApi.LoginPayload) => Promise<void>;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setAuthCookie = (isActive: boolean) => {
  if (typeof window !== 'undefined') {
    if (isActive) {
      document.cookie = "isAuthenticated=true; path=/; max-age=31536000; SameSite=Lax";
    } else {
      document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize session from stored refresh token
  useEffect(() => {
    async function initAuth() {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (refreshToken) {
        try {
          const refreshRes = await authApi.refresh(refreshToken);
          if (refreshRes.access_token) {
            setAuthCookie(true);
            const currentUser = await authApi.getMe();
            setUser(currentUser);
          } else {
            setAuthCookie(false);
          }
        } catch (err) {
          console.error('Initial authentication check failed:', err);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('refresh_token');
          }
          setAuthCookie(false);
          setAccessToken(null);
          setUser(null);
        }
      } else {
        setAuthCookie(false);
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  // Listen for logout events dispatched by client.ts
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setAuthCookie(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token');
      }
      router.push('/login');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-logout', handleForceLogout);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-logout', handleForceLogout);
      }
    };
  }, [router]);

  const login = async (payload: authApi.LoginPayload) => {
    setLoading(true);
    try {
      const tokens = await authApi.login(payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      setAuthCookie(true);
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      router.push('/dashboard');
    } catch (err) {
      setAuthCookie(false);
      setAccessToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: authApi.RegisterPayload) => {
    setLoading(true);
    try {
      await authApi.register(payload);
      const tokens = await authApi.login({
        email: payload.email,
        password: payload.password,
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      setAuthCookie(true);
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      router.push('/dashboard');
    } catch (err) {
      setAuthCookie(false);
      setAccessToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout request failed on backend:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token');
      }
      setAuthCookie(false);
      setAccessToken(null);
      setUser(null);
      router.push('/login');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
