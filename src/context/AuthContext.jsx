import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'aura_crypto_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default new account: starts fresh with isDemo: false
    return {
      id: 'usr-main-account',
      name: 'Portfolio Owner',
      email: 'owner@portfolio.vault',
      isDemo: false
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (email, password) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      isDemo: false
    };
    setUser(newUser);
    return { success: true };
  };

  const signup = (name, email, password) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      isDemo: false
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchToDemo = () => {
    const demoUser = {
      id: 'usr-vip-001',
      name: 'Alex Sterling',
      email: 'alex.sterling@aura-vault.eth',
      isDemo: true
    };
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, switchToDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
