import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  disabled = false,
  className = '',
  inputClassName = '',
  helperText,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative rounded-2xl">
        {/* Left Icon if present */}
        {LeftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none">
            {React.isValidElement(LeftIcon) ? LeftIcon : <LeftIcon className="w-5 h-5" />}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full py-3 text-sm rounded-2xl border transition-all duration-200 focus:outline-none 
            bg-slate-100/50 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400
            dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500
            focus:ring-2 focus:ring-brand-primary/20
            disabled:opacity-50 disabled:bg-slate-100/30 dark:disabled:bg-slate-900/30 disabled:pointer-events-none
            ${LeftIcon ? 'pl-11' : 'pl-4'}
            ${RightIcon || isPassword ? 'pr-11' : 'pr-4'}
            ${error 
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' 
              : 'border-slate-200 dark:border-slate-800/80 focus:border-brand-primary focus:ring-brand-primary/25'
            }
            ${inputClassName}
          `}
          {...props}
        />

        {/* Right Action (e.g. Password Toggle or Custom Right Icon) */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            disabled={disabled}
            tabIndex="-1"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : RightIcon ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 dark:text-slate-500">
            {React.isValidElement(RightIcon) ? RightIcon : <RightIcon className="w-5 h-5" />}
          </div>
        ) : null}
      </div>

      {/* Helper Text or Error message */}
      {error ? (
        <p className="text-[10px] text-rose-550 dark:text-rose-400 font-bold mt-1 animate-pulse">
          {typeof error === 'string' ? error : error.message}
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
