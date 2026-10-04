import React, { useState, useMemo } from 'react';
import { PieChart as PieChartIcon, RotateCcw, Check, Sparkles } from 'lucide-react';
import { getNetworkInfo } from '../data/mockData';

export function ChainBreakdown({ 
  networkTotals = [], 
  chainTotals = {}, 
  totalNetWorth, 
  onSelectChainFilter, 
  selectedChainFilter 
}) {
  const [hoveredNetId, setHoveredNetId] = useState(null);

  // Use dynamic networks with assets, or fallback to non-zero chainTotals
  const activeNetworks = useMemo(() => {
    if (Array.isArray(networkTotals) && networkTotals.length > 0) {
      return networkTotals.filter(n => n.value > 0.0001 || n.percentage > 0.01);
    }

    // Fallback: derive from chainTotals, filtering out 0-value chains
    return Object.values(chainTotals)
      .filter(c => c.value > 0.0001 || c.percentage > 0.01)
      .map(c => {
        const info = getNetworkInfo(c.id);
        return {
          id: c.id,
          name: info.name,
          color: info.color,
          sliceColor: info.sliceColor,
          icon: info.icon,
          desc: info.desc,
          value: c.value,
          percentage: c.percentage
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [networkTotals, chainTotals]);

  // Calculate slice geometry for SVG Donut Pie Chart
  const { slices, activeSlice } = useMemo(() => {
    const cx = 120;
    const cy = 120;
    const R = 98;  // outer radius
    const r = 54;  // inner radius

    const totalPct = activeNetworks.reduce((sum, c) => sum + (c.percentage || 0), 0);

    // If total pct is 0 (empty portfolio)
    if (activeNetworks.length === 0 || totalPct <= 0.001) {
      return { slices: [], activeSlice: null };
    }

    let curAngle = -90; // Start at 12 o'clock
    const calculatedSlices = activeNetworks
      .filter(c => c.percentage > 0.0001)
      .map(c => {
        // Normalize angle so all slices sum to 360
        const angle = (c.percentage / totalPct) * 360;
        const startAngle = curAngle;
        const endAngle = curAngle + angle;
        curAngle += angle;

        const isFull = angle >= 359.95;
        let path = '';

        if (isFull) {
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

    const activeId = hoveredNetId || (selectedChainFilter !== 'ALL' ? selectedChainFilter : null);
    const active = calculatedSlices.find(s => s.id === activeId || s.name === activeId) || null;

    return { slices: calculatedSlices, activeSlice: active };
  }, [activeNetworks, hoveredNetId, selectedChainFilter]);

  const activeNetObj = activeSlice || activeNetworks.find(c => c.id === (hoveredNetId || selectedChainFilter) || c.name === (hoveredNetId || selectedChainFilter));

  return (
    <div className="chain-breakdown-card">
      {/* Header */}
      <div className="breakdown-header">
        <div className="breakdown-title-wrap">
          <PieChartIcon size={18} className="title-icon" />
          <span className="card-title">Network &amp; Layer 2 Allocation</span>
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
          <span className="card-subtitle">
            {activeNetworks.length} {activeNetworks.length === 1 ? 'Network' : 'Active Networks'}
          </span>
        </div>
      </div>

      {activeNetworks.length === 0 ? (
        <div className="empty-allocation-notice">
          <p>No active network balances detected. Connect a wallet to view allocation.</p>
        </div>
      ) : (
        /* Main Allocation Content: Pie Chart + Ecosystem Cards */
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
                  const isHovered = hoveredNetId === slice.id;
                  const isSelected = selectedChainFilter === slice.id || selectedChainFilter === slice.name;
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
                      onMouseEnter={() => setHoveredNetId(slice.id)}
                      onMouseLeave={() => setHoveredNetId(null)}
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
                {activeNetObj ? (
                  <div className="center-hover-info">
                    <span className="center-icon">{activeNetObj.icon}</span>
                    <span className="center-chain-name">{activeNetObj.name}</span>
                    <span className="center-pct" style={{ color: activeNetObj.color }}>
                      {activeNetObj.percentage.toFixed(1)}%
                    </span>
                    <span className="center-val">
                      ${activeNetObj.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ) : (
                  <div className="center-default-info">
                    <span className="center-logo">🐢</span>
                    <span className="center-label">TOTAL ASSETS</span>
                    <span className="center-total">
                      ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="center-hint">Hover / Filter</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pie-chart-legend-hint">
              <span>Tip: Click slice to filter asset table</span>
            </div>
          </div>

          {/* Right: Ecosystem Breakdown Cards for Active Networks */}
          <div className="chain-cards-column">
            {activeNetworks.map(net => {
              const isSelected = selectedChainFilter === net.id || selectedChainFilter === net.name;
              const isHovered = hoveredNetId === net.id;

              return (
                <div
                  key={net.id}
                  className={`chain-card ${isSelected ? 'active-filter' : ''} ${isHovered ? 'hover-state' : ''}`}
                  onClick={() => onSelectChainFilter(isSelected ? 'ALL' : net.id)}
                  onMouseEnter={() => setHoveredNetId(net.id)}
                  onMouseLeave={() => setHoveredNetId(null)}
                  style={{ '--chain-color': net.color }}
                >
                  <div className="chain-card-top">
                    <div 
                      className="chain-badge" 
                      style={{ 
                        backgroundColor: `${net.color}15`, 
                        color: net.color, 
                        borderColor: `${net.color}50` 
                      }}
                    >
                      <span className="chain-symbol-icon">{net.icon}</span>
                      <span className="chain-name-text">{net.name}</span>
                    </div>

                    <div className="chain-card-pct-badge" style={{ backgroundColor: `${net.color}20`, color: net.color, borderColor: `${net.color}40` }}>
                      {net.percentage.toFixed(1)}%
                    </div>
                  </div>

                  <div className="chain-card-bottom-row">
                    <div className="chain-card-value font-mono">
                      ${net.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {isSelected && (
                      <span className="filtered-indicator">
                        <Check size={12} />
                        <span>Filtered</span>
                      </span>
                    )}
                  </div>

                  <div className="chain-card-sub">
                    {net.desc || `${net.name} Network`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
