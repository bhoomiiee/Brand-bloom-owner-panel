import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.membership) {
      return next(new AppError('Store membership context required', 403, ERROR_CODES.FORBIDDEN));
    }

    if (req.membership.status !== 'active') {
      return next(new AppError('Store membership is not active', 403, ERROR_CODES.FORBIDDEN));
    }

    if (req.membership.role === 'owner') {
      return next(); // Owners have blanket permissions over their store
    }

    // Prohibit staff from owner-only management operations
    const restrictedOwnerPermissions = [
      'manage:members',
      'manage:store',
      'billing:manage',
      'ownership:transfer'
    ];

    if (restrictedOwnerPermissions.includes(permission)) {
      return next(new AppError(`Action requires Owner permissions: ${permission}`, 403, ERROR_CODES.FORBIDDEN));
    }

    // Default staff permissions for viewing operational resources
    const defaultStaffPermissions = [
      'store:read',
      'dashboard:read',
      'products:read',
      'inventory:read',
      'orders:read',
      'customers:read',
      'promotions:read',
      'campaigns:read'
    ];

    const grantedPermissions = (req.membership as any).permissions || [];

    if (defaultStaffPermissions.includes(permission) || grantedPermissions.includes(permission)) {
      return next();
    }

    return next(new AppError(`Missing required permission: ${permission}`, 403, ERROR_CODES.INSUFFICIENT_PERMISSIONS));
  };
}

