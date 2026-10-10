import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';
import { ApiResponse } from '../../shared/http/api-response.js';
import { asyncHandler } from '../../shared/http/async-handler.js';

const COOKIE_NAME = 'sid';

function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none',
    path: '/'
  });
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    setSessionCookie(res, result.sessionId);
    res.status(201).json(ApiResponse.created(result));
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body.email, req.body.password, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    setSessionCookie(res, result.sessionId);
    res.json(ApiResponse.success(result));
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const sessionId =
      req.cookies?.[COOKIE_NAME] ||
      (req.headers['x-session-id'] as string) ||
      (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : undefined);

    if (sessionId) {
      await authService.logout(sessionId);
    }

    clearSessionCookie(res);
    res.json(ApiResponse.success({ message: 'Logged out successfully' }));
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    res.json(ApiResponse.success({ user: req.user }));
  })
};
