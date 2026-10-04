import React, { useState, useMemo } from 'react';
import { generateChartPoints } from '../services/cryptoService';
import { TrendingUp, Calendar } from 'lucide-react';

export function PortfolioChart({ totalNetWorth }) {
  const [timeframe, setTimeframe] = useState('7D');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const points = useMemo(() => {
    return generateChartPoints(totalNetWorth, timeframe);
  }, [totalNetWorth, timeframe]);

  const { minVal, maxVal, svgPath, areaPath, coords } = useMemo(() => {
    if (!points || points.length === 0) return { minVal: 0, maxVal: 0, svgPath: '', areaPath: '', coords: [] };

    const values = points.map(p => p.value);
    const min = Math.min(...values) * 0.985;
    const max = Math.max(...values) * 1.015;
    const range = max - min || 1;

    const width = 800;
    const height = 240;
    const paddingX = 20;
    const paddingTop = 25;
    const paddingBottom = 30;
    const usableHeight = height - paddingTop - paddingBottom;
    const usableWidth = width - (paddingX * 2);

    const calculatedCoords = points.map((p, idx) => {
      const x = paddingX + (idx / (points.length - 1)) * usableWidth;
      const y = paddingTop + usableHeight - ((p.value - min) / range) * usableHeight;
      return { x, y, ...p };
    });

    // Create smooth SVG cubic bezier path
    let d = `M ${calculatedCoords[0].x} ${calculatedCoords[0].y}`;
    for (let i = 0; i < calculatedCoords.length - 1; i++) {
      const p0 = calculatedCoords[i === 0 ? 0 : i - 1];
      const p1 = calculatedCoords[i];
      const p2 = calculatedCoords[i + 1];
      const p3 = calculatedCoords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const firstPoint = calculatedCoords[0];
    const lastPoint = calculatedCoords[calculatedCoords.length - 1];
    const area = `${d} L ${lastPoint.x} ${height - paddingBottom} L ${firstPoint.x} ${height - paddingBottom} Z`;

    return {
      minVal: min,
      maxVal: max,
      svgPath: d,
      areaPath: area,
      coords: calculatedCoords
    };
  }, [points]);

  const activeDisplay = hoveredPoint || (coords.length > 0 ? coords[coords.length - 1] : null);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-info">
          <div className="chart-value-display">
            <span className="chart-val-num">
              ${(activeDisplay ? activeDisplay.value : totalNetWorth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {activeDisplay && (
              <span className="chart-time-badge">
                <Calendar size={12} />
                {activeDisplay.label}
              </span>
            )}
          </div>
          <span className="chart-sub-label">Historical Multi-Chain Portfolio Curve</span>
        </div>

        {/* Timeframe Switcher */}
        <div className="timeframe-buttons">
          {['24H', '7D', '30D', '1Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => {
                setTimeframe(tf);
                setHoveredPoint(null);
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="chart-svg-container">
        <svg 
          viewBox="0 0 800 240" 
          preserveAspectRatio="none"
          className="chart-svg"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.32" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#08090D" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#20E5A3" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="20" y1="50" x2="780" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <line x1="20" y1="120" x2="780" y2="120" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <line x1="20" y1="190" x2="780" y2="190" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          {/* Smooth line */}
          {svgPath && (
            <path 
              d={svgPath} 
              fill="none" 
              stroke="url(#strokeGradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Hover Crosshair & Pointer */}
          {hoveredPoint && (
            <g>
              <line 
                x1={hoveredPoint.x} 
                y1="25" 
                x2={hoveredPoint.x} 
                y2="210" 
                stroke="#00F0FF" 
                strokeWidth="1.2" 
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <circle 
                cx={hoveredPoint.x} 
                cy={hoveredPoint.y} 
                r="6" 
                fill="#00F0FF" 
                stroke="#08090D" 
                strokeWidth="2.5" 
              />
            </g>
          )}

          {/* Invisible interactive hover columns */}
          {coords.map((c, i) => (
            <rect
              key={i}
              x={c.x - (800 / coords.length) / 2}
              y="0"
              width={800 / coords.length}
              height="240"
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoveredPoint(c)}
            />
          ))}
        </svg>

        {/* Dynamic X-Axis labels */}
        <div className="chart-x-axis">
          <span>{coords[0]?.label || ''}</span>
          <span>{coords[Math.floor(coords.length / 2)]?.label || ''}</span>
          <span>{coords[coords.length - 1]?.label || 'Now'}</span>
        </div>
      </div>
    </div>
  );
}
