import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';

export function ChainBreakdown({ chainTotals, totalNetWorth, onSelectChainFilter, selectedChainFilter }) {
  const chains = [
    {
      id: 'BTC',
      name: 'Bitcoin',
      color: '#F7931A',
      icon: '₿',
      desc: 'Native BTC + Babylon Staked LST'
    },
    {
      id: 'ETH',
      name: 'Ethereum & ERC-20',
      color: '#627EEA',
      icon: 'Ξ',
      desc: 'ETH, stETH, wstETH, USDC, DeFi'
    },
    {
      id: 'SOL',
      name: 'Solana',
      color: '#14F195',
      icon: '◎',
      desc: 'SOL, JitoSOL MEV, mSOL, SPL tokens'
    },
    {
      id: 'HL',
      name: 'Hyperliquid',
      color: '#20E5A3',
      icon: '⚡',
      desc: 'HYPE Staking, HLP Vault, Perps Margin'
    },
    {
      id: 'COINBASE',
      name: 'Coinbase',
      color: '#0052FF',
      icon: '🔵',
      desc: 'Coinbase Exchange & Staking Vault'
    }
  ];

  return (
    <div className="chain-breakdown-card">
      <div className="breakdown-header">
        <div className="breakdown-title-wrap">
          <Layers size={17} className="title-icon" />
          <span className="card-title">Network & Exchange Allocation</span>
        </div>
        <span className="card-subtitle">5 Ecosystems & Exchanges</span>
      </div>

      {/* Proportional Segmented Progress Bar */}
      <div className="segmented-bar">
        {chains.map(chain => {
          const pct = chainTotals[chain.id]?.percentage || 0;
          if (pct <= 0) return null;
          return (
            <div
              key={chain.id}
              className="segment"
              style={{
                width: `${Math.max(pct, 2)}%`,
                backgroundColor: chain.color
              }}
              title={`${chain.name}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Chain Detail Cards Grid */}
      <div className="chain-cards-grid">
        {chains.map(chain => {
          const data = chainTotals[chain.id] || { value: 0, percentage: 0 };
          const isSelected = selectedChainFilter === chain.id;

          return (
            <div
              key={chain.id}
              className={`chain-card ${isSelected ? 'active-filter' : ''}`}
              onClick={() => onSelectChainFilter(isSelected ? 'ALL' : chain.id)}
              style={{ '--chain-color': chain.color }}
            >
              <div className="chain-card-top">
                <div className="chain-badge" style={{ backgroundColor: `${chain.color}1f`, color: chain.color, borderColor: `${chain.color}40` }}>
                  <span className="chain-symbol-icon">{chain.icon}</span>
                  <span className="chain-name-text">{chain.name}</span>
                </div>
                <span className="chain-pct" style={{ color: chain.color }}>
                  {data.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="chain-card-value">
                ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="chain-card-sub">
                {chain.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
