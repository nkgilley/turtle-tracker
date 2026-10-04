import React from 'react';

export function TurtleLogo({ size = 28, className = '' }) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <span 
      className={`turtle-logo-icon ${className}`} 
      style={{ 
        fontSize: pixelSize, 
        lineHeight: 1, 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        userSelect: 'none'
      }}
      role="img"
      aria-label="TurtleTrack Turtle"
    >
      🐢
    </span>
  );
}
