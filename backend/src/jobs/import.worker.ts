import { logger } from '../config/logger.js';

export function startImportWorker() {
  logger.info('Registered Import Worker handler.');
}

export async function processImportJob(jobId: string) {
  logger.info(`Processing catalog import job ${jobId}...`);
}
