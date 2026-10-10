import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';

export function resolveStore(req: Request, _res: Response, next: NextFunction) {
  const storeId =
    (req.params.storeId as string) ||
    (req.params.id as string) ||
    (req.headers['x-store-id'] as string);

  if (!storeId) {
    return next(new AppError('Store identifier is required', 400, ERROR_CODES.STORE_REQUIRED));
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return next(new AppError('Invalid store ID format', 400, ERROR_CODES.VALIDATION_ERROR));
  }

  req.storeId = storeId;
  return next();
}
