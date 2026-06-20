import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserSquare, ArrowLeft } from 'lucide-react';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { register_no: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const resp = await authService.forgotPassword(data.register_no);
      if (resp.success) {
        // Navigate to verify otp with query parameter
        navigate(`/verify-otp?reg=${encodeURIComponent(data.register_no)}`);
      } else {
        setApiError(resp.message || 'Verification email could not be sent.');
      }
    } catch (e) {
      setApiError(e.response?.data?.detail || 'Something went wrong. Please verify your Register Number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Reset Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your register number to receive a 6-digit OTP code on your registered email address.
        </p>
      </div>

      {apiError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Register Number / Roll Number
          </label>
          <div className="relative">
            <UserSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. 20L101"
              {...register('register_no', { required: 'Register number is required' })}
              className={`w-full pl-11 pr-4 py-3 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-900 border text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all ${
                errors.register_no ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.register_no && (
            <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.register_no.message}</p>
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
              Sending OTP...
            </>
          ) : (
            'Send OTP Code'
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

export default ForgotPassword;
