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



  const loginWithWallet = (chain, address, customLabel) => {
    const isEth = chain.toUpperCase() === 'ETH';
    const shortAddr = address.length > 10 
      ? `${address.slice(0, 6)}...${address.slice(-4)}` 
      : address;
    const walletUser = {
      id: `usr-w3-${chain.toLowerCase()}-${address.toLowerCase()}`,
      name: customLabel || shortAddr,
      email: `${shortAddr.replace(/\.\.\./g, '_')}@${chain.toLowerCase()}.wallet`,
      provider: 'wallet',
      walletChain: isEth ? 'ETH' : 'SOL',
      walletAddress: address,
      isDemo: false
    };
    setUser(walletUser);
    return { success: true, user: walletUser };
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
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      switchToDemo,
      loginWithWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
