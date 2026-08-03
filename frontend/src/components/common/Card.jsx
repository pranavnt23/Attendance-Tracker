import React from 'react';

const Card = ({
  children,
  className = '',
  interactive = false,
  title,
  subtitle,
  headerActions,
  footer,
  ...props
}) => {
  return (
    <div
      className={`
        glass-panel card-shimmer-top rounded-3xl p-5 md:p-6
        ${interactive ? 'interactive-card cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Header section if title, subtitle or headerActions is present */}
      {(title || subtitle || headerActions) && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
          <div className="space-y-1">
            {title && (
              <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="w-full">
        {children}
      </div>

      {/* Footer section if footer is present */}
      {footer && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
