import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';
import { StoreMembershipModel } from '../modules/memberships/memberships.model.js';
import { StoreModel } from '../modules/stores/stores.model.js';

export async function requireMembership(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.storeId) {
      return next(new AppError('Authentication and Store ID context required', 401, ERROR_CODES.UNAUTHORIZED));
    }

    const membership = await StoreMembershipModel.findOne({
      storeId: req.storeId,
      userId: req.user.id,
      status: 'active'
    });

    if (!membership) {
      return next(new AppError('You do not have access to this store', 403, ERROR_CODES.FORBIDDEN));
    }

    const store = await StoreModel.findById(req.storeId);
    if (!store) {
      return next(new AppError('Store not found', 404, ERROR_CODES.NOT_FOUND));
    }

    req.membership = membership;
    req.store = store;
    return next();
  } catch (error) {
    return next(error);
  }
}
