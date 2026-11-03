import type { IAuthRepository } from '@/services/contracts/auth.repository';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  AuthTokens,
  User,
} from '@/features/auth/types';

export class AuthMockAdapter implements IAuthRepository {
  private currentUser: User = {
    id: 'usr-admin-1',
    name: 'Alex Rivera',
    email: 'admin@example.com',
    role: 'Frontend Architect',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  };

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await this.delay(200);
    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: {
        ...this.currentUser,
        email: payload.email || this.currentUser.email,
        name: payload.email.split('@')[0] || this.currentUser.name,
      },
    };
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await this.delay(200);
    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: 'User',
      },
    };
  }

  async refresh(_refreshToken: string): Promise<AuthTokens> {
    await this.delay(100);
    return {
      accessToken: `mock_refreshed_access_${Date.now()}`,
      refreshToken: `mock_refreshed_refresh_${Date.now()}`,
    };
  }

  async getMe(): Promise<User> {
    await this.delay(100);
    return this.currentUser;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
