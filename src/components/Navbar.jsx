import React, { useState } from 'react';
import { Wallet, Plus, RefreshCw, User, LogOut, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TurtleLogo } from './TurtleLogo';

export function Navbar({ walletsCount, onOpenWalletModal, onOpenAuthModal, onRefresh, isRefreshing }) {
  const { user, isAuthenticated, logout, switchToDemo } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="brand-logo">
          <div className="brand-icon turtle-brand-icon">
            <TurtleLogo size={28} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">TURTLETRACK</span>
              <span className="brand-domain-pill">.IO</span>
            </div>
            <span className="brand-tag">SOVEREIGN WEALTH &bull; REEF TELEMETRY</span>
          </div>
        </div>

        {/* Live Network & Node Status Pills */}
        <div className="network-pills">
          <div className="pill-item">
            <span className="pulse-dot green"></span>
            <span className="pill-text">BTC &middot; ETH &middot; SOL &middot; HL</span>
          </div>
          <div className="pill-item hide-mobile">
            <span className="pill-muted">Sync:</span>
            <span className="pill-value">Real-Time</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          <button 
            className={`btn-icon ${isRefreshing ? 'spinning' : ''}`}
            onClick={onRefresh}
            title="Refresh All Balances"
            aria-label="Refresh Balances"
          >
            <RefreshCw size={17} />
          </button>

          <button 
            className="btn-secondary"
            onClick={onOpenWalletModal}
          >
            <Wallet size={16} />
            <span>Wallets</span>
            <span className="badge-count">{walletsCount}</span>
          </button>

          <button 
            className="btn-primary"
            onClick={onOpenWalletModal}
          >
            <Plus size={16} />
            <span className="hide-mobile">Add Wallet</span>
          </button>

          {/* User Profile / Auth Button */}
          <div className="user-menu-container">
            {isAuthenticated ? (
              <div className="user-profile-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-meta hide-mobile">
                  <span className="user-name">{user.name}</span>
                  <span className="user-tier">{user.tier}</span>
                </div>
              </div>
            ) : (
              <button className="btn-accent" onClick={onOpenAuthModal}>
                Sign In
              </button>
            )}

            {showUserMenu && isAuthenticated && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user.name}</p>
                  <p className="dropdown-email">{user.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                {user.isDemo ? (
                  <button 
                    className="dropdown-item" 
                    onClick={() => { setShowUserMenu(false); onOpenAuthModal(); }}
                  >
                    <User size={15} />
                    <span>Create Full Account</span>
                  </button>
                ) : (
                  <button 
                    className="dropdown-item" 
                    onClick={() => { switchToDemo(); setShowUserMenu(false); }}
                  >
                    <Sparkles size={15} />
                    <span>Load Demo Portfolio</span>
                  </button>
                )}
                <button 
                  className="dropdown-item danger" 
                  onClick={() => { logout(); setShowUserMenu(false); }}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
