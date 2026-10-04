import React, { useState } from 'react';
import { ShieldCheck, Flame, Zap, DollarSign, Calculator, Lock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function StakingHub({ stakingPositions, totalStakedValue, totalAnnualYield, averageStakingApy }) {
  const [calculatorStake, setCalculatorStake] = useState(totalStakedValue || 50000);
  const [calcYears, setCalcYears] = useState(1);

  // Compound interest calculation
  const calculatedFutureValue = calculatorStake * Math.pow(1 + (averageStakingApy / 100), calcYears);
  const totalEarnedYield = calculatedFutureValue - calculatorStake;

  const protocolHighlights = [
    {
      chain: 'Bitcoin (BTC)',
      protocol: 'Babylon & Lombard',
      tag: 'PoS Shared Security',
      color: '#b45309',
      symbol: 'LBTC',
      apy: '4.8%',
      features: ['Self-custodial BTC timestamping', 'No bridging required', 'Lombard DeFi yield multiplier']
    },
    {
      chain: 'Ethereum (ETH)',
      protocol: 'Lido & EigenLayer',
      tag: 'LST & Restaking',
      color: '#4338ca',
      symbol: 'stETH / wstETH',
      apy: '3.8% - 5.4%',
      features: ['Consensus & Execution layer rewards', 'AVS Actively Validated Services yield', 'Instant liquidity on DEXes']
    },
    {
      chain: 'Solana (SOL)',
      protocol: 'Jito MEV Stake',
      tag: 'MEV Yield Boosted',
      color: '#047857',
      symbol: 'JitoSOL',
      apy: '7.9%',
      features: ['MEV tip distribution to stakers', 'Decentralized validator allocation', 'Zero lockup liquidity token']
    },
    {
      chain: 'Hyperliquid (HL)',
      protocol: 'HYPE Staking & HLP',
      tag: 'PoS Emissions & L1 Fees',
      color: '#0f766e',
      symbol: 'HYPE / stHYPE / HLP',
      apy: '2.2% - 20.4%',
      features: ['Consensus delegation yields ~2.18% net APR', 'stHYPE liquid staking yields ~2.14% APY', 'HLP market-making vault yields ~18% - 22%']
    }
  ];

  return (
    <div className="staking-hub-container">
      {/* Top Banner */}
      <div className="staking-hero-banner">
        <div className="banner-content">
          <div className="banner-pill">
            <ShieldCheck size={16} />
            <span>TURTLE SHELL YIELD PROTOCOLS &bull; SLOW &amp; STEADY</span>
          </div>
          <h2 className="banner-title">Steady Staking &amp; Shell Vault Telemetry</h2>
          <p className="banner-desc">
            Built for endurance. Track sovereign validator consensus, MEV staking rebates, and liquid staking yields across Bitcoin, Ethereum, Solana, and Hyperliquid.
          </p>
        </div>

        <div className="banner-stats">
          <div className="stat-box">
            <span className="stat-label">Total Staked Capital</span>
            <span className="stat-val purple-text">
              ${totalStakedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Weighted Yield APY</span>
            <span className="stat-val cyan-text">{averageStakingApy.toFixed(2)}%</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Annual Passive Rewards</span>
            <span className="stat-val green-text">
              +${totalAnnualYield.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/yr
            </span>
          </div>
        </div>
      </div>

      {/* Protocol Cards */}
      <div className="protocol-cards-grid">
        {protocolHighlights.map((proto, idx) => (
          <div key={idx} className="protocol-card" style={{ '--border-color': proto.color }}>
            <div className="proto-card-top">
              <div className="proto-badge" style={{ backgroundColor: `${proto.color}15`, color: proto.color }}>
                {proto.chain}
              </div>
              <span className="proto-apy">{proto.apy} APY</span>
            </div>

            <h3 className="proto-name">{proto.protocol}</h3>
            <span className="proto-tag">{proto.tag}</span>

            <ul className="proto-features-list">
              {proto.features.map((feat, fIdx) => (
                <li key={fIdx}>
                  <CheckCircle2 size={13} style={{ color: proto.color }} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Staking Positions Table */}
      <div className="staking-table-card">
        <div className="table-card-header">
          <div className="table-header-left">
            <ShieldCheck size={18} className="purple-text" />
            <span className="card-heading">Active Staked Positions</span>
          </div>
          <span className="table-count-tag">{stakingPositions.length} Positions</span>
        </div>

        <div className="table-responsive">
          <table className="crypto-table">
            <thead>
              <tr>
                <th>Staked Asset</th>
                <th>Protocol</th>
                <th>Wallet</th>
                <th className="align-right">Staked Amount</th>
                <th className="align-right">Current Valuation</th>
                <th className="align-right">APY</th>
                <th className="align-right">Rewards Accrued</th>
                <th className="align-right">Est. Annual Return</th>
              </tr>
            </thead>
            <tbody>
              {stakingPositions.map((pos, idx) => (
                <tr key={idx} className="asset-row">
                  <td>
                    <div className="token-cell">
                      <div className="token-avatar purple-avatar">
                        {pos.symbol.substring(0, 3)}
                      </div>
                      <div className="token-info">
                        <span className="token-symbol">{pos.symbol}</span>
                        <span className="token-full-name">{pos.chain} Ecosystem</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="protocol-badge">
                      <Lock size={12} />
                      <span>{pos.protocol}</span>
                    </div>
                  </td>
                  <td>
                    <div className="wallet-cell">
                      <span className="wallet-label-text">{pos.walletLabel}</span>
                      <span className="wallet-address-short">
                        {pos.walletAddress.substring(0, 6)}...{pos.walletAddress.substring(pos.walletAddress.length - 4)}
                      </span>
                    </div>
                  </td>
                  <td className="align-right font-mono">
                    {pos.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {pos.symbol}
                  </td>
                  <td className="align-right font-mono font-bold">
                    ${pos.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="align-right">
                    <span className="apy-tag green">{pos.apy.toFixed(2)}%</span>
                  </td>
                  <td className="align-right font-mono green-text">
                    +{pos.rewardsEarned.toLocaleString('en-US', { maximumFractionDigits: 4 })} {pos.symbol}
                  </td>
                  <td className="align-right font-mono cyan-text font-bold">
                    +${pos.annualYieldValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Yield Calculator */}
      <div className="yield-calculator-card">
        <div className="calc-header">
          <div className="calc-title-wrap">
            <Calculator size={20} className="cyan-text" />
            <h3 className="calc-title">Compounding Yield Forecast</h3>
          </div>
          <span className="calc-note">Calculated with blended multi-chain APY of {averageStakingApy.toFixed(2)}%</span>
        </div>

        <div className="calc-grid">
          <div className="calc-controls">
            <div className="input-group">
              <label>Staked Principal ($ USD)</label>
              <div className="input-with-icon">
                <DollarSign size={16} />
                <input
                  type="number"
                  value={calculatorStake}
                  onChange={(e) => setCalculatorStake(Number(e.target.value))}
                  min="100"
                  step="1000"
                  className="calc-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Forecast Horizon</label>
              <div className="years-toggle">
                {[1, 2, 3, 5].map((yr) => (
                  <button
                    key={yr}
                    className={`year-btn ${calcYears === yr ? 'active' : ''}`}
                    onClick={() => setCalcYears(yr)}
                  >
                    {yr} {yr === 1 ? 'Year' : 'Years'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="calc-results-display">
            <div className="res-row">
              <span className="res-label">Initial Principal</span>
              <span className="res-val font-mono">${calculatorStake.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="res-row highlight">
              <span className="res-label">Est. Passive Rewards Earned</span>
              <span className="res-val green-text font-mono">+${totalEarnedYield.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="res-row total">
              <span className="res-label">Projected Final Balance</span>
              <span className="res-val cyan-text font-mono font-bold">${calculatedFutureValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
