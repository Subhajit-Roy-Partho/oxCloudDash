
"use client";

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  register: (details: Omit<User, 'id' | 'password'> & { passwordLogin: string }) => Promise<boolean>;
  login: (usernameLogin: string, passwordLogin: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const storedUsername = localStorage.getItem('username');
    const storedName = localStorage.getItem('name');
    const storedInstituteName = localStorage.getItem('instituteName');
    // IMPORTANT: Storing password in localStorage is insecure and for mock only.
    // const storedPassword = localStorage.getItem('password'); 

    if (storedUsername && storedName && storedInstituteName) {
      setUser({ 
        id: storedUsername, // Use username as ID for mock
        username: storedUsername, 
        name: storedName, 
        instituteName: storedInstituteName,
        // password: storedPassword || undefined // For mock purposes if needed elsewhere, but login will re-check
      });
    }
    setLoading(false);
  }, []);

  const register = async (details: Omit<User, 'id' | 'password'> & { passwordLogin: string }): Promise<boolean> => {
    // Mock registration: check if username already exists
    if (localStorage.getItem(`user_${details.username}_password`)) {
      console.warn("Username already exists");
      return false; // Indicate failure
    }

    const newUser: User = {
      id: details.username, // Use username as ID
      username: details.username,
      name: details.name,
      instituteName: details.instituteName,
      // password: details.passwordLogin // Storing password is for mock check during login only
    };
    
    // Store user details. For mock, password check will be against this.
    localStorage.setItem('username', details.username);
    localStorage.setItem('name', details.name);
    localStorage.setItem('instituteName', details.instituteName);
    // IMPORTANT: Storing password in localStorage is highly insecure. This is for mock functionality only.
    localStorage.setItem(`user_${details.username}_password`, details.passwordLogin); 
    
    setUser(newUser);
    router.push('/job-status');
    return true; // Indicate success
  };

  const login = async (usernameLogin: string, passwordLogin: string): Promise<boolean> => {
    setLoading(true);
    // Mock login: retrieve "stored" password for this user
    const storedPassword = localStorage.getItem(`user_${usernameLogin}_password`);
    const storedName = localStorage.getItem('name'); // Assuming name/institute are associated with last logged/registered user
    const storedInstituteName = localStorage.getItem('instituteName');

    if (storedPassword === passwordLogin && storedName && storedInstituteName) {
      const loggedInUser: User = {
        id: usernameLogin,
        username: usernameLogin,
        name: localStorage.getItem(`user_${usernameLogin}_name`) || storedName, // Prefer specific if stored, else fallback
        instituteName: localStorage.getItem(`user_${usernameLogin}_instituteName`) || storedInstituteName, // Same as above
        // password: passwordLogin // Not needed in user state after login
      };
       // Store main identifiers for persistence across sessions
      localStorage.setItem('username', usernameLogin);
      localStorage.setItem('name', loggedInUser.name);
      localStorage.setItem('instituteName', loggedInUser.instituteName);

      // Store individual user attributes (simulating a DB record)
      localStorage.setItem(`user_${usernameLogin}_name`, loggedInUser.name);
      localStorage.setItem(`user_${usernameLogin}_instituteName`, loggedInUser.instituteName);


      setUser(loggedInUser);
      setLoading(false);
      router.push('/job-status');
      return true;
    }
    
    setUser(null); // Clear user if login fails
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('instituteName');
    // For a more complete mock logout, you might also remove the user-specific password
    // e.g. if(user) localStorage.removeItem(`user_${user.username}_password`);
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
