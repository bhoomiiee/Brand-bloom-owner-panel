export const QUEUE_NAMES = {
  IMPORTS: 'catalog-imports',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payment-reconciliation',
  CLEANUP: 'system-cleanup'
} as const;

export interface JobOptions {
  attempts?: number;
  backoffMs?: number;
}
