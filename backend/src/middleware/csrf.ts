import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';

/**
 * CSRF protection middleware for cookie-based authentication.
 * Verifies Origin and Referer headers on state-changing HTTP requests (POST, PUT, PATCH, DELETE).
 * Safe methods (GET, HEAD, OPTIONS) are exempt.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // If no origin or referer provided (e.g., API clients, curl, testing tools), allow if not a browser cross-origin request
  const requestOrigin = origin || (referer ? new URL(referer).origin : undefined);

  if (!requestOrigin) {
    // Non-browser or direct API client
    return next();
  }

  // Check against allowed origins
  const isAllowedConfigured = env.CORS_ORIGIN_LIST.some((allowedOrigin) => {
    if (allowedOrigin === '*') return true;
    try {
      const allowedUrl = new URL(allowedOrigin);
      const reqUrl = new URL(requestOrigin);
      return allowedUrl.origin === reqUrl.origin;
    } catch {
      return allowedOrigin === requestOrigin;
    }
  });

  const isAllowedDev = env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin);
  const allowed = isAllowedConfigured || isAllowedDev;

  if (!allowed) {
    return next(
      new AppError(
        `Cross-site request blocked: origin '${requestOrigin}' is not authorized`,
        403,
        ERROR_CODES.FORBIDDEN
      )
    );
  }

  return next();
}
