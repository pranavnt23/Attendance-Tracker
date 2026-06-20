import React from 'react';

const AttendanceCard = ({ percentage = 100, conducted = 0, present = 0, absent = 0, od = 0 }) => {
  // SVG circle computations
  const radius = 40;
  const strokeWidth = 8;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine indicator color based on status thresholds
  let ringColor = 'stroke-indigo-600 dark:stroke-indigo-400';
  let glowColor = 'shadow-indigo-500/20';
  
  if (percentage < 50) {
    ringColor = 'stroke-rose-500 dark:stroke-rose-400';
    glowColor = 'shadow-rose-500/20';
  } else if (percentage < 75) {
    ringColor = 'stroke-amber-500 dark:stroke-amber-400';
    glowColor = 'shadow-amber-500/20';
  } else if (percentage >= 75) {
    ringColor = 'stroke-emerald-500 dark:stroke-emerald-400';
    glowColor = 'shadow-emerald-500/20';
  }

  return (
    <div className="glass-panel border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
      
      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center shrink-0 w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="stroke-slate-100 dark:stroke-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className={`transition-all duration-1000 ease-out ${ringColor}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={radius}
            cx="50"
            cy="50"
          />
        </svg>
        {/* Percentage Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white leading-none">
            {percentage}%
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
            Attendance
          </span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Conducted</span>
          <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-200 mt-0.5">{conducted} hrs</p>
        </div>
        <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl text-center">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Present</span>
          <p className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{present} hrs</p>
        </div>
        <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 dark:border-rose-500/20 rounded-2xl text-center">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Absent</span>
          <p className="text-xl font-display font-bold text-rose-600 dark:text-rose-400 mt-0.5">{absent} hrs</p>
        </div>
        <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 rounded-2xl text-center">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">OD Count</span>
          <p className="text-xl font-display font-bold text-amber-600 dark:text-amber-400 mt-0.5">{od} hrs</p>
        </div>
      </div>
      
    </div>
  );
};

export default AttendanceCard;
