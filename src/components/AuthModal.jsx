import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, CheckCircle2, Shield, Wallet, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TurtleLogo } from './TurtleLogo';

export function AuthModal({ isOpen, onClose }) {
  const [activeView, setActiveView] = useState('main'); // 'main', 'wallet-eth', 'wallet-sol', 'email'
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const { login, signup, switchToDemo, loginWithWallet } = useAuth();

  if (!isOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      if (isSignUp) {
        const res = await signup(name, email, password);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
          setIsConnecting(false);
          return;
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
          setIsConnecting(false);
          return;
        }
      }
      setIsConnecting(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error.');
      setIsConnecting(false);
    }
  };

  // Ethereum extension connection (MetaMask, Rabby, Coinbase Wallet)
  const handleConnectEthereumExtension = async () => {
    setError('');
    setIsConnecting(true);
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          await loginWithWallet('ETH', accounts[0]);
          setIsConnecting(false);
          onClose();
          return;
        }
      } catch (err) {
        setError(err.message || 'Web3 connection was rejected.');
        setIsConnecting(false);
        return;
      }
    } else {
      setError('No Ethereum extension detected. Please enter your address below.');
    }
    setIsConnecting(false);
  };

  // Ethereum manual address or quick-fill connection
  const handleConnectEthereumAddress = async (addrToUse) => {
    setError('');
    const target = (addrToUse || walletAddress).trim();
    if (!target.startsWith('0x') || target.length < 10) {
      setError('Please enter a valid 0x Ethereum address.');
      return;
    }
    setIsConnecting(true);
    try {
      await loginWithWallet('ETH', target);
      setIsConnecting(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to authenticate wallet address.');
      setIsConnecting(false);
    }
  };

  // Solana extension connection (Phantom, Solflare)
  const handleConnectSolanaExtension = async () => {
    setError('');
    setIsConnecting(true);
    const solProvider = typeof window !== 'undefined' ? (window.solana || window.phantom?.solana) : null;
    if (solProvider) {
      try {
        const resp = await solProvider.connect();
        const pubKey = resp.publicKey ? resp.publicKey.toString() : null;
        if (pubKey) {
          await loginWithWallet('SOL', pubKey);
          setIsConnecting(false);
          onClose();
          return;
        }
      } catch (err) {
        setError(err.message || 'Solana wallet connection was rejected.');
        setIsConnecting(false);
        return;
      }
    } else {
      setError('No Solana extension detected. Please enter your address below.');
    }
    setIsConnecting(false);
  };

  // Solana manual address or quick-fill connection
  const handleConnectSolanaAddress = async (addrToUse) => {
    setError('');
    const target = (addrToUse || walletAddress).trim();
    if (target.length < 32 || target.length > 44) {
      setError('Please enter a valid base58 Solana address.');
      return;
    }
    setIsConnecting(true);
    try {
      await loginWithWallet('SOL', target);
      setIsConnecting(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to authenticate Solana address.');
      setIsConnecting(false);
    }
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
              {activeView === 'wallet-eth' 
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

          {/* VIEW 1: Main Auth Choice (Crypto Wallets, Email) */}
          {activeView === 'main' && (
            <div className="auth-flow-main">
              <p className="auth-subtitle">
                Connect your sovereign vault. 100% free, non-custodial multi-chain telemetry.
              </p>

              {/* 1. Crypto Wallet Login Options (ETH & SOL) */}
              <div className="wallet-auth-grid">
                <button 
                  type="button" 
                  className="btn-wallet-auth eth" 
                  onClick={() => { setError(''); setActiveView('wallet-eth'); }}
                >
                  <span className="wallet-btn-icon">Ξ</span>
                  <div className="wallet-btn-content">
                    <span className="wallet-btn-title">Ethereum / EVM</span>
                    <span className="wallet-btn-hint">Auto-tracks ETH, L2s &amp; Hyperliquid</span>
                  </div>
                </button>

                <button 
                  type="button" 
                  className="btn-wallet-auth sol" 
                  onClick={() => { setError(''); setActiveView('wallet-sol'); }}
                >
                  <span className="wallet-btn-icon">◎</span>
                  <div className="wallet-btn-content">
                    <span className="wallet-btn-title">Solana Wallet</span>
                    <span className="wallet-btn-hint">Phantom, Solflare</span>
                  </div>
                </button>
              </div>

              {/* 2. Email & Password & Demo */}
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

          {/* VIEW 3: Ethereum Wallet Input (if extension rejected or not detected) */}
          {activeView === 'wallet-eth' && (
            <div className="auth-flow-sub">
              <p className="auth-subtitle">
                Connect your Ethereum wallet. Automatically tracks Ethereum, all L2s (Arbitrum, Base, OP, Polygon, AVAX), and Hyperliquid:
              </p>

              {typeof window !== 'undefined' && window.ethereum && (
                <>
                  <button 
                    type="button" 
                    className="btn-wallet-auth eth full-width"
                    onClick={handleConnectEthereumExtension}
                    disabled={isConnecting}
                  >
                    <span className="wallet-btn-icon">🦊</span>
                    <div className="wallet-btn-content">
                      <span className="wallet-btn-title">Connect Web3 Extension</span>
                      <span className="wallet-btn-hint">Rabby, MetaMask, Rainbow, Coinbase</span>
                    </div>
                  </button>

                  <div className="auth-divider">
                    <span>OR ENTER ADDRESS DIRECTLY</span>
                  </div>
                </>
              )}

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



              <button 
                type="button" 
                className="btn-primary full-width"
                onClick={() => handleConnectEthereumAddress()}
                disabled={isConnecting}
              >
                Sign In with Ethereum Address
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

          {/* VIEW 4: Solana Wallet Input */}
          {activeView === 'wallet-sol' && (
            <div className="auth-flow-sub">
              <p className="auth-subtitle">
                Connect your Solana wallet to track SOL and SPL tokens:
              </p>

              {typeof window !== 'undefined' && (window.solana || window.phantom?.solana) && (
                <>
                  <button 
                    type="button" 
                    className="btn-wallet-auth sol full-width"
                    onClick={handleConnectSolanaExtension}
                    disabled={isConnecting}
                  >
                    <span className="wallet-btn-icon">🟣</span>
                    <div className="wallet-btn-content">
                      <span className="wallet-btn-title">Connect Web3 Extension</span>
                      <span className="wallet-btn-hint">Phantom, Solflare</span>
                    </div>
                  </button>

                  <div className="auth-divider">
                    <span>OR ENTER ADDRESS DIRECTLY</span>
                  </div>
                </>
              )}

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



              <button 
                type="button" 
                className="btn-primary full-width"
                onClick={() => handleConnectSolanaAddress()}
                disabled={isConnecting}
              >
                Sign In with Solana Address
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

