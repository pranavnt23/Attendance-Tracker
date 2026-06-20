import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { KeyRound, UserSquare } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticating, error } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      register_no: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      const resp = await login({
        register_no: data.register_no,
        password: data.password
      });
      // Redirect based on role
      if (resp.role === 'attendance_rep') {
        navigate('/rep/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      console.error("Login failed:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Sign In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your institute credentials to access the portal
        </p>
      </div>

      {/* Global error banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center animate-pulse">
          {error?.response?.data?.detail || 'Invalid Register Number or Password. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Register Number Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Register Number / Roll Number
          </label>
          <div className="relative">
            <UserSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. 20L101"
              {...register('register_no', { 
                required: 'Register number is required',
                minLength: { value: 1, message: 'Too short' }
              })}
              className={`w-full pl-11 pr-4 py-3 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-900 border text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all ${
                errors.register_no ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              disabled={isAuthenticating}
            />
          </div>
          {errors.register_no && (
            <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.register_no.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs font-bold text-brand-primary dark:text-indigo-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 4, message: 'Password is too short' }
              })}
              className={`w-full pl-11 pr-4 py-3 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-900 border text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all ${
                errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
              }`}
              disabled={isAuthenticating}
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-rose-500 font-bold mt-1.5">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Verifying Credentials...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
