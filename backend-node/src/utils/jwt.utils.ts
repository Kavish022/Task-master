import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUserPayload } from '../types/auth.types';
import { UnauthorizedError } from './apiError';

export function generateAccessToken(payload: AuthUserPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function generateRefreshToken(payload: AuthUserPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AuthUserPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired');
    }
    throw new UnauthorizedError('Invalid access token');
  }
}

export function verifyRefreshToken(token: string): AuthUserPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthUserPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired');
    }
    throw new UnauthorizedError('Invalid refresh token');
  }
}
