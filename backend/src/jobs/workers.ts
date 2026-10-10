import { logger } from '../config/logger.js';
import { startImportWorker } from './import.worker.js';
import { startNotificationWorker } from './notification.worker.js';
import { startPaymentWorker } from './payment-reconciliation.worker.js';
import { startCleanupWorker } from './cleanup.worker.js';

export function initializeWorkers() {
  logger.info('Starting background workers...');
  startImportWorker();
  startNotificationWorker();
  startPaymentWorker();
  startCleanupWorker();
}
