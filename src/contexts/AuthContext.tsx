
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userId: string, username: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock persistence: check localStorage or a cookie
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    if (storedUserId && storedUsername) {
      setUser({ id: storedUserId, username: storedUsername });
    }
    setLoading(false);
  }, []);

  const login = (userId: string, username: string) => {
    const mockUser: User = { id: userId, username };
    setUser(mockUser);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    router.push('/job-status'); // Redirect to a dashboard page after login
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
