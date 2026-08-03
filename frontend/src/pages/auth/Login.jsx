import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { KeyRound, UserSquare } from 'lucide-react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

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
        <InputField
          label="Register Number / Roll Number"
          type="text"
          placeholder="e.g. 20L101"
          leftIcon={UserSquare}
          error={errors.register_no}
          disabled={isAuthenticating}
          {...register('register_no', { 
            required: 'Register number is required',
            minLength: { value: 1, message: 'Too short' }
          })}
        />

        {/* Password Input */}
        <InputField
          label={
            <div className="flex justify-between items-center w-full">
              <span>Password</span>
              <Link 
                to="/forgot-password" 
                className="text-xs font-bold text-brand-primary dark:text-indigo-400 hover:underline normal-case tracking-normal font-sans"
              >
                Forgot Password?
              </Link>
            </div>
          }
          type="password"
          placeholder="••••••••"
          leftIcon={KeyRound}
          error={errors.password}
          disabled={isAuthenticating}
          {...register('password', { 
            required: 'Password is required',
            minLength: { value: 4, message: 'Password is too short' }
          })}
        />

        {/* Submit Action */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={isAuthenticating}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default Login;
