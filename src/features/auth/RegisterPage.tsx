import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { registerSchema, type RegisterFormData } from './schemas';
import { useRegisterMutation } from './hooks';
import { useAuthStore, selectIsAuthenticated } from '@/store';
import { Input, Button, LoadingScreen } from '@/components/ui';

export const RegisterPage: React.FC = () => {
  const { mutate: registerUser, isPending, isSuccess, data } = useRegisterMutation();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && !isPending && !isSuccess) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isPending, isSuccess, navigate]);

  const onSubmit = (formData: RegisterFormData) => {
    registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  // Render loader spinner after user registers or while registration is processing
  if (isPending || isSuccess) {
    const userName = data?.user?.name;
    const message = isSuccess
      ? `Account created${userName ? `, ${userName}` : ''}! Preparing your workspace...`
      : 'Setting up your new account...';

    return <LoadingScreen message={message} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Create an account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Get started with your production-grade application
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          required
          startIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          required
          startIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          startIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          startIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isPending}
          rightIcon={<UserPlus className="h-4 w-4" />}
        >
          Create account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-brand-600 hover:text-brand-500 hover:underline dark:text-brand-400"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
