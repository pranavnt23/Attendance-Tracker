import React from 'react';

const Tabs = ({
  options = [],
  activeId,
  onChange,
  className = '',
  buttonClassName = '',
  ...props
}) => {
  return (
    <div
      role="tablist"
      className={`
        inline-flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl 
        border border-slate-200/50 dark:border-slate-700/50
        min-h-[40px] items-center gap-1
        ${className}
      `}
      {...props}
    >
      {options.map((opt) => {
        const isActive = activeId === opt.id;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`
              px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border-0 cursor-pointer
              focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900
              ${isActive
                ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm font-extrabold scale-[1.02]'
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
              }
              ${buttonClassName}
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
