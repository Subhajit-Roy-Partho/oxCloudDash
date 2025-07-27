
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { decode } from 'jsonwebtoken';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  register: (details: Omit<User, 'id'> & { passwordLogin: string }) => Promise<boolean>;
  login: (email: string, passwordLogin: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decode(token) as { exp: number };
          if (decoded.exp * 1000 > Date.now()) {
            // Token is valid, fetch user profile
            const profile = await api.getUserProfile();
            setUser(profile);
          } else {
            // Token expired
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const register = async (details: Omit<User, 'id'> & { passwordLogin: string }): Promise<boolean> => {
    try {
      await api.registerUser(details);
      // Registration successful, now login to get a token
      return await login(details.email, details.passwordLogin);
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  };

  const login = async (email: string, passwordLogin: string): Promise<boolean> => {
    setLoading(true);
    try {
      const data = await api.loginUser(email, passwordLogin);
      if (data.token) {
        localStorage.setItem('token', data.token);
        const profile = await api.getUserProfile();
        setUser(profile);
        router.push('/job-status');
        setLoading(false);
        return true;
      }
      throw new Error("Login failed: No token received");
    } catch (error) {
      console.error("Login failed:", error);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, register, login, logout, loading }}>
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
