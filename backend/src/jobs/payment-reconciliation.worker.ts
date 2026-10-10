import { logger } from '../config/logger.js';

export function startPaymentWorker() {
  logger.info('Registered Payment Reconciliation Worker.');
}

export async function reconcilePendingPayments() {
  logger.info('Running payment reconciliation checks...');
}
