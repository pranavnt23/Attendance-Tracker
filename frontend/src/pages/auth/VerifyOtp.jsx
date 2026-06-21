import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, UserSquare } from 'lucide-react';
import authService from '../../services/authService';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Extract register number from URL params
  const initialRegNo = searchParams.get('reg') || '';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      register_no: initialRegNo,
      otp: '',
    }
  });

  useEffect(() => {
    if (initialRegNo) {
      setValue('register_no', initialRegNo);
    }
  }, [initialRegNo, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const resp = await authService.verifyOtp(data.register_no, data.otp);
      if (resp.success) {
        // Route to password reset page
        navigate(`/reset-password?reg=${encodeURIComponent(data.register_no)}`);
      } else {
        setApiError(resp.message || 'OTP validation failed.');
      }
    } catch (e) {
      setApiError(e.response?.data?.detail || 'Invalid OTP code. Please verify and re-enter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Verify OTP Code
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter the 6-digit OTP code sent to your email to verify your identity.
        </p>
      </div>

      {apiError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Register Number (Hidden or Readonly) */}
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
              className="w-full pl-11 pr-4 py-3 bg-slate-100/30 border border-slate-200 dark:border-slate-850 text-sm rounded-2xl focus:outline-none dark:bg-slate-900/40 text-slate-500 cursor-not-allowed"
              readOnly={!!initialRegNo}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* OTP Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            6-Digit OTP Code
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              {...register('otp', { 
                required: 'OTP is required',
                minLength: { value: 6, message: 'OTP must be 6 digits' },
                maxLength: { value: 6, message: 'OTP must be 6 digits' }
              })}
              className={`w-full pl-11 pr-4 py-3 text-center tracking-widest font-mono font-bold bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-900 border text-md rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${
                errors.otp ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.otp && (
            <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.otp.message}</p>
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
              Verifying Code...
            </>
          ) : (
            'Verify OTP'
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

export default VerifyOtp;
