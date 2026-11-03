import { QueryClient } from '@tanstack/react-query';
import type { NormalizedApiError } from '@/types/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        const apiError = error as unknown as NormalizedApiError;
        // Do not retry on client unauthorized or not found errors
        if (
          apiError?.status === 401 ||
          apiError?.status === 403 ||
          apiError?.status === 404
        ) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
