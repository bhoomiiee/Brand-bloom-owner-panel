import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAYMENT_PROCESSING', 'CANCELLED'],
  PAYMENT_PROCESSING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['FULFILLED', 'CANCELLED'],
  FULFILLED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: []
};

export function assertValidTransition(currentStatus: string, nextStatus: string): void {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      `Cannot transition order status from ${currentStatus} to ${nextStatus}`,
      400,
      ERROR_CODES.CONFLICT
    );
  }
}
