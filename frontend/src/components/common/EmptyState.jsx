import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="glass-panel border rounded-3xl p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-lg font-display font-semibold text-slate-950 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
