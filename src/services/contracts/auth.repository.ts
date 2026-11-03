import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  AuthTokens,
  User,
} from '@/features/auth/types';

/**
 * Transport-agnostic contract for authentication & identity operations.
 */
export interface IAuthRepository {
  login(payload: LoginPayload): Promise<AuthResponse>;
  register(payload: RegisterPayload): Promise<AuthResponse>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  getMe(): Promise<User>;
}
