import React, { useState, useEffect } from 'react';
import { X, Plus, Wallet, Copy, Check, Trash2, ExternalLink, AlertCircle, Sparkles, CheckCircle2, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../data/mockData';
import { validateCryptoAddress, detectChainFromAddress, fetchLiveWalletAssets } from '../services/cryptoService';

export function WalletManagerModal({ 
  isOpen, 
  onClose, 
  wallets, 
  onAddWallet, 
  onDeleteWallet, 
  onResetDemo, 
  initialChain = 'ETH' 
}) {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'wallets'
  const [connectionType, setConnectionType] = useState(initialChain === 'COINBASE' ? 'coinbase' : 'web3');
  const [chain, setChain] = useState(initialChain === 'COINBASE' ? 'BTC' : initialChain);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [coinbaseKeyName, setCoinbaseKeyName] = useState('');
  const [coinbasePrivateKey, setCoinbasePrivateKey] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
      if (initialChain === 'COINBASE') {
        setConnectionType('coinbase');
        setActiveTab('add');
      } else if (initialChain) {
        setConnectionType('web3');
        setChain(initialChain);
        setActiveTab('add');
      }
    }
  }, [isOpen, initialChain]);

  if (!isOpen) return null;

  const handleAddressChange = (val) => {
    setAddress(val);
    setError('');
    const clean = val.trim();
    if (clean.startsWith('0x')) {
      if (chain !== 'HL' && chain !== 'ETH') {
        setChain('ETH');
      }
    } else {
      const detected = detectChainFromAddress(clean);
      if (detected && detected !== chain && detected !== 'COINBASE') {
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
    setError('');
    setSuccessMsg('');

    const targetChain = connectionType === 'coinbase' ? 'COINBASE' : chain;
    const targetAddress = connectionType === 'coinbase' ? coinbaseKeyName.trim() : address.trim();

    if (connectionType === 'coinbase') {
      if (!coinbaseKeyName.trim()) {
        setError('Please enter your Coinbase Key Name (e.g. organizations/.../apiKeys/...)');
        return;
      }
      if (!coinbasePrivateKey.trim()) {
        setError('Please enter your Coinbase Private Key (Ed25519 Base64 or EC PEM format).');
        return;
      }
    } else {
      const validation = validateCryptoAddress(targetChain, targetAddress);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    // Check if duplicate
    const exists = wallets.some(
      w => w.chain === targetChain && w.address.toLowerCase() === targetAddress.toLowerCase()
    );
    if (exists) {
      setError(`This connection is already added to your ${targetChain} vault.`);
      return;
    }

    setIsLoading(true);
    try {
      const assets = await fetchLiveWalletAssets(
        targetChain, 
        targetAddress, 
        connectionType === 'coinbase' ? coinbasePrivateKey.trim() : null
      );

      const chainObj = SUPPORTED_CHAINS.find(c => c.id === targetChain);
      const newWallet = {
        id: `w-${targetChain.toLowerCase()}-${Date.now()}`,
        label: label.trim() || (connectionType === 'coinbase' ? 'Coinbase Account' : `${chainObj?.name || targetChain} Vault`),
        chain: targetChain,
        address: targetAddress,
        privateKey: connectionType === 'coinbase' ? coinbasePrivateKey.trim() : undefined,
        color: chainObj?.color || (connectionType === 'coinbase' ? '#0052FF' : '#15803d'),
        createdAt: new Date().toISOString().split('T')[0],
        isPrimary: false,
        assets: assets
      };

      onAddWallet(newWallet);
      setAddress('');
      setCoinbaseKeyName('');
      setCoinbasePrivateKey('');
      setLabel('');
      
      const count = assets.length;
      setSuccessMsg(`Successfully synced ${count} live asset${count === 1 ? '' : 's'} from ${connectionType === 'coinbase' ? 'Coinbase API' : targetChain}!`);
      
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('wallets');
      }, 1800);
    } catch (err) {
      console.error('Wallet add error:', err);
      setError(err.message || 'Failed to fetch balances from API. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const web3Chains = SUPPORTED_CHAINS.filter(c => c.id !== 'COINBASE');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container retro-window" onClick={(e) => e.stopPropagation()}>
        {/* Retro Window Titlebar */}
        <div className="modal-header retro-window-header">
          <div className="modal-title-wrap">
            <span className="retro-window-icon">🐢</span>
            <h2 className="modal-title">TurtleTrack Shell Vault Manager</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Retro Folder Tabs */}
        <div className="vault-tabs-bar">
          <button 
            type="button" 
            className={`vault-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => { setActiveTab('add'); setError(''); }}
          >
            <Plus size={15} />
            <span>Add Connection</span>
          </button>
          <button 
            type="button" 
            className={`vault-tab-btn ${activeTab === 'wallets' ? 'active' : ''}`}
            onClick={() => { setActiveTab('wallets'); setError(''); }}
          >
            <Wallet size={15} />
            <span>Tracked Vaults ({wallets.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body vault-modal-body">
          {activeTab === 'add' ? (
            <div className="vault-add-tab">
              {/* Type Switcher: Web3 On-Chain vs Coinbase API */}
              <div className="connection-type-switch">
                <button
                  type="button"
                  className={`type-switch-btn ${connectionType === 'web3' ? 'active' : ''}`}
                  onClick={() => { setConnectionType('web3'); setError(''); }}
                >
                  <Wallet size={16} />
                  <div className="type-btn-text">
                    <span className="type-btn-title">Web3 On-Chain Address</span>
                    <span className="type-btn-sub">BTC, Ethereum, Solana, Hyperliquid</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`type-switch-btn ${connectionType === 'coinbase' ? 'active' : ''}`}
                  onClick={() => { setConnectionType('coinbase'); setError(''); }}
                >
                  <KeyRound size={16} style={{ color: '#0052FF' }} />
                  <div className="type-btn-text">
                    <span className="type-btn-title">Coinbase Cloud (CDP) API</span>
                    <span className="type-btn-sub">Live Read-Only Balances &amp; Staking</span>
                  </div>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="wallet-form">
                {connectionType === 'web3' ? (
                  <>
                    {/* Chain Selection Grid */}
                    <div className="form-group">
                      <label className="form-label">Target Network / Ecosystem</label>
                      <div className="chain-selector-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {web3Chains.map(c => (
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

                    {/* Address Input */}
                    <div className="form-group">
                      <label className="form-label">
                        {chain === 'BTC' && 'Bitcoin Address (Taproot, SegWit, Babylon)'}
                        {chain === 'ETH' && 'Ethereum Address (0x... EVM)'}
                        {chain === 'SOL' && 'Solana Address (Base58 Public Key)'}
                        {chain === 'HL' && 'Hyperliquid Address (0x... EVM)'}
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        placeholder={
                          chain === 'BTC' ? 'e.g. bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' :
                          chain === 'SOL' ? 'e.g. DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK' :
                          'e.g. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
                        }
                        className={`form-input font-mono ${error ? 'input-error' : ''}`}
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Coinbase CDP Guidance Banner */}
                    <div className="coinbase-info-panel">
                      <div className="info-panel-header">
                        <ShieldCheck size={18} className="shield-icon" />
                        <span className="info-panel-title">Coinbase Cloud (CDP) API Key Configuration</span>
                      </div>
                      <p className="info-panel-desc">
                        TurtleTrack streams your real balances directly from Coinbase Advanced Trade / Brokerage.
                        <br />
                        • <strong>Supported Keys:</strong> Ed25519 64-byte base64 strings and ECDSA (ES256) PEM blocks.
                        <br />
                        • <strong>Security:</strong> Read-only access; credentials are kept exclusively in browser memory.
                      </p>
                    </div>

                    {/* Coinbase Key Name */}
                    <div className="form-group">
                      <div className="field-label-row">
                        <label className="form-label">Coinbase Key Name (API Key ID)</label>
                        <span className="field-hint-tag">CDP Resource Format</span>
                      </div>
                      <input
                        type="text"
                        value={coinbaseKeyName}
                        onChange={(e) => { setCoinbaseKeyName(e.target.value); setError(''); }}
                        placeholder="organizations/{org_id}/apiKeys/{key_id}"
                        className={`form-input font-mono ${error ? 'input-error' : ''}`}
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>

                    {/* Coinbase Private Key */}
                    <div className="form-group">
                      <div className="field-label-row">
                        <label className="form-label">Private Key Secret</label>
                        <span className="field-hint-tag">Ed25519 Base64 or EC PEM</span>
                      </div>
                      <textarea
                        rows={3}
                        value={coinbasePrivateKey}
                        onChange={(e) => { setCoinbasePrivateKey(e.target.value); setError(''); }}
                        placeholder="a4Zzx2FAH1mw... or -----BEGIN EC PRIVATE KEY-----"
                        className={`form-input font-mono form-textarea ${error ? 'input-error' : ''}`}
                        disabled={isLoading}
                      />
                      <span className="field-caption">
                        Never stored on external servers. Signed locally via CDP SDK for cryptographic authentication.
                      </span>
                    </div>
                  </>
                )}

                {/* Optional Custom Label */}
                <div className="form-group">
                  <label className="form-label">Vault Label (Optional)</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={connectionType === 'coinbase' ? "e.g. Nolan's Coinbase Main" : "e.g. Ledger Cold Storage, Babylon Staker"}
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="error-banner">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <div className="success-banner">
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button 
                  type="submit" 
                  className="btn-primary retro-submit-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="spinning" />
                      <span>Verifying &amp; Fetching Balances from API...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Connect &amp; Sync Vault</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Tracked Wallets Tab */
            <div className="vault-list-tab">
              <div className="list-top-bar">
                <div className="list-stat-badge">
                  <span>Currently Tracking: <strong>{wallets.length} Connection{wallets.length === 1 ? '' : 's'}</strong></span>
                </div>
                <button 
                  type="button" 
                  className="btn-reset-demo" 
                  onClick={onResetDemo}
                  title="Restore default test demo wallets"
                >
                  <Sparkles size={13} />
                  <span>Reset Demo Wallets</span>
                </button>
              </div>

              <div className="wallets-scroll-cards">
                {wallets.length === 0 ? (
                  <div className="empty-vault-card">
                    <Wallet size={36} className="empty-icon" />
                    <h4>No Wallets Connected</h4>
                    <p>Add a Web3 public address or connect your Coinbase API key to stream your balances.</p>
                    <button 
                      type="button" 
                      className="btn-primary empty-action-btn"
                      onClick={() => setActiveTab('add')}
                    >
                      <Plus size={15} />
                      <span>Add First Connection</span>
                    </button>
                  </div>
                ) : (
                  wallets.map(w => {
                    const chainObj = SUPPORTED_CHAINS.find(c => c.id === w.chain);
                    const isCopied = copiedId === w.id;
                    const isCoinbase = w.chain === 'COINBASE';
                    const assetCount = (w.assets || []).length;

                    return (
                      <div key={w.id} className="vault-item-card">
                        <div className="vault-item-left">
                          <div 
                            className="vault-item-badge" 
                            style={{ 
                              backgroundColor: `${w.color}15`, 
                              borderColor: `${w.color}50`,
                              color: w.color 
                            }}
                          >
                            <span>{chainObj?.icon || '•'}</span>
                          </div>

                          <div className="vault-item-info">
                            <div className="vault-item-heading">
                              <span className="vault-item-label">{w.label}</span>
                              <span 
                                className="vault-chain-pill" 
                                style={{ backgroundColor: `${w.color}20`, color: w.color, borderColor: `${w.color}40` }}
                              >
                                {isCoinbase ? 'Coinbase Cloud' : chainObj?.name || w.chain}
                              </span>
                            </div>

                            <div className="vault-item-sub">
                              <span className="vault-address font-mono" title={w.address}>
                                {isCoinbase 
                                  ? (w.address.length > 38 ? `${w.address.substring(0, 22)}...${w.address.substring(w.address.length - 12)}` : w.address)
                                  : (w.address.length > 20 ? `${w.address.substring(0, 10)}...${w.address.substring(w.address.length - 8)}` : w.address)
                                }
                              </span>
                              <span className="vault-asset-count">
                                {assetCount} asset{assetCount === 1 ? '' : 's'} synced
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="vault-item-actions">
                          <button
                            type="button"
                            className="btn-vault-action"
                            onClick={() => handleCopy(w.id, w.address)}
                            title="Copy Identifier"
                          >
                            {isCopied ? <Check size={14} className="green-text" /> : <Copy size={14} />}
                          </button>

                          {!isCoinbase && chainObj?.explorer && (
                            <a
                              href={`${chainObj.explorer}${w.address}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-vault-action"
                              title="View on Explorer"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}

                          <button
                            type="button"
                            className="btn-vault-action danger"
                            onClick={() => onDeleteWallet(w.id)}
                            title="Disconnect Wallet"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {wallets.length > 0 && (
                <div className="list-footer-bar">
                  <button 
                    type="button" 
                    className="btn-outline-vault"
                    onClick={() => setActiveTab('add')}
                  >
                    <Plus size={14} />
                    <span>Add Another Connection</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
