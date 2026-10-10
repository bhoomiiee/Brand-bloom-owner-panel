import { AppError } from './AppError.js';

export function formatErrorResponse(err: Error, requestId?: string) {
  if (err instanceof AppError) {
    return {
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
        requestId
      }
    };
  }

  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      requestId
    }
  };
}
