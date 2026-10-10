import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthTokenPayload } from '../../types/auth.types.js';

export const tokenService = {
  generateTokens(payload: AuthTokenPayload) {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    } as any);

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN
    } as any);

    return { accessToken, refreshToken };
  }
};
