import React from 'react';

/**
 * MiniRing — A compact circular progress ring for subject cards.
 * Accepts percentage, size, strokeWidth, and a hex color prop.
 */
const MiniRing = ({ percentage = 0, size = 48, strokeWidth = 4, color = '#10b981' }) => {
  const clean = Math.min(100, Math.max(0, parseFloat(percentage) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clean / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-extrabold leading-none" style={{ color }}>
          {clean.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default MiniRing;
