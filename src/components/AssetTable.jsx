import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, ExternalLink, ArrowUpRight, ArrowDownRight, Coins, Lock } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../data/mockData';

export function AssetTable({ assets, activeChainFilter, onSelectChainFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showStakedOnly, setShowStakedOnly] = useState(false);

  // Filter assets
  const filteredAssets = assets.filter(item => {
    // Chain filter
    if (activeChainFilter !== 'ALL' && item.chain !== activeChainFilter) {
      return false;
    }
    // Staked filter
    if (showStakedOnly && !item.isStaked) {
      return false;
    }
    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchSymbol = item.symbol.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchWallet = item.walletLabel.toLowerCase().includes(q);
      const matchAddr = item.walletAddress.toLowerCase().includes(q);
      return matchSymbol || matchName || matchWallet || matchAddr;
    }
    return true;
  });

  const getExplorerUrl = (chain, address) => {
    const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chain);
    return chainInfo ? `${chainInfo.explorer}${address}` : '#';
  };

  const getChainBadgeColor = (chain) => {
    switch (chain) {
      case 'BTC': return { bg: '#F7931A18', text: '#F7931A', border: '#F7931A40' };
      case 'ETH': return { bg: '#627EEA18', text: '#627EEA', border: '#627EEA40' };
      case 'SOL': return { bg: '#14F19518', text: '#14F195', border: '#14F19540' };
      case 'HL': return { bg: '#20E5A318', text: '#20E5A3', border: '#20E5A340' };
      case 'COINBASE': return { bg: '#0052FF18', text: '#0052FF', border: '#0052FF40' };
      default: return { bg: '#ffffff10', text: '#ffffff', border: '#ffffff20' };
    }
  };

  return (
    <div className="asset-table-card">
      {/* Control bar: search, chain filter pills, staked toggle */}
      <div className="table-controls">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search token, symbol, or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>&times;</button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="filter-pills-row">
          <button
            className={`pill-btn ${activeChainFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => onSelectChainFilter('ALL')}
          >
            All Holdings
          </button>
          <button
            className={`pill-btn ${activeChainFilter === 'BTC' ? 'active' : ''}`}
            onClick={() => onSelectChainFilter('BTC')}
          >
            ₿ Bitcoin
          </button>
          <button
            className={`pill-btn ${activeChainFilter === 'ETH' ? 'active' : ''}`}
            onClick={() => onSelectChainFilter('ETH')}
          >
            Ξ Ethereum & ERC-20
          </button>
          <button
            className={`pill-btn ${activeChainFilter === 'SOL' ? 'active' : ''}`}
            onClick={() => onSelectChainFilter('SOL')}
          >
            ◎ Solana
          </button>
          <button
            className={`pill-btn ${activeChainFilter === 'HL' ? 'active' : ''}`}
            onClick={() => onSelectChainFilter('HL')}
          >
            ⚡ Hyperliquid
          </button>
          <button
            className={`pill-btn ${activeChainFilter === 'COINBASE' ? 'active' : ''}`}
            onClick={() => onSelectChainFilter('COINBASE')}
          >
            🔵 Coinbase
          </button>

          <button
            className={`pill-btn-toggle ${showStakedOnly ? 'active' : ''}`}
            onClick={() => setShowStakedOnly(!showStakedOnly)}
          >
            <ShieldCheck size={14} />
            <span>Staked Only</span>
          </button>
        </div>
      </div>

      {/* Asset Table */}
      <div className="table-responsive">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Holding Type</th>
              <th>Wallet</th>
              <th className="align-right">Price (24h)</th>
              <th className="align-right">Holdings</th>
              <th className="align-right">Total Value</th>
              <th className="align-right">Staking APY</th>
              <th className="align-center">Explorer</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-state">
                  <Coins size={36} className="empty-icon" />
                  <p>No matching assets found.</p>
                  <span>Try adjusting your filters or search terms.</span>
                </td>
              </tr>
            ) : (
              filteredAssets.map(item => {
                const chainStyle = getChainBadgeColor(item.chain);
                const isPos = item.change24h >= 0;

                return (
                  <tr key={item.id} className="asset-row">
                    {/* Asset Name & Chain */}
                    <td>
                      <div className="token-cell">
                        <div className="token-avatar" style={{ borderColor: chainStyle.text }}>
                          {item.symbol.substring(0, 3)}
                        </div>
                        <div className="token-info">
                          <div className="token-name-row">
                            <span className="token-symbol">{item.symbol}</span>
                            <span 
                              className="chain-tag" 
                              style={{ backgroundColor: chainStyle.bg, color: chainStyle.text, borderColor: chainStyle.border }}
                            >
                              {item.chain}
                            </span>
                          </div>
                          <span className="token-full-name">{item.name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Holding Type: Liquid vs Staked */}
                    <td>
                      {item.isStaked ? (
                        <div className="staked-badge">
                          <Lock size={12} />
                          <span>{item.protocol || 'Staked'}</span>
                        </div>
                      ) : (
                        <div className="liquid-badge">
                          <span>Liquid</span>
                        </div>
                      )}
                    </td>

                    {/* Wallet Label */}
                    <td>
                      <div className="wallet-cell">
                        <span className="wallet-label-text">{item.walletLabel}</span>
                        <span className="wallet-address-short">
                          {item.walletAddress.substring(0, 6)}...{item.walletAddress.substring(item.walletAddress.length - 4)}
                        </span>
                      </div>
                    </td>

                    {/* Price and 24h change */}
                    <td className="align-right">
                      <div className="price-cell">
                        <span className="token-price">
                          ${item.price >= 1 ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(6)}
                        </span>
                        <span className={`price-change ${isPos ? 'green' : 'red'}`}>
                          {isPos ? '+' : ''}{item.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* Holdings (Tokens) */}
                    <td className="align-right">
                      <div className="holdings-cell">
                        <span className="holdings-amt">
                          {item.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </span>
                        <span className="holdings-symbol">{item.symbol}</span>
                      </div>
                    </td>

                    {/* Total Value ($) */}
                    <td className="align-right">
                      <span className="fiat-value">
                        ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Staking APY */}
                    <td className="align-right">
                      {item.isStaked && item.apy ? (
                        <div className="yield-cell">
                          <span className="yield-apy">{item.apy.toFixed(1)}% APY</span>
                          {item.rewardsEarned > 0 && (
                            <span className="yield-rewards">
                              +{item.rewardsEarned.toLocaleString('en-US', { maximumFractionDigits: 3 })} {item.symbol} earned
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="yield-dash">&mdash;</span>
                      )}
                    </td>

                    {/* Action Explorer Link */}
                    <td className="align-center">
                      <a
                        href={getExplorerUrl(item.chain, item.walletAddress)}
                        target="_blank"
                        rel="noreferrer"
                        className="explorer-link-btn"
                        title="View on Block Explorer"
                        aria-label="View on Block Explorer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
