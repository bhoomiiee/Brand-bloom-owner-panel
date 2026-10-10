export interface NotificationJob {
  recipient: string;
  template: string;
  payload: Record<string, any>;
}
