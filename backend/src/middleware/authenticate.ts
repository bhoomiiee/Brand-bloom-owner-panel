import { Request, Response, NextFunction } from 'express';
import { SessionModel } from '../modules/auth/session.model.js';
import { UserModel } from '../modules/users/users.model.js';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    let sessionId: string | undefined;

    // 1. Primary: HttpOnly cookie
    if (req.cookies && req.cookies.sid) {
      sessionId = req.cookies.sid;
    }

    // 2. Secondary: Header fallback (for API testing / Supertest)
    if (!sessionId && req.headers['x-session-id']) {
      sessionId = req.headers['x-session-id'] as string;
    }

    // 3. Fallback: Authorization Bearer header if holding session token
    if (!sessionId && req.headers.authorization?.startsWith('Bearer ')) {
      sessionId = req.headers.authorization.split(' ')[1];
    }

    if (!sessionId) {
      return next(new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED));
    }

    // Find active session in MongoDB
    const session = await SessionModel.findOne({
      sessionId,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return next(new AppError('Invalid or expired session', 401, ERROR_CODES.UNAUTHORIZED));
    }

    // Find user
    const user = await UserModel.findById(session.userId);
    if (!user) {
      return next(new AppError('User not found', 401, ERROR_CODES.UNAUTHORIZED));
    }

    req.session = session;
    req.user = user.toSafeObject();
    return next();
  } catch (error) {
    return next(error);
  }
}
