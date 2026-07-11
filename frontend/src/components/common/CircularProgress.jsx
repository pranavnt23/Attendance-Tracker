import React from 'react';

const CircularProgress = ({ 
  percentage = 0, 
  size = 180, 
  strokeWidth = 14,
  label = "Overall"
}) => {
  // Ensure percentage is between 0 and 100
  const cleanPercentage = Math.min(100, Math.max(0, parseFloat(percentage) || 0));
  
  // SVG geometry calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanPercentage / 100) * circumference;

  // Determine status color theme
  let statusColor = "emerald";
  let statusLabel = "Safe";
  let statusBg = "from-emerald-500 to-teal-600";
  let textShadow = "shadow-emerald-500/20";
  let glowColor = "rgba(16, 185, 129, 0.15)";

  if (cleanPercentage < 70) {
    statusColor = "rose";
    statusLabel = "Critical";
    statusBg = "from-rose-500 to-red-600";
    textShadow = "shadow-rose-500/20";
    glowColor = "rgba(244, 63, 94, 0.15)";
  } else if (cleanPercentage < 75) {
    statusColor = "amber";
    statusLabel = "Alert";
    statusBg = "from-amber-500 to-orange-600";
    textShadow = "shadow-amber-500/20";
    glowColor = "rgba(245, 158, 11, 0.15)";
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      
      {/* Outer Ring Ambient Glow */}
      <div 
        className="absolute rounded-full filter blur-xl opacity-30 transition-all duration-700" 
        style={{
          width: `${size - 10}px`,
          height: `${size - 10}px`,
          backgroundColor: glowColor
        }}
      />

      {/* SVG Container */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              {statusColor === "emerald" && (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </>
              )}
              {statusColor === "amber" && (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </>
              )}
              {statusColor === "rose" && (
                <>
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </>
              )}
            </linearGradient>
            
            {/* Filter for subtle shadow on active indicator */}
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" floodColor="#000" />
            </filter>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800 fill-transparent transition-all duration-300"
            strokeWidth={strokeWidth}
          />

          {/* Active Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'url(#shadow)'
            }}
          />
        </svg>

        {/* Floating Center Text Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white leading-none mt-1">
            {cleanPercentage.toFixed(1)}%
          </span>
          
          {/* Dynamic Status Pill */}
          <span className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-gradient-to-r ${statusBg} text-white shadow-sm`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
