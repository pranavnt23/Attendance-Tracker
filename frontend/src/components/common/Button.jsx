import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  ariaLabel,
  ...props
}) => {
  // Styles for different variants
  const variants = {
    primary: 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 focus:ring-brand-primary/50',
    secondary: 'bg-slate-100 text-slate-800 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-500/30',
    outline: 'bg-transparent border border-slate-300 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 focus:ring-slate-500/20',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 focus:ring-slate-500/10',
    danger: 'bg-rose-500 text-white shadow-md shadow-rose-500/10 hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/20 focus:ring-rose-500/50',
    success: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 focus:ring-emerald-500/50'
  };

  // Styles for different sizes (touch target spacing >= 44px on mobile via padding)
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[36px]',
    md: 'px-4.5 py-2.5 text-sm rounded-2xl min-h-[44px]',
    lg: 'px-6 py-3.5 text-base rounded-2xl min-h-[50px]'
  };

  const isBtnDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isBtnDisabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center font-semibold tracking-wide 
        transition-all duration-200 active:scale-[0.98] cursor-pointer 
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950
        disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Left Icon */}
      {!loading && LeftIcon && (
        <span className="inline-flex shrink-0 -ml-0.5 mr-2">
          {React.isValidElement(LeftIcon) ? LeftIcon : <LeftIcon className="w-4 h-4" />}
        </span>
      )}

      {/* Button Content */}
      <span className="truncate">{children}</span>

      {/* Right Icon */}
      {!loading && RightIcon && (
        <span className="inline-flex shrink-0 ml-2 -mr-0.5">
          {React.isValidElement(RightIcon) ? RightIcon : <RightIcon className="w-4 h-4" />}
        </span>
      )}
    </button>
  );
};

export default Button;
