import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { loginSchema, type LoginFormData } from './schemas';
import { useLoginMutation } from './hooks';
import { useAuthStore, selectIsAuthenticated, selectCurrentUser } from '@/store';
import { Input, Button, LoadingScreen } from '@/components/ui';

export const LoginPage: React.FC = () => {
  const { mutate: login, isPending, isSuccess, data } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const currentUser = useAuthStore(selectCurrentUser);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Redirect if already authenticated and not in the middle of logging in
  useEffect(() => {
    if (isAuthenticated && !isPending && !isSuccess) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isPending, isSuccess, navigate]);

  const onSubmit = (formData: LoginFormData) => {
    login(formData);
  };

  const handleFillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password@123', { shouldValidate: true });
  };

  // Render loader spinner after user logs in or while authentication is in progress
  if (isPending || isSuccess) {
    const displayName = data?.user?.name || currentUser?.name;
    const message = isSuccess
      ? `Welcome back${displayName ? `, ${displayName}` : ''}! Preparing your workspace...`
      : 'Authenticating your credentials...';

    return <LoadingScreen message={message} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
        <p className="text-xs text-slate-400">Enter your credentials to access your workspace</p>
      </div>

      {/* Quick Demo Credentials Switcher */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-2">
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 text-center">
          ⚡ Quick Fill Demo Accounts
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo('alex@example.com')}
            className="flex items-center justify-center gap-1.5 text-xs py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            <span>Alex (Owner)</span>
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('sarah@example.com')}
            className="flex items-center justify-center gap-1.5 text-xs py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Sarah (Admin)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          required
          startIcon={<Mail className="h-4 w-4 text-slate-400" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            startIcon={<Lock className="h-4 w-4 text-slate-400" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-slate-400 hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-lg shadow-brand-600/30 transition-all"
          isLoading={isPending}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-brand-400 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
