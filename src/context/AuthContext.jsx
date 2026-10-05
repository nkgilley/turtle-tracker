import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextBase';

const STORAGE_USER_KEY = 'turtletrack_crypto_user';
const STORAGE_TOKEN_KEY = 'turtletrack_auth_token';
const LEGACY_USER_KEY = 'aura_crypto_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      // ONLY restore user if there is an active authenticated token
      if (savedToken) {
        const saved = localStorage.getItem(STORAGE_USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && !parsed.isDemo && parsed.id) {
            return parsed;
          }
        }
      }
    } catch {
      // ignore
    }
    // Clean up stale mock/demo keys
    try {
      localStorage.removeItem(LEGACY_USER_KEY);
      localStorage.removeItem('turtletrack_wallets_fresh_guest');
      localStorage.removeItem('aura_wallets_fresh_guest');
    } catch {}
    return null;
  });

  const [serverWallets, setServerWallets] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(() => {
    try {
      return !!localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return false;
    }
  });

  // Sync session state to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } catch {}
    } else {
      try {
        localStorage.removeItem(STORAGE_USER_KEY);
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
      } catch {}
    } else {
      try {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
      } catch {}
    }
  }, [token]);

  // On mount, validate token and restore session + server wallets across devices
  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Token expired or invalid
            if (isMounted) {
              setToken(null);
            }
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && isMounted) {
          if (data.user) setUser(data.user);
          if (data.wallets) setServerWallets(data.wallets);
        }
      })
      .catch((err) => {
        console.warn('Failed to verify session with server:', err);
      })
      .finally(() => {
        if (isMounted) setIsAuthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Sign In with Email & Password
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid email or password.' };
      }

      setToken(data.token);
      setUser(data.user);
      if (data.wallets) setServerWallets(data.wallets);
      return { success: true, user: data.user, wallets: data.wallets };
    } catch {
      // Local fallback if offline
      const newUser = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0],
        email,
        isDemo: false
      };
      setUser(newUser);
      return { success: true, user: newUser, wallets: [] };
    }
  };

  // Sign Up with Email, Name & Password
  const signup = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      setToken(data.token);
      setUser(data.user);
      setServerWallets([]);
      return { success: true, user: data.user, wallets: [] };
    } catch {
      // Local fallback if offline
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        isDemo: false
      };
      setUser(newUser);
      return { success: true, user: newUser, wallets: [] };
    }
  };

  // Web3 Wallet Login (MetaMask, Rabby, Phantom, manual 0x/base58)
  const loginWithWallet = async (chain, address, customLabel) => {
    try {
      const res = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain, address, customLabel })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Wallet login failed');
      }

      setToken(data.token);
      setUser(data.user);
      if (data.wallets) setServerWallets(data.wallets);
      return { success: true, user: data.user, wallets: data.wallets };
    } catch {
      // Local fallback if server unreachable
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
    }
  };

  // Log Out
  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {}
    }
    setToken(null);
    setUser(null);
    setServerWallets(null);
  };

  // Switch to Demo
  const switchToDemo = () => {
    setToken(null);
    const demoUser = {
      id: 'usr-vip-001',
      name: 'Alex Sterling',
      email: 'alex.sterling@aura-vault.eth',
      isDemo: true
    };
    setUser(demoUser);
    setServerWallets(null);
  };

  // Persist Wallets to Server SQLite Database
  const syncWalletsToServer = useCallback(async (walletsToSync) => {
    if (!token || user?.isDemo) return;
    try {
      await fetch('/api/wallets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ wallets: walletsToSync })
      });
    } catch (err) {
      console.warn('Failed to sync wallets with server database:', err);
    }
  }, [token, user?.isDemo]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isAuthenticated: !!user, 
      isAuthLoading,
      serverWallets,
      login, 
      signup, 
      logout, 
      switchToDemo,
      loginWithWallet,
      syncWalletsToServer
    }}>
      {children}
    </AuthContext.Provider>
  );
}

