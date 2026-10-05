import React from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, Flame, DollarSign, PieChart, Layers } from 'lucide-react';

export function PortfolioSummary({ metrics, activeTab, setActiveTab }) {
  const isPositive = metrics.total24hChangeValue >= 0;
  const stakedPercentage = metrics.totalNetWorth > 0 
    ? ((metrics.totalStakedValue / metrics.totalNetWorth) * 100).toFixed(1)
    : 0;

  return (
    <section className="portfolio-summary-section">
      <div className="summary-header">
        <div className="title-area">
          <span className="section-label">SHELL VAULT VALUATION</span>
          <h1 className="total-net-worth">
            ${metrics.totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <div className="pnl-badge-row">
            <span className={`pnl-pill ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isPositive ? '+' : ''}${Math.abs(metrics.total24hChangeValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="pnl-pct">({isPositive ? '+' : ''}{metrics.total24hChangePercent.toFixed(2)}%) 24h</span>
            </span>
            <span className="live-pill">
              <span className="pulse-dot green"></span>
              Live Price Feeds
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="view-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <PieChart size={15} />
            <span>Overview</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'staking' ? 'active' : ''}`}
            onClick={() => setActiveTab('staking')}
          >
            <ShieldCheck size={15} />
            <span>Staking Hub</span>
            <span className="tab-pill-badge">{metrics.stakingPositions.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Layers size={15} />
            <span>Activity</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Staked Card */}
        <div className="kpi-card glow-card-purple">
          <div className="kpi-icon-wrap purple">
            <ShieldCheck size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">TOTAL STAKED ASSETS</span>
            <div className="kpi-value-row">
              <span className="kpi-value">
                ${metrics.totalStakedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="kpi-chip purple">{stakedPercentage}% of total</span>
            </div>
            <p className="kpi-subtext">Across Bitcoin, Ethereum, Solana & Hyperliquid</p>
          </div>
        </div>

        {/* Staking Yield / APY Card */}
        <div className="kpi-card glow-card-cyan">
          <div className="kpi-icon-wrap cyan">
            <Flame size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">BLENDED STAKING APY</span>
            <div className="kpi-value-row">
              <span className="kpi-value cyan-text">
                {metrics.averageStakingApy.toFixed(2)}%
              </span>
              <span className="kpi-chip cyan">Weighted APY</span>
            </div>
            <p className="kpi-subtext">Includes MEV kickback, validator yields & LSTs</p>
          </div>
        </div>

        {/* Projected Annual Passive Yield */}
        <div className="kpi-card glow-card-green">
          <div className="kpi-icon-wrap green">
            <DollarSign size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">EST. ANNUAL REWARDS</span>
            <div className="kpi-value-row">
              <span className="kpi-value green-text">
                +${metrics.totalAnnualYield.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/yr
              </span>
              <span className="kpi-chip green">
                +${(metrics.totalAnnualYield / 12).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo
              </span>
            </div>
            <p className="kpi-subtext">Compounding daily from auto-restaking & vaults</p>
          </div>
        </div>
      </div>
    </section>
  );
}
