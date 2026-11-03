import { apiClient } from '@/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';
import type { IAuthRepository } from '@/services/contracts/auth.repository';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  AuthTokens,
  User,
} from '@/features/auth/types';


interface BackendAuthResult {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthRestAdapter implements IAuthRepository {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<{data: BackendAuthResult}>(
      ENDPOINTS.AUTH.LOGIN,
      payload
    );
    const {user, tokens} = response.data.data;
    return{
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<{data: BackendAuthResult}>(ENDPOINTS.AUTH.REGISTER, payload);
    const {user, tokens} = response.data.data;
    return{
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
      const response = await apiClient.post<{ data: { accessToken: string; refreshToken?: string } }>(
        ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );
      return response.data.data;
    }
    async getMe(): Promise<User> {
      const response = await apiClient.get<{ data: User }>(ENDPOINTS.AUTH.ME);
      return response.data.data;
    }
  }
