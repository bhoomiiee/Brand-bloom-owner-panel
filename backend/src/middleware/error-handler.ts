import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { formatErrorResponse } from '../shared/errors/error-response.js';
import { logger } from '../config/logger.js';

import { ERROR_CODES } from '../shared/errors/error-codes.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let finalError = err;
  if (err?.name === 'CastError' || err?.name === 'BSONError') {
    finalError = new AppError('Invalid identifier format', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const statusCode = finalError instanceof AppError ? finalError.statusCode : 500;
  
  if (statusCode >= 500) {
    logger.error(`[${req.requestId || 'REQ'}] Unhandled Server Error:`, finalError);
  } else {
    logger.warn(`[${req.requestId || 'REQ'}] Client Error:`, finalError.message);
  }

  const payload = formatErrorResponse(finalError, req.requestId);
  res.status(statusCode).json(payload);
}
