import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';
import { hashPassword, comparePassword } from '../../utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '../../utils/apiError';
import { AuthUserPayload } from '../../types/auth.types';

export class AuthService {
  // register method
  static async register(input: RegisterInput) {
    const existing = await AuthRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await AuthRepository.createUser({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    const authPayload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      accountStatus: user.accountStatus,
    };

    const accessToken = generateAccessToken(authPayload);
    const refreshToken = generateRefreshToken(authPayload);

    // 7 days expiration for refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        workspaces: [],
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async login(input: LoginInput) {
    const user = await AuthRepository.findByEmail(input.email);
    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new ForbiddenError('Your account has been suspended or deactivated');
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update lastLoginAt
    await AuthRepository.updateLastLogin(user.id);

    const authPayload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      accountStatus: user.accountStatus,
    };

    const accessToken = generateAccessToken(authPayload);
    const refreshToken = generateRefreshToken(authPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    const userWithWorkspaces = await AuthRepository.findByIdWithWorkspaces(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        workspaces:
          userWithWorkspaces?.memberships.map((m) => ({
            id: m.workspace.id,
            name: m.workspace.name,
            slug: m.workspace.slug,
            description: m.workspace.description,
            role: m.role,
            joinedAt: m.joinedAt,
          })) ?? [],
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async refreshToken(oldRefreshToken: string) {
    // 1. Verify token signature
    const payload = verifyRefreshToken(oldRefreshToken);

    // 2. Check token record in database
    const tokenRecord = await AuthRepository.findRefreshToken(oldRefreshToken);
    if (
      !tokenRecord ||
      tokenRecord.userId !== payload.id ||
      tokenRecord.revoked ||
      new Date() > tokenRecord.expiresAt
    ) {
      throw new UnauthorizedError('Refresh token is invalid, revoked, or expired');
    }

    const user = tokenRecord.user;
    if (!user || user.deletedAt || user.accountStatus !== 'ACTIVE') {
      throw new UnauthorizedError('User account is inactive or deleted');
    }

    // 3. Token rotation: revoke old token and issue a fresh pair
    await AuthRepository.revokeRefreshToken(oldRefreshToken);

    const authPayload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      accountStatus: user.accountStatus,
    };

    const newAccessToken = generateAccessToken(authPayload);
    const newRefreshToken = generateRefreshToken(authPayload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AuthRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      await AuthRepository.revokeRefreshToken(refreshToken);
    }
  }

  static async getCurrentUser(userId: number) {
    const user = await AuthRepository.findByIdWithWorkspaces(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      workspaces: user.memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        description: m.workspace.description,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };
  }
}
