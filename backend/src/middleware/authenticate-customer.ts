import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { CustomerAuthPayload } from '../modules/customers/customers.service.js';
import { AppError } from '../shared/errors/AppError.js';
import { ERROR_CODES } from '../shared/errors/error-codes.js';

declare global {
  namespace Express {
    interface Request {
      customer?: CustomerAuthPayload;
    }
  }
}

export function authenticateCustomer(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Customer authentication required', 401, ERROR_CODES.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as CustomerAuthPayload;
    if (payload.role !== 'customer') {
      return next(new AppError('Invalid customer token', 401, ERROR_CODES.UNAUTHORIZED));
    }
    req.customer = payload;
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired customer token', 401, ERROR_CODES.UNAUTHORIZED));
  }
}
