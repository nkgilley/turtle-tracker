import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, ExternalLink, ArrowUpRight, ArrowDownRight, Coins, Lock } from 'lucide-react';
import { SUPPORTED_CHAINS } from '../data/mockData';

export function AssetTable({ assets, activeChainFilter, onSelectChainFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showStakedOnly, setShowStakedOnly] = useState(false);
  const [hideSmallBalances, setHideSmallBalances] = useState(() => {
    try {
      return localStorage.getItem('turtletrack_hide_small_balances') === 'true';
    } catch {
      return false;
    }
  });

  // Count small balance assets (< $1.00)
  const smallBalancesCount = React.useMemo(() => {
    return assets.filter(item => {
      const val = typeof item.value === 'number' ? item.value : (typeof item.totalValue === 'number' ? item.totalValue : 0);
      return Math.abs(val) < 1.00;
    }).length;
  }, [assets]);

  // Filter assets
  const filteredAssets = assets.filter(item => {
    // Chain or Network filter
    if (activeChainFilter !== 'ALL') {
      const filterLower = activeChainFilter.toLowerCase();
      const itemChainLower = (item.chain || '').toLowerCase();
      const itemNetLower = (item.network || '').toLowerCase();

      let matches = false;
      if (filterLower === 'eth' || filterLower === 'ethereum') {
        matches = itemChainLower === 'eth' || itemNetLower.includes('eth');
      } else if (filterLower === 'btc' || filterLower === 'bitcoin') {
        matches = itemChainLower === 'btc' || itemNetLower.includes('btc');
      } else if (filterLower === 'sol' || filterLower === 'solana') {
        matches = itemChainLower === 'sol' || itemNetLower.includes('sol');
      } else if (filterLower === 'hl' || filterLower === 'hyperliquid') {
        matches = itemChainLower === 'hl' || itemNetLower.includes('hyperliquid');
      } else if (filterLower === 'coinbase') {
        matches = itemChainLower === 'coinbase' || itemNetLower.includes('coinbase');
      } else {
        // Specific network or L2 like Arbitrum, Polygon, Base, Optimism, Avalanche, Scroll, Blast, Linea
        matches = itemNetLower === filterLower || itemNetLower.includes(filterLower);
      }

      if (!matches) {
        return false;
      }
    }
    // Staked filter
    if (showStakedOnly && !item.isStaked) {
      return false;
    }
    // Hide small balances filter (< $1.00)
    if (hideSmallBalances) {
      const val = typeof item.value === 'number' ? item.value : (typeof item.totalValue === 'number' ? item.totalValue : 0);
      if (Math.abs(val) < 1.00) {
        return false;
      }
    }
    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchSymbol = item.symbol.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchNetwork = (item.network || '').toLowerCase().includes(q);
      const matchWallet = item.walletLabel.toLowerCase().includes(q);
      const matchAddr = item.walletAddress.toLowerCase().includes(q);
      return matchSymbol || matchName || matchNetwork || matchWallet || matchAddr;
    }
    return true;
  });

  const getExplorerUrl = (chain, address) => {
    const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chain);
    return chainInfo ? `${chainInfo.explorer}${address}` : '#';
  };

  const getChainBadgeColor = (chain, network) => {
    const net = (network || chain || '').toUpperCase();
    if (net.includes('ARB')) return { bg: '#e0f2fe', text: '#0369a1', border: '#38bdf8' };
    if (net.includes('OP')) return { bg: '#fee2e2', text: '#b91c1c', border: '#f87171' };
    if (net.includes('BASE')) return { bg: '#eff6ff', text: '#1d4ed8', border: '#60a5fa' };
    if (net.includes('POLYGON') || net === 'POL') return { bg: '#f3e8ff', text: '#7e22ce', border: '#c084fc' };
    if (net.includes('AVAX') || net.includes('AVALANCHE')) return { bg: '#ffe4e6', text: '#e11d48', border: '#fb7185' };
    if (net.includes('BLAST')) return { bg: '#fef08a', text: '#854d0e', border: '#eab308' };
    if (net.includes('SCROLL')) return { bg: '#ffedd5', text: '#c2410c', border: '#fb923c' };
    if (net.includes('LINEA')) return { bg: '#f1f5f9', text: '#0f172a', border: '#64748b' };
    switch (chain) {
      case 'BTC': return { bg: '#fef3c7', text: '#92400e', border: '#d97706' };
      case 'ETH': return { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' };
      case 'SOL': return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'HL': return { bg: '#ccfbf1', text: '#115e59', border: '#14b8a6' };
      case 'COINBASE': return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
      default: return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  const isCustomNetworkFilter = !['ALL', 'BTC', 'ETH', 'SOL', 'HL', 'COINBASE'].includes(activeChainFilter);

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
            Ξ Ethereum &amp; L2s
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

          {isCustomNetworkFilter && (
            <button
              className="pill-btn active"
              onClick={() => onSelectChainFilter('ALL')}
              title="Click to clear filter"
            >
              🌐 {activeChainFilter} ✕
            </button>
          )}

          <button
            className={`pill-btn-toggle ${showStakedOnly ? 'active' : ''}`}
            onClick={() => setShowStakedOnly(!showStakedOnly)}
          >
            <ShieldCheck size={14} />
            <span>Staked Only</span>
          </button>

          <label 
            className={`checkbox-control ${hideSmallBalances ? 'active' : ''}`}
            title="Hide low-value holdings and dust (< $1.00)"
          >
            <input
              type="checkbox"
              id="hide-small-balances-checkbox"
              checked={hideSmallBalances}
              onChange={(e) => {
                const val = e.target.checked;
                setHideSmallBalances(val);
                try {
                  localStorage.setItem('turtletrack_hide_small_balances', String(val));
                } catch {}
              }}
            />
            <span>Hide Small Balances (&lt; $1){smallBalancesCount > 0 ? ` (${smallBalancesCount})` : ''}</span>
          </label>
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
                const chainStyle = getChainBadgeColor(item.chain, item.network);
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
                              {item.network || item.chain}
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
                        <span className={`holdings-amt ${item.balance < 0 ? 'red-text font-bold' : ''}`}>
                          {item.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                        </span>
                        <span className="holdings-symbol">{item.symbol}</span>
                      </div>
                    </td>

                    {/* Total Value ($) */}
                    <td className="align-right">
                      <span className={`fiat-value ${item.value < 0 ? 'red-text font-bold' : ''}`}>
                        {item.value < 0
                          ? `-$${Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : `$${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </td>

                    {/* Staking APY */}
                    <td className="align-right">
                      {item.isStaked && item.apy ? (
                        <div className="yield-cell">
                          <span className="yield-apy">{item.apy.toFixed(2)}% APY</span>
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
