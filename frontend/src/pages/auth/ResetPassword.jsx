import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ArrowLeft, UserSquare, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const initialRegNo = searchParams.get('reg') || '';

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      register_no: initialRegNo,
      new_password: '',
      confirm_password: '',
    }
  });

  useEffect(() => {
    if (initialRegNo) {
      setValue('register_no', initialRegNo);
    }
  }, [initialRegNo, setValue]);

  const passwordValue = watch('new_password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const resp = await authService.resetPassword(data.register_no, data.new_password);
      if (resp.success) {
        setIsSuccess(true);
        // Wait 3 seconds and redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setApiError(resp.message || 'Password reset failed.');
      }
    } catch (e) {
      setApiError(e.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto mb-4 border border-emerald-500/20">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Password Updated!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your account password has been updated successfully. You will be redirected to the sign-in screen shortly...
        </p>
        <Link 
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
        >
          Go to Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Set New Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide a strong, secure password for your account.
        </p>
      </div>

      {apiError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Register Number (Read-only) */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Register Number
          </label>
          <div className="relative">
            <UserSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. 20L101"
              {...register('register_no', { required: 'Register number is required' })}
              className="w-full pl-11 pr-4 py-3 bg-slate-100/30 border border-slate-200 dark:border-slate-850 text-sm rounded-2xl focus:outline-none dark:bg-slate-900/40 text-slate-500 cursor-not-allowed"
              readOnly={!!initialRegNo}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* New Password Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            New Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('new_password', { 
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className={`w-full pl-11 pr-4 py-3 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-900 border text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all ${
                errors.new_password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.new_password && (
            <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.new_password.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirm_password', { 
                required: 'Please confirm your password',
                validate: value => value === passwordValue || 'Passwords do not match'
              })}
              className={`w-full pl-11 pr-4 py-3 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-900 border text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all ${
                errors.confirm_password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.confirm_password && (
            <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.confirm_password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Updating Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
