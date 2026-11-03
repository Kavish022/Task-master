import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '@/services';
import { useAuthStore, selectIsAuthenticated } from '@/store';
import { queryClient } from '@/lib/queryClient';
import type { LoginPayload, RegisterPayload } from './types';
import type { NormalizedApiError } from '@/types/api';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  me: () => [...AUTH_KEYS.all, 'me'] as const,
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      login(
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        data.user
      );
      toast.success(`Welcome back, ${data.user.name}!`);

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      // Provide a smooth loader screen transition after logging in
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 800);
    },
    onError: (error: NormalizedApiError) => {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });
};

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      login(
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
        data.user
      );
      toast.success('Account created successfully! Welcome aboard.');
      // Provide a smooth loader screen transition after registering
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 800);
    },
    onError: (error: NormalizedApiError) => {
      toast.error(error.message || 'Registration failed.');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    queryClient.clear();
    toast.success('Successfully logged out.');
    navigate('/login', { replace: true });
  };
};

export const useCurrentUserQuery = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: AUTH_KEYS.me(),
    queryFn: async () => {
      const user = await authService.getMe();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};
