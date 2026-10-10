import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';
import { MembershipRole } from '../modules/memberships/memberships.model.js';

/**
 * Enforces that the authenticated user possesses the required store membership role.
 * e.g., requireRole('owner') ensures only store owners can proceed.
 */
export function requireRole(...allowedRoles: MembershipRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.membership) {
      return next(new AppError('Store membership context required', 403, ERROR_CODES.FORBIDDEN));
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return next(
        new AppError(
          `Operation forbidden: requires one of [${allowedRoles.join(', ')}] role`,
          403,
          ERROR_CODES.INSUFFICIENT_PERMISSIONS
        )
      );
    }

    return next();
  };
}
