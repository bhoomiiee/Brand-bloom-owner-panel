import { logger } from '../config/logger.js';

export function startCleanupWorker() {
  logger.info('Registered Session & Draft Cleanup Worker.');
}
