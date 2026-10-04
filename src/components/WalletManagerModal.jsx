import React, { useState } from 'react';
import { X, Plus, Wallet, Copy, Check, Trash2, ExternalLink, AlertCircle, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../data/mockData';
import { validateCryptoAddress, detectChainFromAddress, fetchLiveWalletAssets } from '../services/cryptoService';

export function WalletManagerModal({ isOpen, onClose, wallets, onAddWallet, onDeleteWallet, onResetDemo, initialChain = 'ETH' }) {
  const [chain, setChain] = useState(initialChain);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coinbasePrivateKey, setCoinbasePrivateKey] = useState('');

  React.useEffect(() => {
    if (isOpen && initialChain) {
      setChain(initialChain);
    }
  }, [isOpen, initialChain]);

  if (!isOpen) return null;

  const handleAddressChange = (val) => {
    setAddress(val);
    setError('');
    const clean = val.trim();

    // If EVM address 0x..., keep HL if HL is already selected!
    if (clean.startsWith('0x')) {
      if (chain !== 'HL' && chain !== 'ETH') {
        setChain('ETH');
      }
    } else {
      const detected = detectChainFromAddress(clean);
      if (detected && detected !== chain) {
        setChain(detected);
      }
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanAddress = address.trim();
    const validation = validateCryptoAddress(chain, cleanAddress);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Check if address already exists on THIS specific chain
    const exists = wallets.some(
      w => w.chain === chain && w.address.toLowerCase() === cleanAddress.toLowerCase()
    );
    if (exists) {
      setError(`This address is already added to your ${chain} portfolio.`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch actual real-time on-chain assets and staking positions
      const assets = await fetchLiveWalletAssets(chain, cleanAddress);

      const chainObj = SUPPORTED_CHAINS.find(c => c.id === chain);
      const newWallet = {
        id: `w-${chain.toLowerCase()}-${Date.now()}`,
        label: label.trim() || `${chainObj?.name || chain} Wallet`,
        chain,
        address: cleanAddress,
        color: chainObj?.color || '#00F0FF',
        createdAt: new Date().toISOString().split('T')[0],
        isPrimary: false,
        assets: assets
      };

      onAddWallet(newWallet);
      setAddress('');
      setCoinbasePrivateKey('');
      setLabel('');
      setError('');

      const stakedCount = assets.filter(a => a.isStaked).length;
      setSuccessMsg(
        stakedCount > 0 
          ? `Verified! Found ${assets.length} assets including ${stakedCount} staking position(s).`
          : `Verified! Synced ${assets.length} asset(s) on-chain.`
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch on-chain balances. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFillPreset = (presetChain) => {
    setChain(presetChain);
    setError('');
    if (presetChain === 'BTC') {
      setAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
      setLabel('Bitcoin Taproot / Babylon');
    } else if (presetChain === 'ETH') {
      setAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      setLabel('Ethereum & Native Staked Validator');
    } else if (presetChain === 'SOL') {
      setAddress('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');
      setLabel('Solana & JitoSOL MEV Staking');
    } else if (presetChain === 'HL') {
      setAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
      setLabel('Hyperliquid HYPE Staking & Vault');
    } else if (presetChain === 'COINBASE') {
      setAddress('organizations/turtletrack/apiKeys/cb-key-01');
      setCoinbasePrivateKey('-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIGDemoKeyOnlyNotRealKeyForVerification123456789012345678\n-----END EC PRIVATE KEY-----');
      setLabel('Coinbase Vault & Staking');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Wallet size={20} className="green-text" />
            <h2 className="modal-title">Shell Vault &amp; Wallet Manager</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Add Wallet Form */}
          <div className="add-wallet-section">
            <h3 className="section-subtitle">Add Address to Shell Vault</h3>

            <form onSubmit={handleSubmit} className="wallet-form">
              {/* Chain Selector Buttons */}
              <div className="form-group">
                <label className="form-label">
                  Select Ecosystem {chain === 'HL' && <span className="cyan-text">(Uses EVM 0x... address)</span>}
                  {chain === 'COINBASE' && <span style={{ color: '#0052FF' }}>(Read-Only API / Exchange Tracking)</span>}
                </label>
                <div className="chain-selector-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  {SUPPORTED_CHAINS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`chain-select-btn ${chain === c.id ? 'active' : ''}`}
                      onClick={() => { setChain(c.id); setError(''); }}
                      style={{ '--c-color': c.color }}
                    >
                      <span className="c-icon">{c.icon}</span>
                      <span className="c-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Fill Buttons */}
              <div className="quick-fill-row">
                <span className="quick-fill-label">Quick autofill test:</span>
                {SUPPORTED_CHAINS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className="quick-fill-tag"
                    onClick={() => quickFillPreset(c.id)}
                  >
                    +{c.name}
                  </button>
                ))}
              </div>

              {/* Conditional Inputs: Web3 Address vs Coinbase API Keys */}
              {chain === 'COINBASE' ? (
                <>
                  <div className="coinbase-guide-box">
                    <span className="guide-title">🔵 Coinbase Cloud (CDP) API Key Guide</span>
                    <p className="guide-desc">
                      Coinbase issues two credentials for Advanced Trade / CDP:
                      <br />
                      &bull; <strong>Key Name</strong>: Your public identifier (e.g. <code>organizations/.../apiKeys/...</code>)
                      <br />
                      &bull; <strong>Private Key</strong>: The EC private key PEM block used to cryptographically sign read-only balance requests.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Coinbase Key Name</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder="organizations/{org_id}/apiKeys/{key_id}"
                      className={`form-input font-mono ${error ? 'input-error' : ''}`}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Coinbase Private Key (PEM format)</label>
                    <textarea
                      rows="3"
                      value={coinbasePrivateKey}
                      onChange={(e) => setCoinbasePrivateKey(e.target.value)}
                      placeholder="-----BEGIN EC PRIVATE KEY-----&#10;...&#10;-----END EC PRIVATE KEY-----"
                      className="form-input font-mono text-area-key"
                      disabled={isLoading}
                    />
                    <span className="field-hint">Never shared or transmitted to external servers. Stored only in local browser memory.</span>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Public Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder={`Enter ${chain} public address (e.g. ${chain === 'BTC' ? 'bc1q...' : chain === 'SOL' ? 'Base58...' : '0x...'})`}
                    className={`form-input font-mono ${error ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
              )}

              {error && (
                <div className="form-error-msg">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Label Input */}
              <div className="form-group">
                <label className="form-label">Custom Label (Optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={chain === 'COINBASE' ? 'e.g. Coinbase Main Account' : 'e.g. Ledger Cold Storage, Trading Phantom, Arbitrum Vault'}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              {successMsg && (
                <div className="form-success-msg">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <button type="submit" className="btn-primary full-width" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spinning" />
                    <span>Syncing Real On-Chain Balances...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Verify & Sync Wallet</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Current Wallets List */}
          <div className="wallets-list-section">
            <div className="list-section-header">
              <span className="section-subtitle">Tracked Wallets ({wallets.length})</span>
              <button 
                type="button" 
                className="btn-text-sparkle" 
                onClick={onResetDemo}
                title="Restore default test wallets"
              >
                <Sparkles size={14} />
                <span>Reset Demo Wallets</span>
              </button>
            </div>

            <div className="wallets-scroll-list">
              {wallets.length === 0 ? (
                <div className="empty-wallets-box">
                  <p>No wallets tracked yet. Add an address above to begin tracking.</p>
                </div>
              ) : (
                wallets.map(w => {
                  const chainObj = SUPPORTED_CHAINS.find(c => c.id === w.chain);
                  const isCopied = copiedId === w.id;

                  return (
                    <div key={w.id} className="wallet-card-item">
                      <div className="wallet-card-left">
                        <div 
                          className="wallet-chain-icon" 
                          style={{ backgroundColor: `${w.color}20`, color: w.color, borderColor: `${w.color}40` }}
                        >
                          {chainObj?.icon || '•'}
                        </div>
                        <div className="wallet-card-meta">
                          <div className="wallet-card-title-row">
                            <span className="wallet-card-name">{w.label}</span>
                            <span className="wallet-card-chain-badge" style={{ color: w.color }}>{w.chain}</span>
                          </div>
                          <span className="wallet-card-address font-mono">
                            {w.address.substring(0, 10)}...{w.address.substring(w.address.length - 8)}
                          </span>
                        </div>
                      </div>

                      <div className="wallet-card-actions">
                        <button
                          type="button"
                          className="btn-icon-subtle"
                          onClick={() => handleCopy(w.id, w.address)}
                          title="Copy Full Address"
                          aria-label="Copy Address"
                        >
                          {isCopied ? <Check size={14} className="green-text" /> : <Copy size={14} />}
                        </button>
                        <a
                          href={chainObj ? `${chainObj.explorer}${w.address}` : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-icon-subtle"
                          title="View on Explorer"
                          aria-label="View on Explorer"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          className="btn-icon-subtle danger"
                          onClick={() => onDeleteWallet(w.id)}
                          title="Remove Wallet"
                          aria-label="Remove Wallet"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
