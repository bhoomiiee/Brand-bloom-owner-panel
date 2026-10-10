import { Request, Response, NextFunction } from 'express';
import { SessionModel } from '../modules/auth/session.model.js';
import { UserModel } from '../modules/users/users.model.js';

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const sessionId =
      req.cookies?.sid ||
      (req.headers['x-session-id'] as string) ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);

    if (!sessionId) {
      return next();
    }

    const session = await SessionModel.findOne({
      sessionId,
      expiresAt: { $gt: new Date() }
    });

    if (session) {
      const user = await UserModel.findById(session.userId);
      if (user) {
        req.session = session;
        req.user = user.toSafeObject();
      }
    }

    return next();
  } catch {
    // Continue anonymously
    return next();
  }
}
