import React from 'react';

const Loader = ({ size = 'medium', message }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-4',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className={`${sizeClasses[size]} border-slate-200 border-t-indigo-600 rounded-full animate-spin dark:border-slate-800 dark:border-t-indigo-400`}
      />
      {message && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
