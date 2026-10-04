import React from 'react';

export function TurtleLogo({ size = 28, className = '' }) {
  return (
    <div className={`turtle-logo-wrapper ${className}`} style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="turtle-svg-icon"
      >
        <defs>
          <linearGradient id="turtleShellGrad" x1="6" y1="8" x2="30" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
          <linearGradient id="turtleBodyGrad" x1="18" y1="2" x2="18" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <filter id="turtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Head */}
        <ellipse cx="18" cy="6" rx="3.5" ry="4.5" fill="url(#turtleBodyGrad)" />
        {/* Head eye dots */}
        <circle cx="16.2" cy="4.8" r="0.7" fill="#050B10" />
        <circle cx="19.8" cy="4.8" r="0.7" fill="#050B10" />

        {/* Front Left Flipper */}
        <path
          d="M12 12 C6 9 2 13 4 18 C7 19 11 16 13 14 Z"
          fill="url(#turtleBodyGrad)"
          opacity="0.9"
        />
        {/* Front Right Flipper */}
        <path
          d="M24 12 C30 9 34 13 32 18 C29 19 25 16 23 14 Z"
          fill="url(#turtleBodyGrad)"
          opacity="0.9"
        />

        {/* Back Left Flipper */}
        <path
          d="M13 25 C10 28 9 32 12 33 C14 32 15 28 15 26 Z"
          fill="url(#turtleBodyGrad)"
          opacity="0.75"
        />
        {/* Back Right Flipper */}
        <path
          d="M23 25 C26 28 27 32 24 33 C22 32 21 28 21 26 Z"
          fill="url(#turtleBodyGrad)"
          opacity="0.75"
        />

        {/* Tail */}
        <polygon points="18,30 16.5,33.5 19.5,33.5" fill="url(#turtleBodyGrad)" opacity="0.8" />

        {/* Outer Carapace Shell (Hexagonal Shield) */}
        <polygon
          points="18,10 26,14.5 26,24.5 18,29 10,24.5 10,14.5"
          fill="#07191C"
          stroke="url(#turtleShellGrad)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          filter="url(#turtleGlow)"
        />

        {/* Inner Carapace Facets (Blockchain-style Scutes) */}
        <polygon
          points="18,14 22,16.5 22,22.5 18,25 14,22.5 14,16.5"
          fill="#10B981"
          fillOpacity="0.22"
          stroke="#00F0FF"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Center Carapace Core / Staking Node */}
        <circle cx="18" cy="19.5" r="2.2" fill="#00F0FF" />
        <circle cx="18" cy="19.5" r="1" fill="#FFFFFF" />

        {/* Radiating scute seam lines */}
        <line x1="18" y1="10" x2="18" y2="14" stroke="#10B981" strokeWidth="1" opacity="0.7" />
        <line x1="26" y1="14.5" x2="22" y2="16.5" stroke="#10B981" strokeWidth="1" opacity="0.7" />
        <line x1="26" y1="24.5" x2="22" y2="22.5" stroke="#10B981" strokeWidth="1" opacity="0.7" />
        <line x1="18" y1="29" x2="18" y2="25" stroke="#10B981" strokeWidth="1" opacity="0.7" />
        <line x1="10" y1="24.5" x2="14" y2="22.5" stroke="#10B981" strokeWidth="1" opacity="0.7" />
        <line x1="10" y1="14.5" x2="14" y2="16.5" stroke="#10B981" strokeWidth="1" opacity="0.7" />
      </svg>
    </div>
  );
}
