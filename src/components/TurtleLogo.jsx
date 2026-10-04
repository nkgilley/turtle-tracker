import React from 'react';

export function TurtleLogo({ size = 28, className = '' }) {
  return (
    <div className={`turtle-logo-wrapper ${className}`} style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        className="turtle-pixel-svg"
      >
        {/* Pixel Art Turtle (16x16 Grid) */}
        {/* Head */}
        <rect x="7" y="1" width="2" height="1" fill="#1b2a1a" />
        <rect x="6" y="2" width="4" height="2" fill="#22c55e" />
        <rect x="6" y="2" width="1" height="1" fill="#1b2a1a" />
        <rect x="9" y="2" width="1" height="1" fill="#1b2a1a" />
        {/* Eyes */}
        <rect x="6" y="3" width="1" height="1" fill="#000000" />
        <rect x="9" y="3" width="1" height="1" fill="#000000" />

        {/* Front Left Flipper */}
        <rect x="2" y="4" width="3" height="2" fill="#16a34a" />
        <rect x="1" y="5" width="2" height="2" fill="#15803d" />

        {/* Front Right Flipper */}
        <rect x="11" y="4" width="3" height="2" fill="#16a34a" />
        <rect x="13" y="5" width="2" height="2" fill="#15803d" />

        {/* Shell Outline (Dark Border) */}
        <rect x="5" y="4" width="6" height="8" fill="#1c1917" />

        {/* Shell Body (Warm Emerald / Olive Turtle Shell) */}
        <rect x="6" y="5" width="4" height="6" fill="#15803d" />
        <rect x="5" y="6" width="6" height="4" fill="#16a34a" />

        {/* Shell Carapace Scute Pattern (Cream / Yellow Highlights like Classic Mario/Curve) */}
        <rect x="7" y="6" width="2" height="2" fill="#86efac" />
        <rect x="7" y="9" width="2" height="1" fill="#4ade80" />
        <rect x="5" y="7" width="1" height="2" fill="#22c55e" />
        <rect x="10" y="7" width="1" height="2" fill="#22c55e" />

        {/* Center Node Sparkle (Cyan Core) */}
        <rect x="7" y="7" width="2" height="1" fill="#06b6d4" />
        <rect x="8" y="7" width="1" height="1" fill="#ffffff" />

        {/* Rear Left Flipper */}
        <rect x="3" y="11" width="2" height="2" fill="#15803d" />
        <rect x="2" y="12" width="2" height="2" fill="#166534" />

        {/* Rear Right Flipper */}
        <rect x="11" y="11" width="2" height="2" fill="#15803d" />
        <rect x="12" y="12" width="2" height="2" fill="#166534" />

        {/* Tail */}
        <rect x="7" y="12" width="2" height="2" fill="#15803d" />
        <rect x="7" y="14" width="2" height="1" fill="#166534" />
      </svg>
    </div>
  );
}
