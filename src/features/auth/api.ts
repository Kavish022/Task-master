import { apiClient } from '@/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  AuthTokens,
  User,
} from './types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload);
    return data;
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>(ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    return data;
  },
};
