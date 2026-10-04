import React, { useState, useMemo } from 'react';
import { PieChart as PieChartIcon, RotateCcw, Check } from 'lucide-react';

export function ChainBreakdown({ chainTotals, totalNetWorth, onSelectChainFilter, selectedChainFilter }) {
  const [hoveredChainId, setHoveredChainId] = useState(null);

  const chains = [
    {
      id: 'BTC',
      name: 'Bitcoin',
      color: '#b45309',
      sliceColor: '#f59e0b',
      icon: '₿',
      desc: 'Native BTC + Babylon Staked LST'
    },
    {
      id: 'ETH',
      name: 'Ethereum & ERC-20',
      color: '#4338ca',
      sliceColor: '#6366f1',
      icon: 'Ξ',
      desc: 'ETH, stETH, wstETH, USDC, DeFi'
    },
    {
      id: 'SOL',
      name: 'Solana',
      color: '#047857',
      sliceColor: '#10b981',
      icon: '◎',
      desc: 'SOL, JitoSOL MEV, mSOL, SPL tokens'
    },
    {
      id: 'HL',
      name: 'Hyperliquid',
      color: '#0f766e',
      sliceColor: '#14b8a6',
      icon: '⚡',
      desc: 'HYPE Staking, HLP Vault, Perps Margin'
    },
    {
      id: 'COINBASE',
      name: 'Coinbase',
      color: '#1d4ed8',
      sliceColor: '#3b82f6',
      icon: '🔵',
      desc: 'Coinbase Exchange & Staking'
    }
  ];

  // Calculate slice geometry for SVG Donut Pie Chart
  const { slices, activeSlice } = useMemo(() => {
    const cx = 120;
    const cy = 120;
    const R = 98;  // outer radius
    const r = 54;  // inner radius

    // Sum positive percentages
    const validChains = chains.map(c => {
      const data = chainTotals[c.id] || { value: 0, percentage: 0 };
      return {
        ...c,
        value: data.value || 0,
        percentage: Math.max(0, data.percentage || 0)
      };
    });

    const totalPct = validChains.reduce((sum, c) => sum + c.percentage, 0);

    // If total pct is 0 (empty portfolio)
    if (totalPct <= 0.001) {
      return { slices: [], activeSlice: null };
    }

    let curAngle = -90; // Start at 12 o'clock
    const calculatedSlices = validChains
      .filter(c => c.percentage > 0.0001)
      .map(c => {
        // Normalize angle so all slices total 360
        const angle = (c.percentage / totalPct) * 360;
        const startAngle = curAngle;
        const endAngle = curAngle + angle;
        curAngle += angle;

        const isFull = angle >= 359.95;
        let path = '';

        if (isFull) {
          // Double semicircle arc for full 360 donut
          path = `M ${cx - R} ${cy} A ${R} ${R} 0 1 0 ${cx + R} ${cy} A ${R} ${R} 0 1 0 ${cx - R} ${cy} M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
        } else {
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = cx + R * Math.cos(startRad);
          const y1 = cy + R * Math.sin(startRad);
          const x2 = cx + R * Math.cos(endRad);
          const y2 = cy + R * Math.sin(endRad);
          const x3 = cx + r * Math.cos(endRad);
          const y3 = cy + r * Math.sin(endRad);
          const x4 = cx + r * Math.cos(startRad);
          const y4 = cy + r * Math.sin(startRad);
          const largeArc = angle > 180 ? 1 : 0;

          path = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${largeArc} 0 ${x4} ${y4} Z`;
        }

        const midAngleRad = (((startAngle + endAngle) / 2) * Math.PI) / 180;
        const offsetDist = 5;
        const offsetX = Math.cos(midAngleRad) * offsetDist;
        const offsetY = Math.sin(midAngleRad) * offsetDist;

        return {
          ...c,
          startAngle,
          endAngle,
          angle,
          path,
          offsetX,
          offsetY
        };
      });

    const activeId = hoveredChainId || (selectedChainFilter !== 'ALL' ? selectedChainFilter : null);
    const active = calculatedSlices.find(s => s.id === activeId) || null;

    return { slices: calculatedSlices, activeSlice: active };
  }, [chainTotals, chains, hoveredChainId, selectedChainFilter]);

  const activeChainObj = activeSlice || chains.find(c => c.id === (hoveredChainId || selectedChainFilter));
  const activeChainData = activeChainObj ? (chainTotals[activeChainObj.id] || { value: 0, percentage: 0 }) : null;

  return (
    <div className="chain-breakdown-card">
      {/* Header */}
      <div className="breakdown-header">
        <div className="breakdown-title-wrap">
          <PieChartIcon size={18} className="title-icon" />
          <span className="card-title">Network &amp; Exchange Allocation</span>
        </div>

        <div className="breakdown-actions">
          {selectedChainFilter !== 'ALL' && (
            <button 
              type="button" 
              className="btn-filter-reset"
              onClick={() => onSelectChainFilter('ALL')}
              title="Clear active network filter"
            >
              <RotateCcw size={12} />
              <span>Reset Filter</span>
            </button>
          )}
          <span className="card-subtitle">5 Ecosystems</span>
        </div>
      </div>

      {/* Main Allocation Content: Pie Chart + Ecosystem Cards */}
      <div className="allocation-layout">
        {/* Left: Interactive SVG Pie/Donut Chart */}
        <div className="pie-chart-wrapper">
          <div className="pie-svg-container">
            <svg viewBox="0 0 240 240" className="pie-svg" role="img" aria-label="Network Allocation Pie Chart">
              {/* Background empty track */}
              <circle 
                cx="120" 
                cy="120" 
                r="76" 
                stroke="#e7e0d0" 
                strokeWidth="44" 
                fill="none" 
              />

              {/* Pie Slices */}
              {slices.map(slice => {
                const isHovered = hoveredChainId === slice.id;
                const isSelected = selectedChainFilter === slice.id;
                const isHighlight = isHovered || isSelected;

                return (
                  <path
                    key={slice.id}
                    d={slice.path}
                    fill={slice.sliceColor}
                    stroke="#1c1917"
                    strokeWidth={isHighlight ? "2.5" : "1.8"}
                    strokeLinejoin="round"
                    className={`pie-slice ${isHighlight ? 'slice-active' : ''}`}
                    style={{
                      transform: isHighlight 
                        ? `translate(${slice.offsetX}px, ${slice.offsetY}px)` 
                        : 'translate(0px, 0px)',
                      transition: 'transform 0.15s ease, filter 0.15s ease',
                      cursor: 'pointer',
                      filter: isHighlight ? 'brightness(1.08) drop-shadow(0 2px 4px rgba(0,0,0,0.25))' : 'none'
                    }}
                    onMouseEnter={() => setHoveredChainId(slice.id)}
                    onMouseLeave={() => setHoveredChainId(null)}
                    onClick={() => onSelectChainFilter(selectedChainFilter === slice.id ? 'ALL' : slice.id)}
                  >
                    <title>{`${slice.name}: ${slice.percentage.toFixed(1)}% ($${slice.value.toLocaleString()})`}</title>
                  </path>
                );
              })}

              {/* Inner Hole Retro Border */}
              <circle 
                cx="120" 
                cy="120" 
                r="53" 
                stroke="#1c1917" 
                strokeWidth="2" 
                fill="#ffffff" 
              />
            </svg>

            {/* Donut Center Display */}
            <div className="pie-center-telemetry">
              {activeChainObj && activeChainData ? (
                <div className="center-hover-info">
                  <span className="center-icon">{activeChainObj.icon}</span>
                  <span className="center-chain-name">{activeChainObj.name}</span>
                  <span className="center-pct" style={{ color: activeChainObj.color }}>
                    {activeChainData.percentage.toFixed(1)}%
                  </span>
                  <span className="center-val">
                    ${activeChainData.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              ) : (
                <div className="center-default-info">
                  <span className="center-logo">🐢</span>
                  <span className="center-label">TOTAL ASSETS</span>
                  <span className="center-total">
                    ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="center-hint">Hover / Click</span>
                </div>
              )}
            </div>
          </div>

          <div className="pie-chart-legend-hint">
            <span>Tip: Click any slice to filter asset table</span>
          </div>
        </div>

        {/* Right: Ecosystem Breakdown Cards */}
        <div className="chain-cards-column">
          {chains.map(chain => {
            const data = chainTotals[chain.id] || { value: 0, percentage: 0 };
            const isSelected = selectedChainFilter === chain.id;
            const isHovered = hoveredChainId === chain.id;

            return (
              <div
                key={chain.id}
                className={`chain-card ${isSelected ? 'active-filter' : ''} ${isHovered ? 'hover-state' : ''}`}
                onClick={() => onSelectChainFilter(isSelected ? 'ALL' : chain.id)}
                onMouseEnter={() => setHoveredChainId(chain.id)}
                onMouseLeave={() => setHoveredChainId(null)}
                style={{ '--chain-color': chain.color }}
              >
                <div className="chain-card-top">
                  <div 
                    className="chain-badge" 
                    style={{ 
                      backgroundColor: `${chain.color}15`, 
                      color: chain.color, 
                      borderColor: `${chain.color}50` 
                    }}
                  >
                    <span className="chain-symbol-icon">{chain.icon}</span>
                    <span className="chain-name-text">{chain.name}</span>
                  </div>

                  <div className="chain-card-pct-badge" style={{ backgroundColor: `${chain.color}20`, color: chain.color, borderColor: `${chain.color}40` }}>
                    {data.percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="chain-card-bottom-row">
                  <div className="chain-card-value font-mono">
                    ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {isSelected && (
                    <span className="filtered-indicator">
                      <Check size={12} />
                      <span>Filtered</span>
                    </span>
                  )}
                </div>

                <div className="chain-card-sub">
                  {chain.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
