import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TurtleLogo } from './TurtleLogo';

export function AuthModal({ isOpen, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup, switchToDemo } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
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
            <h2 className="modal-title">{isSignUp ? 'Create TurtleTrack Account' : 'Sign In to TurtleTrack'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body auth-body">
          <p className="auth-subtitle">
            {isSignUp 
              ? 'Slow, steady, sovereign wealth tracking across Bitcoin, Ethereum, Solana, and Hyperliquid.' 
              : 'Welcome back to your sovereign shell vault.'}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
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

            {error && <div className="form-error-msg">{error}</div>}

            <button type="submit" className="btn-primary full-width">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button type="button" className="btn-secondary full-width demo-btn" onClick={handleDemoClick}>
            <Sparkles size={16} className="cyan-text" />
            <span>Continue as VIP Demo User</span>
          </button>

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
        </div>
      </div>
    </div>
  );
}
