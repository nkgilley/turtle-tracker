import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, CheckCircle2, Shield, Wallet, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TurtleLogo } from './TurtleLogo';

export function AuthModal({ isOpen, onClose }) {
  const [activeView, setActiveView] = useState('main'); // 'main', 'google', 'wallet-eth', 'wallet-sol', 'email'
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleEmail, setGoogleEmail] = useState('user@turtletrack.com');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const { login, signup, switchToDemo, loginWithGoogle, loginWithWallet } = useAuth();

  if (!isOpen) return null;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp) {
      signup(name, email, password);
    } else {
      login(email, password);
    }
    onClose();
  };

  const handleGoogleLogin = (specificEmail) => {
    const targetEmail = specificEmail || googleEmail || 'user@turtletrack.com';
    loginWithGoogle(targetEmail);
    onClose();
  };

  // Ethereum Web3 connection (MetaMask, Rabby, Coinbase Wallet) or manual address
  const handleConnectEthereum = async () => {
    setError('');
    setIsConnecting(true);

    if (walletAddress.trim()) {
      const clean = walletAddress.trim();
      if (!clean.startsWith('0x') || clean.length < 10) {
        setError('Please enter a valid 0x Ethereum address.');
        setIsConnecting(false);
        return;
      }
      loginWithWallet('ETH', clean);
      setIsConnecting(false);
      onClose();
      return;
    }

    // Try browser extension (window.ethereum)
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          loginWithWallet('ETH', accounts[0]);
          setIsConnecting(false);
          onClose();
          return;
        }
      } catch (err) {
        setError(err.message || 'Web3 connection was rejected.');
        setIsConnecting(false);
        return;
      }
    }

    // If extension not present, switch to manual entry view
    setActiveView('wallet-eth');
    setIsConnecting(false);
  };

  // Solana Web3 connection (Phantom, Solflare) or manual address
  const handleConnectSolana = async () => {
    setError('');
    setIsConnecting(true);

    if (walletAddress.trim()) {
      const clean = walletAddress.trim();
      if (clean.length < 32 || clean.length > 44) {
        setError('Please enter a valid base58 Solana address.');
        setIsConnecting(false);
        return;
      }
      loginWithWallet('SOL', clean);
      setIsConnecting(false);
      onClose();
      return;
    }

    // Try browser extension (window.solana or window.phantom)
    const solProvider = window.solana || window.phantom?.solana;
    if (typeof window !== 'undefined' && solProvider) {
      try {
        const resp = await solProvider.connect();
        const pubKey = resp.publicKey ? resp.publicKey.toString() : null;
        if (pubKey) {
          loginWithWallet('SOL', pubKey);
          setIsConnecting(false);
          onClose();
          return;
        }
      } catch (err) {
        setError(err.message || 'Solana wallet connection was rejected.');
        setIsConnecting(false);
        return;
      }
    }

    // If extension not present, switch to manual entry view
    setActiveView('wallet-sol');
    setIsConnecting(false);
  };

  const handleDemoClick = () => {
    switchToDemo();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <TurtleLogo size={22} />
            <h2 className="modal-title">
              {activeView === 'google' 
                ? 'Sign in with Google' 
                : activeView === 'wallet-eth' 
                  ? 'Connect Ethereum Wallet' 
                  : activeView === 'wallet-sol' 
                    ? 'Connect Solana Wallet' 
                    : activeView === 'email' 
                      ? (isSignUp ? 'Create TurtleTrack Account' : 'Email Sign In')
                      : 'Sign In to TurtleTrack'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body auth-body">
          {error && <div className="form-error-msg">{error}</div>}

          {/* VIEW 1: Main Auth Choice (Google, Crypto Wallets, Email) */}
          {activeView === 'main' && (
            <div className="auth-flow-main">
              <p className="auth-subtitle">
                Connect your sovereign vault. 100% free, non-custodial multi-chain telemetry.
              </p>

              {/* 1. Google / Gmail 1-Click Login */}
              <button 
                type="button" 
                className="btn-google-auth" 
                onClick={() => handleGoogleLogin('user@turtletrack.com')}
                title="Sign in with your Google account"
              >
                <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google / Gmail</span>
              </button>

              <div className="auth-sub-link-row">
                <button 
                  type="button" 
                  className="sub-text-btn" 
                  onClick={() => { setError(''); setActiveView('google'); }}
                >
                  Use a different Gmail address →
                </button>
              </div>

              {/* 2. Crypto Wallet Login Options (ETH & SOL) */}
              <div className="auth-section-label">
                <span>OR SIGN IN WITH WEB3 WALLET</span>
              </div>

              <div className="wallet-auth-grid">
                <button 
                  type="button" 
                  className="btn-wallet-auth eth" 
                  onClick={handleConnectEthereum}
                  disabled={isConnecting}
                >
                  <span className="wallet-btn-icon">Ξ</span>
                  <div className="wallet-btn-content">
                    <span className="wallet-btn-title">Ethereum / EVM</span>
                    <span className="wallet-btn-hint">MetaMask, Rabby, Rainbow</span>
                  </div>
                </button>

                <button 
                  type="button" 
                  className="btn-wallet-auth sol" 
                  onClick={handleConnectSolana}
                  disabled={isConnecting}
                >
                  <span className="wallet-btn-icon">◎</span>
                  <div className="wallet-btn-content">
                    <span className="wallet-btn-title">Solana Wallet</span>
                    <span className="wallet-btn-hint">Phantom, Solflare</span>
                  </div>
                </button>
              </div>

              {/* 3. Email & Password & Demo */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              <button 
                type="button" 
                className="btn-secondary full-width auth-alt-btn"
                onClick={() => { setError(''); setActiveView('email'); }}
              >
                <Mail size={15} />
                <span>Continue with Email &amp; Password</span>
              </button>

              <button type="button" className="btn-secondary full-width demo-btn" onClick={handleDemoClick}>
                <Sparkles size={15} className="cyan-text" />
                <span>Continue as VIP Demo User</span>
              </button>
            </div>
          )}

          {/* VIEW 2: Google / Custom Gmail Input */}
          {activeView === 'google' && (
            <div className="auth-flow-sub">
              <p className="auth-subtitle">Sign in with any Gmail address:</p>
              
              <div className="form-group">
                <label className="form-label">Gmail Address</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="form-input"
                    autoFocus
                  />
                </div>
              </div>

              <div className="quick-fill-row">
                <span className="quick-fill-label">Quick select:</span>
                <button 
                  type="button" 
                  className="quick-pill" 
                  onClick={() => setGoogleEmail('user@turtletrack.com')}
                >
                  user@turtletrack.com
                </button>
              </div>

              <button 
                type="button" 
                className="btn-primary full-width"
                onClick={() => handleGoogleLogin(googleEmail)}
              >
                Sign In with Gmail
              </button>

              <button 
                type="button" 
                className="btn-secondary full-width auth-back-btn" 
                onClick={() => { setError(''); setActiveView('main'); }}
              >
                ← Back to All Options
              </button>
            </div>
          )}

          {/* VIEW 3: Ethereum Wallet Input (if extension rejected or not detected) */}
          {activeView === 'wallet-eth' && (
            <div className="auth-flow-sub">
              <p className="auth-subtitle">
                Enter your Ethereum / ENS address to sign in and auto-track all L1 and L2 assets:
              </p>

              <div className="form-group">
                <label className="form-label">Ethereum Address or ENS</label>
                <div className="input-with-icon">
                  <span className="input-custom-symbol">Ξ</span>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => { setWalletAddress(e.target.value); setError(''); }}
                    placeholder="0x... or vitalik.eth"
                    className="form-input font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div className="quick-fill-row">
                <span className="quick-fill-label">Quick fill:</span>
                <button 
                  type="button" 
                  className="quick-pill" 
                  onClick={() => setWalletAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}
                >
                  0xd8dA...6045 (My ETH Wallet)
                </button>
              </div>

              <button 
                type="button" 
                className="btn-primary full-width"
                onClick={handleConnectEthereum}
                disabled={isConnecting}
              >
                Sign In with Ethereum
              </button>

              <button 
                type="button" 
                className="btn-secondary full-width auth-back-btn" 
                onClick={() => { setError(''); setActiveView('main'); setWalletAddress(''); }}
              >
                ← Back to All Options
              </button>
            </div>
          )}

          {/* VIEW 4: Solana Wallet Input (if extension rejected or not detected) */}
          {activeView === 'wallet-sol' && (
            <div className="auth-flow-sub">
              <p className="auth-subtitle">
                Enter your Solana base58 address to sign in and auto-track SOL and SPL tokens:
              </p>

              <div className="form-group">
                <label className="form-label">Solana Wallet Address</label>
                <div className="input-with-icon">
                  <span className="input-custom-symbol">◎</span>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => { setWalletAddress(e.target.value); setError(''); }}
                    placeholder="Solana address (base58)"
                    className="form-input font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div className="quick-fill-row">
                <span className="quick-fill-label">Quick fill:</span>
                <button 
                  type="button" 
                  className="quick-pill" 
                  onClick={() => setWalletAddress('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK')}
                >
                  DYw8...NSKK (My SOL Wallet)
                </button>
              </div>

              <button 
                type="button" 
                className="btn-primary full-width"
                onClick={handleConnectSolana}
                disabled={isConnecting}
              >
                Sign In with Solana
              </button>

              <button 
                type="button" 
                className="btn-secondary full-width auth-back-btn" 
                onClick={() => { setError(''); setActiveView('main'); setWalletAddress(''); }}
              >
                ← Back to All Options
              </button>
            </div>
          )}

          {/* VIEW 5: Traditional Email & Password Form */}
          {activeView === 'email' && (
            <div className="auth-flow-sub">
              <form onSubmit={handleEmailSubmit} className="auth-form">
                {isSignUp && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-with-icon">
                      <User size={16} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Satoshi Nakamoto"
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="name@domain.com"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="••••••••••••"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary full-width">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="auth-toggle-row">
                <span>{isSignUp ? 'Already have an account?' : "Don't have an account yet?"}</span>
                <button
                  type="button"
                  className="toggle-link"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up Free'}
                </button>
              </div>

              <button 
                type="button" 
                className="btn-secondary full-width auth-back-btn" 
                onClick={() => { setError(''); setActiveView('main'); }}
              >
                ← Back to All Options
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

