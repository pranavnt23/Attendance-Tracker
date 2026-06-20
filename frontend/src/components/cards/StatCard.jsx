import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtext }) => {
  const colorMaps = {
    indigo: 'from-indigo-500/10 to-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    rose: 'from-rose-500/10 to-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  const selectedColor = colorMaps[color] || colorMaps.indigo;

  return (
    <div className={`glass-panel border rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in`}>
      <div className="overflow-hidden flex-1 min-w-0 pr-3">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-3xl font-display font-bold text-slate-900 dark:text-white truncate">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtext}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedColor} flex items-center justify-center shrink-0 border`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
