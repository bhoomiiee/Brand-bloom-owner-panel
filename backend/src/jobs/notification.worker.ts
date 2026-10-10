import { logger } from '../config/logger.js';

export function startNotificationWorker() {
  logger.info('Registered Notification Worker handler.');
}

export async function processNotification(recipient: string, template: string) {
  logger.info(`Dispatching notification [${template}] to ${recipient}`);
}
