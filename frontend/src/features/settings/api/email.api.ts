import { apiClient } from '../../../lib/api-client';

export interface EmailStatusResponse {
  isConfigured: boolean;
  provider: 'resend' | 'smtp' | 'none';
  from: string;
  environment: string;
}

export interface SendTestEmailResponse {
  provider: string;
  messageId?: string;
  recipient: string;
  message: string;
}

export const emailApi = {
  getStatus: () => apiClient<EmailStatusResponse>('/email/status'),
  sendTestEmail: (to: string) =>
    apiClient<SendTestEmailResponse>('/email/test', {
      method: 'POST',
      body: JSON.stringify({ to })
    })
};
