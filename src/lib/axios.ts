import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ENV } from '@/config/env';
import { ENDPOINTS } from '@/config/endpoints';
import { useAuthStore } from '@/features/auth/store';
import type { NormalizedApiError } from '@/types/api';
import { handleMockApiRequest } from './mockBackend';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const defaultNativeAdapter = axios.getAdapter(axios.defaults.adapter);

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  adapter: async (config) => {
    // If mock mode is enabled, intercept with local in-memory mock handler
    if (ENV.enableMockApi) {
      const mockResponse = await handleMockApiRequest(config);
      if (mockResponse) {
        return mockResponse;
      }
    }
    // Otherwise delegate to standard Axios network adapter
    return defaultNativeAdapter(config);
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Standardize any server error response into { message, status, details }
 */
export const normalizeError = (error: unknown): NormalizedApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; details?: unknown }>;
    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.message;

    let message = serverMessage || axiosError.message;
    if (status === 401) {
      message = 'Your session has expired. Please log in again.';
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      message = 'The requested resource was not found.';
    } else if (status && status >= 500) {
      message = 'An unexpected server error occurred. Please try again later.';
    } else if (!status && axiosError.code === 'ERR_NETWORK') {
      message = 'Network error: Unable to reach the server.';
    }

    return {
      message,
      status,
      details: axiosError.response?.data?.details ?? axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred.',
    details: error,
  };
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // Handle 401 Unauthorized token refresh
    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== ENDPOINTS.AUTH.LOGIN &&
      originalRequest.url !== ENDPOINTS.AUTH.REFRESH
    ) {
      const { refreshToken, logout, setTokens } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{
          accessToken: string;
          refreshToken?: string;
        }>(
          `${ENV.apiBaseUrl}${ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken || refreshToken;

        setTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);
